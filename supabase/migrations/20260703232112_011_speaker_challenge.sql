-- Speaker challenge — a repeating "call for the next speaker" round that runs
-- during the debate.
--
-- Each round has two acts: a join window (the speaker's protected buffer,
-- configurable per event) during which the audience raises a hand to take part,
-- then an open vote where only that round's joiners may call for the next
-- speaker. Not voting after joining is the implicit "keep the speaker". The
-- speaker is out when next-speaker votes exceed half of the round's joiners.
--
-- Rounds never delete data: votes and joins are stamped with a round number and
-- kept, and advancing a round just bumps activities.challenge_round. All timing
-- is enforced server-side against activities.voting_opens_at so a client cannot
-- join or vote outside its window.

-- 1. Allow the new activity phase. The challenge reuses type='multiple_choice'
--    with a single option, so only the phase axis grows.
alter table public.activities
  drop constraint if exists activities_phase_check;

alter table public.activities
  add constraint activities_phase_check
  check (phase in ('general', 'pre_debate', 'post_debate', 'speaker_challenge'));

-- 2. Round state lives on the activity row. Updates to it ride the existing
--    supabase_realtime publication on activities, so round changes reach every
--    client without new channels.
alter table public.activities
  add column if not exists challenge_round integer not null default 1,
  add column if not exists voting_opens_at timestamptz,
  add column if not exists challenge_buffer_seconds integer not null default 90;

alter table public.activities
  drop constraint if exists activities_challenge_buffer_seconds_check;

alter table public.activities
  add constraint activities_challenge_buffer_seconds_check
  check (challenge_buffer_seconds between 10 and 600);

-- 3. Votes are stamped with the round they belong to. Existing votes (and all
--    pre/post debate votes forever) sit at round 1, so one-vote-per-device
--    behaviour is unchanged for them; the challenge gets one vote per device
--    per round.
alter table public.votes
  add column if not exists round integer not null default 1;

alter table public.votes
  drop constraint if exists votes_activity_id_device_id_key;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.votes'::regclass
      and conname = 'votes_activity_device_round_key'
  ) then
    alter table public.votes
      add constraint votes_activity_device_round_key
      unique (activity_id, device_id, round);
  end if;
end $$;

-- 4. Round joins. A join is the presence signal for one round: it says nothing
--    about the speaker, but only joiners may vote that round and the majority
--    threshold is measured against them. device_id pairs a person with their
--    joins, so like votes/participants this table is locked to the service
--    role and the security-definer RPCs (RLS on, no policies).
create table if not exists public.challenge_joins (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  device_id text not null,
  round integer not null,
  created_at timestamptz not null default now(),
  unique (activity_id, device_id, round)
);

create index if not exists challenge_joins_activity_round_idx
  on public.challenge_joins (activity_id, round);

alter table public.challenge_joins enable row level security;

-- 5. Joining a round. Mirrors cast_vote's token gating and activity row lock,
--    and only succeeds while the join window is still open (before
--    voting_opens_at) — a latecomer cannot join mid-vote and move the
--    threshold under the room.
create or replace function public.join_challenge_round(
  p_token uuid,
  p_activity_id uuid
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
  v_event_status text;
begin
  select device_id, event_id
    into v_device_id, v_token_event_id
    from device_tokens
   where token = p_token;

  if v_device_id is null then
    raise exception 'invalid_token';
  end if;

  -- Lock the activity row so a concurrent round advance cannot interleave:
  -- a join lands in the round that was current when it committed.
  select status, event_id, phase, challenge_round, voting_opens_at
    into v_activity_status, v_activity_event_id, v_activity_phase,
         v_challenge_round, v_voting_opens_at
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

  if v_activity_status <> 'open' then
    raise exception 'poll_not_open';
  end if;

  select status into v_event_status from events where id = v_activity_event_id;

  if v_event_status in ('archived', 'ended') then
    raise exception 'event_not_active';
  end if;

  if v_voting_opens_at is null or now() >= v_voting_opens_at then
    raise exception 'join_window_closed';
  end if;

  insert into challenge_joins (activity_id, device_id, round)
  values (p_activity_id, v_device_id, v_challenge_round);
exception
  when unique_violation then
    raise exception 'already_joined';
end;
$$;

revoke all on function public.join_challenge_round(uuid, uuid) from public;
grant execute on function public.join_challenge_round(uuid, uuid) to anon, authenticated;

-- 6. cast_vote learns about rounds. Same signature and behaviour for the
--    debate polls (their round is always 1); for a speaker challenge it
--    additionally requires the vote window to be open (past voting_opens_at)
--    and a join row in the current round, and stamps the vote with that round.
create or replace function public.cast_vote(
  p_token uuid,
  p_activity_id uuid,
  p_option_id uuid,
  p_display_name text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_device_id text;
  v_token_event_id uuid;
  v_activity_status text;
  v_activity_event_id uuid;
  v_activity_phase text;
  v_challenge_round integer;
  v_voting_opens_at timestamptz;
  v_event_status text;
  v_participant_id uuid;
  v_name text;
begin
  -- Resolve the server-issued token; unknown token means a forged/expired id.
  select device_id, event_id
    into v_device_id, v_token_event_id
    from device_tokens
   where token = p_token;

  if v_device_id is null then
    raise exception 'invalid_token';
  end if;

  -- Lock the activity row so close/reset/round-advance cannot interleave with
  -- this insert.
  select status, event_id, phase, challenge_round, voting_opens_at
    into v_activity_status, v_activity_event_id, v_activity_phase,
         v_challenge_round, v_voting_opens_at
    from activities
   where id = p_activity_id
     for update;

  if v_activity_event_id is null then
    raise exception 'activity_not_found';
  end if;

  -- The token is scoped to its event; it cannot be replayed against another.
  if v_activity_event_id <> v_token_event_id then
    raise exception 'invalid_token';
  end if;

  if v_activity_status <> 'open' then
    raise exception 'poll_not_open';
  end if;

  -- An archived or ended event no longer accepts votes, even if an activity
  -- row was left in the 'open' state.
  select status into v_event_status from events where id = v_activity_event_id;

  if v_event_status in ('archived', 'ended') then
    raise exception 'event_not_active';
  end if;

  if v_activity_phase = 'speaker_challenge' then
    -- The speaker's buffer: votes only count once the join window has ended.
    if v_voting_opens_at is null or now() < v_voting_opens_at then
      raise exception 'voting_not_open_yet';
    end if;

    -- Only this round's joiners hold a ballot.
    if not exists (
      select 1 from challenge_joins
       where activity_id = p_activity_id
         and device_id = v_device_id
         and round = v_challenge_round
    ) then
      raise exception 'not_joined';
    end if;
  end if;

  -- The option must belong to this activity.
  if not exists (
    select 1 from poll_options
     where id = p_option_id
       and activity_id = p_activity_id
  ) then
    raise exception 'invalid_option';
  end if;

  -- Upsert the participant against the server-assigned device id. An empty name
  -- never wipes a previously-stored one.
  v_name := left(nullif(btrim(p_display_name), ''), 80);

  insert into participants (event_id, device_id, display_name)
  values (v_token_event_id, v_device_id, v_name)
  on conflict (event_id, device_id) do update
    set display_name = coalesce(
      nullif(btrim(excluded.display_name), ''),
      participants.display_name
    )
  returning id into v_participant_id;

  -- unique (activity_id, device_id, round) enforces one vote per device per
  -- round; non-challenge activities never leave round 1.
  insert into votes (activity_id, option_id, participant_id, device_id, round)
  values (p_activity_id, p_option_id, v_participant_id, v_device_id, v_challenge_round);
exception
  when unique_violation then
    raise exception 'already_voted';
end;
$$;
