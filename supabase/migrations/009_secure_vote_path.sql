-- Cluster 2 — vote integrity & data visibility.
--
-- Before this migration the anon key could read raw votes/participants (which
-- de-anonymises voters) and insert votes directly, while the app's own vote
-- path used the service-role key and so bypassed the migration-004 open-status
-- guard entirely. This migration closes both: it locks the anon key out of the
-- sensitive tables and routes every vote through one atomic, server-issued-token
-- gated RPC.

-- 1. Server-issued device tokens. A token is minted server-side (service role)
--    when a phone joins; the device_id is assigned by the server and sealed in
--    the token row, so a client cannot forge a device identity. RLS is enabled
--    with no policies, so the anon key can neither read nor write this table —
--    only the service role (minting) and the security-definer RPC (below) reach
--    it, both of which bypass RLS.
create table public.device_tokens (
  token uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  device_id text not null default gen_random_uuid()::text,
  created_at timestamptz not null default now()
);

create index device_tokens_event_id_idx on public.device_tokens (event_id);

alter table public.device_tokens enable row level security;

-- 2. The one write path for votes. Runs as its owner (security definer) so it
--    can touch the locked-down tables, but only ever performs this one vetted
--    operation. The whole thing is a single transaction with a lock on the
--    activity row, so a vote and a concurrent close/reset are serialised — a
--    ballot can no longer slip in after the host closes voting or mid-reset.
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

  -- Lock the activity row so close/reset cannot interleave with this insert.
  select status, event_id
    into v_activity_status, v_activity_event_id
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

  -- unique (activity_id, device_id) enforces one vote per device per activity.
  insert into votes (activity_id, option_id, participant_id, device_id)
  values (p_activity_id, p_option_id, v_participant_id, v_device_id);
exception
  when unique_violation then
    raise exception 'already_voted';
end;
$$;

revoke all on function public.cast_vote(uuid, uuid, uuid, text) from public;
grant execute on function public.cast_vote(uuid, uuid, uuid, text) to anon, authenticated;

-- 3. Lock the anon key out of the sensitive tables. The wide-open policies from
--    migration 001 let anyone with the public key read raw ballots (joining
--    votes to participants de-anonymises voters) and insert directly. Every
--    legitimate write now goes through cast_vote / the service role, so these
--    policies have no remaining purpose. RLS stays enabled with no policies,
--    which denies the anon/authenticated roles all access while the service
--    role and the security-definer RPC continue to bypass RLS.
drop policy if exists "public can read votes" on public.votes;
drop policy if exists "public can submit votes" on public.votes;
drop policy if exists "public can read participants" on public.participants;
drop policy if exists "public can join events" on public.participants;
