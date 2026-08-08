-- Two-topic debate programs and a frozen speaker-request electorate.

create table if not exists public.debate_topics (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  motion text not null,
  sort_order integer not null check (sort_order >= 0),
  created_at timestamptz not null default now(),
  unique (event_id, sort_order),
  unique (event_id, id)
);

alter table public.debate_topics enable row level security;

create policy "public can read debate topics"
  on public.debate_topics for select
  using (true);

insert into public.debate_topics (event_id, motion, sort_order)
select events.id, events.title, 0
from public.events
where not exists (
  select 1 from public.debate_topics
  where debate_topics.event_id = events.id
);

alter table public.activities
  add column if not exists topic_id uuid,
  add column if not exists sort_order integer not null default 0;

update public.activities
set topic_id = topics.id,
    sort_order = case activities.phase
      when 'pre_debate' then 0
      when 'speaker_challenge' then 1
      when 'post_debate' then 2
      else activities.sort_order
    end
from public.debate_topics as topics
where topics.event_id = activities.event_id
  and topics.sort_order = 0
  and activities.topic_id is null
  and activities.phase in ('pre_debate', 'speaker_challenge', 'post_debate');

alter table public.activities
  drop constraint if exists activities_event_topic_fk;

alter table public.activities
  add constraint activities_event_topic_fk
  foreign key (event_id, topic_id)
  references public.debate_topics(event_id, id)
  on delete cascade;

alter table public.activities
  drop constraint if exists activities_debate_topic_required_check;

alter table public.activities
  add constraint activities_debate_topic_required_check
  check (
    phase not in ('pre_debate', 'speaker_challenge', 'post_debate')
    or topic_id is not null
  );

alter table public.activities
  drop constraint if exists activities_sort_order_check;

alter table public.activities
  add constraint activities_sort_order_check
  check (sort_order >= 0);

create unique index if not exists activities_topic_phase_unique_idx
  on public.activities(topic_id, phase)
  where topic_id is not null
    and phase in ('pre_debate', 'speaker_challenge', 'post_debate');

create index if not exists activities_event_topic_order_idx
  on public.activities(event_id, topic_id, sort_order);

create table if not exists public.speaker_electorate (
  event_id uuid not null references public.events(id) on delete cascade,
  device_id text not null,
  joined_at timestamptz not null default now(),
  primary key (event_id, device_id)
);

create index if not exists speaker_electorate_event_joined_idx
  on public.speaker_electorate(event_id, joined_at);

alter table public.speaker_electorate enable row level security;

create table if not exists public.speaker_rounds (
  activity_id uuid not null references public.activities(id) on delete cascade,
  round integer not null check (round > 0),
  enrollment_cutoff timestamptz not null,
  eligible_count integer not null check (eligible_count >= 0),
  threshold_count integer not null check (threshold_count >= 0),
  reached_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (activity_id, round)
);

alter table public.speaker_rounds
  drop constraint if exists speaker_rounds_exact_threshold_check;

alter table public.speaker_rounds
  add constraint speaker_rounds_exact_threshold_check
  check (threshold_count = ceil(eligible_count / 2.0)::integer);

alter table public.speaker_rounds enable row level security;

create or replace function public.join_speaker_electorate(p_token uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_device_id text;
  v_event_id uuid;
  v_event_status text;
begin
  select device_id, event_id
    into v_device_id, v_event_id
    from device_tokens
   where token = p_token;

  if v_device_id is null then
    raise exception 'invalid_token';
  end if;

  select status into v_event_status
    from events
   where id = v_event_id
   for update;

  if v_event_status is null or v_event_status in ('ended', 'archived') then
    raise exception 'event_not_active';
  end if;

  insert into speaker_electorate(event_id, device_id)
  values (v_event_id, v_device_id)
  on conflict (event_id, device_id) do nothing;
end;
$$;

create or replace function public.get_speaker_participation(
  p_token uuid,
  p_activity_id uuid
)
returns table(
  round integer,
  joined boolean,
  eligible boolean,
  requested boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_device_id text;
  v_token_event_id uuid;
  v_activity_event_id uuid;
  v_activity_phase text;
  v_round integer;
  v_cutoff timestamptz;
begin
  select device_id, event_id
    into v_device_id, v_token_event_id
    from device_tokens
   where token = p_token;

  if v_device_id is null then
    raise exception 'invalid_token';
  end if;

  select event_id, phase, challenge_round
    into v_activity_event_id, v_activity_phase, v_round
    from activities
   where id = p_activity_id;

  if v_activity_event_id is null then
    raise exception 'activity_not_found';
  end if;

  if v_activity_event_id <> v_token_event_id then
    raise exception 'invalid_token';
  end if;

  if v_activity_phase <> 'speaker_challenge' then
    raise exception 'invalid_activity';
  end if;

  select enrollment_cutoff into v_cutoff
    from speaker_rounds
   where activity_id = p_activity_id
     and speaker_rounds.round = v_round;

  return query
  select
    v_round,
    exists (
      select 1 from speaker_electorate
       where event_id = v_token_event_id
         and device_id = v_device_id
    ),
    exists (
      select 1 from speaker_electorate
       where event_id = v_token_event_id
         and device_id = v_device_id
         and v_cutoff is not null
         and joined_at <= v_cutoff
    ),
    exists (
      select 1 from speaker_ballots
       where activity_id = p_activity_id
         and speaker_ballots.round = v_round
         and device_id = v_device_id
         and choice = 'next'
    );
end;
$$;

create or replace function public.set_next_speaker_request(
  p_token uuid,
  p_activity_id uuid,
  p_expected_round integer,
  p_requested boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_device_id text;
  v_token_event_id uuid;
  v_activity_event_id uuid;
  v_activity_status text;
  v_activity_phase text;
  v_challenge_round integer;
  v_voting_opens_at timestamptz;
  v_challenge_paused boolean;
  v_event_status text;
  v_cutoff timestamptz;
  v_eligible_count integer;
  v_threshold_count integer;
  v_reached_at timestamptz;
  v_next_votes integer;
begin
  select device_id, event_id
    into v_device_id, v_token_event_id
    from device_tokens
   where token = p_token;

  if v_device_id is null then
    raise exception 'invalid_token';
  end if;

  select status into v_event_status
    from events
   where id = v_token_event_id
   for update;

  if v_event_status is null or v_event_status in ('ended', 'archived') then
    raise exception 'event_not_active';
  end if;

  select event_id, status, phase, challenge_round, voting_opens_at,
         challenge_paused
    into v_activity_event_id, v_activity_status, v_activity_phase,
         v_challenge_round, v_voting_opens_at, v_challenge_paused
    from activities
   where id = p_activity_id
   for update;

  if v_activity_event_id is null then
    raise exception 'activity_not_found';
  end if;

  if v_activity_event_id <> v_token_event_id then
    raise exception 'invalid_token';
  end if;

  if v_activity_phase <> 'speaker_challenge' then
    raise exception 'invalid_activity';
  end if;

  if p_expected_round is null or v_challenge_round <> p_expected_round then
    raise exception 'stale_round';
  end if;

  if v_activity_status <> 'open' then
    raise exception 'poll_not_open';
  end if;

  if v_challenge_paused then
    raise exception 'speaker_paused';
  end if;

  if v_voting_opens_at is null or now() < v_voting_opens_at then
    raise exception 'voting_not_open_yet';
  end if;

  select enrollment_cutoff, eligible_count, threshold_count, reached_at
    into v_cutoff, v_eligible_count, v_threshold_count, v_reached_at
    from speaker_rounds
   where activity_id = p_activity_id
     and round = v_challenge_round
   for update;

  if v_cutoff is null then
    raise exception 'speaker_round_not_found';
  end if;

  if v_reached_at is not null then
    raise exception 'threshold_reached';
  end if;

  if not exists (
    select 1 from speaker_electorate
     where event_id = v_token_event_id
       and device_id = v_device_id
       and joined_at <= v_cutoff
  ) then
    raise exception 'not_eligible_current_round';
  end if;

  if coalesce(p_requested, false) then
    insert into speaker_ballots(activity_id, round, device_id, choice)
    values (p_activity_id, v_challenge_round, v_device_id, 'next')
    on conflict (activity_id, round, device_id) do update
      set choice = 'next',
          updated_at = now();
  else
    delete from speaker_ballots
     where activity_id = p_activity_id
       and round = v_challenge_round
       and device_id = v_device_id;
  end if;

  select count(*)::integer into v_next_votes
    from speaker_ballots
   where activity_id = p_activity_id
     and round = v_challenge_round
     and choice = 'next';

  if v_eligible_count > 0 and v_next_votes >= v_threshold_count then
    update speaker_rounds
       set reached_at = coalesce(reached_at, now())
     where activity_id = p_activity_id
       and round = v_challenge_round;
  end if;

  update activities
     set challenge_revision = challenge_revision + 1
   where id = p_activity_id;
end;
$$;

-- Older clients must not be able to write the obsolete Keep/Next ballot.
revoke all on function public.set_speaker_ballot(uuid, uuid, integer, text) from public;
revoke all on function public.set_speaker_ballot(uuid, uuid, integer, text)
  from anon, authenticated;
revoke all on function public.get_speaker_ballot(uuid, uuid) from public;
revoke all on function public.get_speaker_ballot(uuid, uuid)
  from anon, authenticated;

revoke all on function public.join_speaker_electorate(uuid) from public;
revoke all on function public.get_speaker_participation(uuid, uuid) from public;
revoke all on function public.set_next_speaker_request(uuid, uuid, integer, boolean) from public;

grant execute on function public.join_speaker_electorate(uuid) to anon, authenticated;
grant execute on function public.get_speaker_participation(uuid, uuid) to anon, authenticated;
grant execute on function public.set_next_speaker_request(uuid, uuid, integer, boolean)
  to anon, authenticated;

create or replace function public.snapshot_speaker_round(
  p_activity_id uuid,
  p_round integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event_id uuid;
  v_cutoff timestamptz := now();
  v_eligible_count integer;
begin
  select event_id into v_event_id
    from activities
   where id = p_activity_id
     and phase = 'speaker_challenge';

  if v_event_id is null then
    raise exception 'invalid_activity';
  end if;

  select count(*)::integer into v_eligible_count
    from speaker_electorate
   where event_id = v_event_id
     and joined_at <= v_cutoff;

  insert into speaker_rounds(
    activity_id,
    round,
    enrollment_cutoff,
    eligible_count,
    threshold_count
  ) values (
    p_activity_id,
    p_round,
    v_cutoff,
    v_eligible_count,
    ceil(v_eligible_count / 2.0)::integer
  )
  on conflict (activity_id, round) do update
    set enrollment_cutoff = excluded.enrollment_cutoff,
        eligible_count = excluded.eligible_count,
        threshold_count = excluded.threshold_count,
        reached_at = null;
end;
$$;

revoke all on function public.snapshot_speaker_round(uuid, integer) from public;

create or replace function public.admin_start_speaker(p_activity_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event_id uuid;
  v_status text;
  v_round integer;
  v_buffer_seconds integer;
begin
  select event_id into v_event_id from activities where id = p_activity_id;
  if v_event_id is null then raise exception 'activity_not_found'; end if;
  perform 1 from events where id = v_event_id for update;

  select status, challenge_round, challenge_buffer_seconds
    into v_status, v_round, v_buffer_seconds
    from activities
   where id = p_activity_id
     and phase = 'speaker_challenge'
   for update;

  if not found then raise exception 'invalid_activity'; end if;
  if v_status <> 'draft' then raise exception 'speaker_already_started'; end if;

  perform snapshot_speaker_round(p_activity_id, v_round);

  update activities
     set status = 'open',
         challenge_paused = false,
         challenge_paused_remaining_seconds = null,
         voting_opens_at = now() + make_interval(secs => v_buffer_seconds),
         challenge_revision = challenge_revision + 1
   where id = p_activity_id;

  insert into presentation_state(event_id, active_activity_id, mode, updated_at)
  values (v_event_id, p_activity_id, 'poll', now())
  on conflict (event_id) do update
    set active_activity_id = excluded.active_activity_id,
        mode = excluded.mode,
        updated_at = excluded.updated_at;
end;
$$;

create or replace function public.admin_advance_speaker(p_activity_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event_id uuid;
  v_status text;
  v_next_round integer;
  v_buffer_seconds integer;
begin
  select event_id into v_event_id from activities where id = p_activity_id;
  if v_event_id is null then raise exception 'activity_not_found'; end if;
  perform 1 from events where id = v_event_id for update;

  select status, challenge_round + 1, challenge_buffer_seconds
    into v_status, v_next_round, v_buffer_seconds
    from activities
   where id = p_activity_id
     and phase = 'speaker_challenge'
   for update;

  if not found then raise exception 'invalid_activity'; end if;
  if v_status = 'draft' then raise exception 'speaker_not_started'; end if;

  perform snapshot_speaker_round(p_activity_id, v_next_round);

  update activities
     set status = 'open',
         challenge_round = v_next_round,
         challenge_paused = false,
         challenge_paused_remaining_seconds = null,
         voting_opens_at = now() + make_interval(secs => v_buffer_seconds),
         challenge_revision = challenge_revision + 1
   where id = p_activity_id;

  insert into presentation_state(event_id, active_activity_id, mode, updated_at)
  values (v_event_id, p_activity_id, 'poll', now())
  on conflict (event_id) do update
    set active_activity_id = excluded.active_activity_id,
        mode = excluded.mode,
        updated_at = excluded.updated_at;
end;
$$;

create or replace function public.admin_reset_speaker(p_activity_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event_id uuid;
begin
  select event_id into v_event_id from activities where id = p_activity_id;
  if v_event_id is null then raise exception 'activity_not_found'; end if;
  perform 1 from events where id = v_event_id for update;
  perform 1 from activities
   where id = p_activity_id
     and phase = 'speaker_challenge'
   for update;
  if not found then raise exception 'invalid_activity'; end if;

  delete from speaker_rounds where activity_id = p_activity_id;
  delete from speaker_ballots where activity_id = p_activity_id;
  delete from challenge_joins where activity_id = p_activity_id;
  delete from votes where activity_id = p_activity_id;

  update activities
     set status = 'draft',
         results_visibility = 'hidden',
         challenge_round = 1,
         voting_opens_at = null,
         challenge_paused = false,
         challenge_paused_remaining_seconds = null,
         challenge_revision = challenge_revision + 1
   where id = p_activity_id;

  insert into presentation_state(event_id, active_activity_id, mode, updated_at)
  values (v_event_id, p_activity_id, 'join', now())
  on conflict (event_id) do update
    set active_activity_id = excluded.active_activity_id,
        mode = excluded.mode,
        updated_at = excluded.updated_at;
end;
$$;

grant execute on function public.admin_start_speaker(uuid) to service_role;
grant execute on function public.admin_advance_speaker(uuid) to service_role;
grant execute on function public.admin_reset_speaker(uuid) to service_role;
