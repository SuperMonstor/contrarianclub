-- Keep the current speaker electorate live until the host advances.

create or replace function public.refresh_speaker_round_threshold(
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
  v_eligible_count integer;
  v_threshold_count integer;
  v_next_votes integer;
begin
  select event_id into v_event_id
    from activities
   where id = p_activity_id
     and phase = 'speaker_challenge';

  if v_event_id is null then
    raise exception 'invalid_activity';
  end if;

  perform 1 from speaker_rounds
   where activity_id = p_activity_id
     and round = p_round
   for update;

  if not found then
    raise exception 'speaker_round_not_found';
  end if;

  select count(*)::integer into v_eligible_count
    from speaker_electorate
   where event_id = v_event_id;

  v_threshold_count := ceil(v_eligible_count / 2.0)::integer;

  select count(*)::integer into v_next_votes
    from speaker_ballots
   where activity_id = p_activity_id
     and round = p_round
     and choice = 'next';

  update speaker_rounds
     set eligible_count = v_eligible_count,
         threshold_count = v_threshold_count,
         reached_at = case
           when v_threshold_count > 0 and v_next_votes >= v_threshold_count
             then coalesce(reached_at, now())
           else null
         end
   where activity_id = p_activity_id
     and round = p_round;
end;
$$;

revoke all on function public.refresh_speaker_round_threshold(uuid, integer)
  from public;

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
  v_activity_id uuid;
  v_activity_status text;
  v_round integer;
  v_inserted_count integer;
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

  get diagnostics v_inserted_count = row_count;

  select activities.id, activities.status, activities.challenge_round
    into v_activity_id, v_activity_status, v_round
    from presentation_state
    join activities
      on activities.id = presentation_state.active_activity_id
     and activities.event_id = presentation_state.event_id
   where presentation_state.event_id = v_event_id
     and activities.phase = 'speaker_challenge'
   for update of activities;

  if v_activity_id is null then
    return;
  end if;

  if v_activity_status = 'open' then
    if not exists (
      select 1 from speaker_rounds
       where activity_id = v_activity_id
         and round = v_round
    ) then
      perform snapshot_speaker_round(v_activity_id, v_round);
    end if;

    perform refresh_speaker_round_threshold(v_activity_id, v_round);
  end if;

  if v_inserted_count > 0 then
    update activities
       set challenge_revision = challenge_revision + 1
     where id = v_activity_id;
  end if;
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
    ) and exists (
      select 1 from speaker_rounds
       where activity_id = p_activity_id
         and speaker_rounds.round = v_round
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

  perform 1 from speaker_rounds
   where activity_id = p_activity_id
     and round = v_challenge_round
   for update;

  if not found then
    raise exception 'speaker_round_not_found';
  end if;

  if not exists (
    select 1 from speaker_electorate
     where event_id = v_token_event_id
       and device_id = v_device_id
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

  perform refresh_speaker_round_threshold(p_activity_id, v_challenge_round);

  update activities
     set challenge_revision = challenge_revision + 1
   where id = p_activity_id;
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
  values (v_event_id, p_activity_id, 'poll', now())
  on conflict (event_id) do update
    set active_activity_id = excluded.active_activity_id,
        mode = excluded.mode,
        updated_at = excluded.updated_at;
end;
$$;

revoke all on function public.join_speaker_electorate(uuid) from public;
revoke all on function public.get_speaker_participation(uuid, uuid) from public;
revoke all on function public.set_next_speaker_request(uuid, uuid, integer, boolean)
  from public;
revoke all on function public.admin_reset_speaker(uuid) from public;

grant execute on function public.join_speaker_electorate(uuid)
  to anon, authenticated;
grant execute on function public.get_speaker_participation(uuid, uuid)
  to anon, authenticated;
grant execute on function public.set_next_speaker_request(uuid, uuid, integer, boolean)
  to anon, authenticated;
grant execute on function public.admin_reset_speaker(uuid) to service_role;

