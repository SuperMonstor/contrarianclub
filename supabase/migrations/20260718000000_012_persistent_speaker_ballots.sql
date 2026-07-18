-- Persistent audience speaker ballots.
--
-- This migration is additive. Legacy challenge joins and votes remain in place
-- for rollback compatibility, while the new flow reads and writes only
-- speaker_ballots.

alter table public.activities
  add column if not exists challenge_paused boolean not null default false,
  add column if not exists challenge_paused_remaining_seconds integer,
  add column if not exists challenge_revision bigint not null default 0;

alter table public.activities
  drop constraint if exists activities_challenge_paused_remaining_check;

alter table public.activities
  add constraint activities_challenge_paused_remaining_check
  check (
    challenge_paused_remaining_seconds is null
    or challenge_paused_remaining_seconds >= 0
  );

create table if not exists public.speaker_ballots (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  round integer not null,
  device_id text not null,
  choice text not null check (choice in ('keep', 'next')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (activity_id, round, device_id)
);

create index if not exists speaker_ballots_activity_round_idx
  on public.speaker_ballots (activity_id, round);

alter table public.speaker_ballots enable row level security;

update public.activities
   set prompt = 'Current speaker'
 where phase = 'speaker_challenge';

-- Preserve legacy challenge votes as Next ballots. The rehearsal reset clears
-- both representations before the live event.
insert into public.speaker_ballots (
  activity_id,
  round,
  device_id,
  choice,
  created_at,
  updated_at
)
select
  votes.activity_id,
  votes.round,
  votes.device_id,
  'next',
  votes.created_at,
  votes.created_at
from public.votes
join public.activities on activities.id = votes.activity_id
where activities.phase = 'speaker_challenge'
on conflict (activity_id, round, device_id) do nothing;

create or replace function public.set_speaker_ballot(
  p_token uuid,
  p_activity_id uuid,
  p_expected_round integer,
  p_choice text
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
begin
  select device_id, event_id
    into v_device_id, v_token_event_id
    from device_tokens
   where token = p_token;

  if v_device_id is null then
    raise exception 'invalid_token';
  end if;

  -- Lock the event before the activity. Administrative speaker functions use
  -- the same order, so ending an event and casting a ballot are serialised
  -- without introducing an event/activity deadlock.
  select status into v_event_status
    from events
   where id = v_token_event_id
     for update;

  if v_event_status is null or v_event_status in ('archived', 'ended') then
    raise exception 'event_not_active';
  end if;

  if p_choice is null or p_choice not in ('keep', 'next') then
    raise exception 'invalid_choice';
  end if;

  -- Serialise ballot writes with pause, reset, and speaker advance. The
  -- expected round check ensures a late request never lands in a new session.
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

  insert into speaker_ballots (activity_id, round, device_id, choice)
  values (p_activity_id, v_challenge_round, v_device_id, p_choice)
  on conflict (activity_id, round, device_id) do update
    set choice = excluded.choice,
        updated_at = now();

  update activities
     set challenge_revision = challenge_revision + 1
   where id = p_activity_id;
end;
$$;

revoke all on function public.set_speaker_ballot(uuid, uuid, integer, text) from public;
grant execute on function public.set_speaker_ballot(uuid, uuid, integer, text)
  to anon, authenticated;

create or replace function public.get_speaker_ballot(
  p_token uuid,
  p_activity_id uuid
)
returns table(round integer, choice text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_device_id text;
  v_token_event_id uuid;
  v_activity_event_id uuid;
  v_activity_phase text;
  v_challenge_round integer;
begin
  select device_id, event_id
    into v_device_id, v_token_event_id
    from device_tokens
   where token = p_token;

  if v_device_id is null then
    raise exception 'invalid_token';
  end if;

  select activities.event_id, activities.phase, activities.challenge_round
    into v_activity_event_id, v_activity_phase, v_challenge_round
    from activities
   where activities.id = p_activity_id;

  if v_activity_event_id is null then
    raise exception 'activity_not_found';
  end if;

  if v_activity_event_id <> v_token_event_id then
    raise exception 'invalid_token';
  end if;

  if v_activity_phase <> 'speaker_challenge' then
    raise exception 'invalid_activity';
  end if;

  return query
  select
    v_challenge_round,
    speaker_ballots.choice
  from (select 1) as singleton
  left join speaker_ballots
    on speaker_ballots.activity_id = p_activity_id
   and speaker_ballots.round = v_challenge_round
   and speaker_ballots.device_id = v_device_id;
end;
$$;

revoke all on function public.get_speaker_ballot(uuid, uuid) from public;
grant execute on function public.get_speaker_ballot(uuid, uuid)
  to anon, authenticated;

-- All administrative functions are callable only with the service role. The
-- application still authenticates the admin before invoking them.
create or replace function public.admin_switch_section(
  p_event_id uuid,
  p_activity_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_activity_id uuid;
  v_target_phase text;
begin
  perform 1 from events where id = p_event_id for update;
  if not found then
    raise exception 'event_not_found';
  end if;

  select phase into v_target_phase
    from activities
   where id = p_activity_id
     and event_id = p_event_id;

  if v_target_phase is null then
    raise exception 'activity_not_found';
  end if;

  if v_target_phase not in ('pre_debate', 'speaker_challenge', 'post_debate') then
    raise exception 'invalid_section';
  end if;

  select active_activity_id into v_current_activity_id
    from presentation_state
   where event_id = p_event_id;

  if v_current_activity_id is distinct from p_activity_id then
    if v_current_activity_id is not null then
      perform 1 from activities
       where id = v_current_activity_id
         and event_id = p_event_id
       for update;

      update activities
         set status = 'closed'
       where id = v_current_activity_id
         and event_id = p_event_id
         and phase <> 'speaker_challenge'
         and status = 'open';

      update activities
         set challenge_paused = true,
             challenge_paused_remaining_seconds = greatest(
               0,
               ceil(extract(epoch from (voting_opens_at - now())))::integer
             ),
             voting_opens_at = null,
             challenge_revision = challenge_revision + 1
       where id = v_current_activity_id
         and event_id = p_event_id
         and phase = 'speaker_challenge'
         and status = 'open'
         and not challenge_paused;
    end if;

    insert into presentation_state (
      event_id,
      active_activity_id,
      mode,
      updated_at
    )
    values (p_event_id, p_activity_id, 'poll', now())
    on conflict (event_id) do update
      set active_activity_id = excluded.active_activity_id,
          mode = excluded.mode,
          updated_at = excluded.updated_at;
  end if;
end;
$$;

create or replace function public.admin_start_speaker(p_activity_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event_id uuid;
  v_status text;
  v_buffer_seconds integer;
begin
  select event_id into v_event_id from activities where id = p_activity_id;
  if v_event_id is null then raise exception 'activity_not_found'; end if;
  perform 1 from events where id = v_event_id for update;

  select status, challenge_buffer_seconds
    into v_status, v_buffer_seconds
    from activities
   where id = p_activity_id
     and phase = 'speaker_challenge'
   for update;

  if not found then raise exception 'invalid_activity'; end if;
  if v_status <> 'draft' then raise exception 'speaker_already_started'; end if;

  update activities
     set status = 'open',
         challenge_paused = false,
         challenge_paused_remaining_seconds = null,
         voting_opens_at = now() + make_interval(secs => v_buffer_seconds),
         challenge_revision = challenge_revision + 1
   where id = p_activity_id;

  insert into presentation_state (event_id, active_activity_id, mode, updated_at)
  values (v_event_id, p_activity_id, 'poll', now())
  on conflict (event_id) do update
    set active_activity_id = excluded.active_activity_id,
        mode = excluded.mode,
        updated_at = excluded.updated_at;
end;
$$;

create or replace function public.admin_pause_speaker(p_activity_id uuid)
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
     and status = 'open'
     and not challenge_paused
   for update;
  if not found then raise exception 'speaker_not_running'; end if;

  update activities
     set challenge_paused = true,
         challenge_paused_remaining_seconds = greatest(
           0,
           ceil(extract(epoch from (voting_opens_at - now())))::integer
         ),
         voting_opens_at = null,
         challenge_revision = challenge_revision + 1
   where id = p_activity_id;
end;
$$;

create or replace function public.admin_resume_speaker(p_activity_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event_id uuid;
  v_remaining integer;
begin
  select event_id into v_event_id from activities where id = p_activity_id;
  if v_event_id is null then raise exception 'activity_not_found'; end if;
  perform 1 from events where id = v_event_id for update;

  select challenge_paused_remaining_seconds
    into v_remaining
    from activities
   where id = p_activity_id
     and phase = 'speaker_challenge'
     and status = 'open'
     and challenge_paused
   for update;
  if not found then raise exception 'speaker_not_paused'; end if;

  update activities
     set challenge_paused = false,
         challenge_paused_remaining_seconds = null,
         voting_opens_at = now() + make_interval(secs => coalesce(v_remaining, 0)),
         challenge_revision = challenge_revision + 1
   where id = p_activity_id;
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
  v_buffer_seconds integer;
begin
  select event_id into v_event_id from activities where id = p_activity_id;
  if v_event_id is null then raise exception 'activity_not_found'; end if;
  perform 1 from events where id = v_event_id for update;

  select status, challenge_buffer_seconds
    into v_status, v_buffer_seconds
    from activities
   where id = p_activity_id
     and phase = 'speaker_challenge'
   for update;
  if not found then raise exception 'invalid_activity'; end if;
  if v_status = 'draft' then raise exception 'speaker_not_started'; end if;

  update activities
     set status = 'open',
         challenge_round = challenge_round + 1,
         challenge_paused = false,
         challenge_paused_remaining_seconds = null,
         voting_opens_at = now() + make_interval(secs => v_buffer_seconds),
         challenge_revision = challenge_revision + 1
   where id = p_activity_id;

  insert into presentation_state (event_id, active_activity_id, mode, updated_at)
  values (v_event_id, p_activity_id, 'poll', now())
  on conflict (event_id) do update
    set active_activity_id = excluded.active_activity_id,
        mode = excluded.mode,
        updated_at = excluded.updated_at;
end;
$$;

create or replace function public.admin_set_event_status(
  p_event_id uuid,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_challenge_id uuid;
begin
  if p_status is null or p_status not in ('draft', 'live', 'ended', 'archived') then
    raise exception 'invalid_event_status';
  end if;

  perform 1 from events where id = p_event_id for update;
  if not found then raise exception 'event_not_found'; end if;

  update events set status = p_status where id = p_event_id;

  -- Ending the event closes the live ballot and preserves the exact speaker
  -- position. Returning the event to draft or live still requires an explicit
  -- Resume speaker or Next speaker action from the host.
  if p_status in ('ended', 'archived') then
    for v_challenge_id in
      select id
        from activities
       where event_id = p_event_id
         and phase = 'speaker_challenge'
         and status = 'open'
         and not challenge_paused
       order by id
         for update
    loop
      update activities
         set challenge_paused = true,
             challenge_paused_remaining_seconds = greatest(
               0,
               ceil(extract(epoch from (voting_opens_at - now())))::integer
             ),
             voting_opens_at = null,
             challenge_revision = challenge_revision + 1
       where id = v_challenge_id;
    end loop;
  end if;
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

  delete from speaker_ballots where activity_id = p_activity_id;
  delete from challenge_joins where activity_id = p_activity_id;
  delete from votes where activity_id = p_activity_id;
  delete from participants
   where event_id = v_event_id
     and not exists (
       select 1 from votes where votes.participant_id = participants.id
     );

  update activities
     set status = 'draft',
         results_visibility = 'hidden',
         challenge_round = 1,
         voting_opens_at = null,
         challenge_paused = false,
         challenge_paused_remaining_seconds = null,
         challenge_revision = challenge_revision + 1
   where id = p_activity_id;

  insert into presentation_state (event_id, active_activity_id, mode, updated_at)
  values (v_event_id, p_activity_id, 'join', now())
  on conflict (event_id) do update
    set active_activity_id = excluded.active_activity_id,
        mode = excluded.mode,
        updated_at = excluded.updated_at;
end;
$$;

revoke all on function public.admin_switch_section(uuid, uuid) from public;
revoke all on function public.admin_start_speaker(uuid) from public;
revoke all on function public.admin_pause_speaker(uuid) from public;
revoke all on function public.admin_resume_speaker(uuid) from public;
revoke all on function public.admin_advance_speaker(uuid) from public;
revoke all on function public.admin_set_event_status(uuid, text) from public;
revoke all on function public.admin_reset_speaker(uuid) from public;

grant execute on function public.admin_switch_section(uuid, uuid) to service_role;
grant execute on function public.admin_start_speaker(uuid) to service_role;
grant execute on function public.admin_pause_speaker(uuid) to service_role;
grant execute on function public.admin_resume_speaker(uuid) to service_role;
grant execute on function public.admin_advance_speaker(uuid) to service_role;
grant execute on function public.admin_set_event_status(uuid, text) to service_role;
grant execute on function public.admin_reset_speaker(uuid) to service_role;
