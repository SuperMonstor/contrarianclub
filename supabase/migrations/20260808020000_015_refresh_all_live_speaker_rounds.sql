-- Keep every open speaker round aligned with the event-wide electorate.

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
  v_activity record;
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

  if v_inserted_count = 0 then
    return;
  end if;

  for v_activity in
    select id, challenge_round
      from activities
     where event_id = v_event_id
       and phase = 'speaker_challenge'
       and status = 'open'
     order by id
       for update
  loop
    if not exists (
      select 1 from speaker_rounds
       where activity_id = v_activity.id
         and round = v_activity.challenge_round
    ) then
      perform snapshot_speaker_round(
        v_activity.id,
        v_activity.challenge_round
      );
    end if;

    perform refresh_speaker_round_threshold(
      v_activity.id,
      v_activity.challenge_round
    );

    update activities
       set challenge_revision = challenge_revision + 1
     where id = v_activity.id;
  end loop;
end;
$$;

revoke all on function public.join_speaker_electorate(uuid) from public;
grant execute on function public.join_speaker_electorate(uuid)
  to anon, authenticated;

-- Reconcile rounds that may already be stale before this migration is applied.
do $$
declare
  v_event record;
  v_activity record;
begin
  for v_event in
    select distinct events.id
      from events
      join activities on activities.event_id = events.id
     where activities.phase = 'speaker_challenge'
       and activities.status = 'open'
     order by events.id
  loop
    perform 1 from events where id = v_event.id for update;

    for v_activity in
      select id, challenge_round
        from activities
       where event_id = v_event.id
         and phase = 'speaker_challenge'
         and status = 'open'
       order by id
         for update
    loop
      if not exists (
        select 1 from speaker_rounds
         where activity_id = v_activity.id
           and round = v_activity.challenge_round
      ) then
        perform snapshot_speaker_round(
          v_activity.id,
          v_activity.challenge_round
        );
      end if;

      perform refresh_speaker_round_threshold(
        v_activity.id,
        v_activity.challenge_round
      );

      update activities
         set challenge_revision = challenge_revision + 1
       where id = v_activity.id;
    end loop;
  end loop;
end;
$$;
