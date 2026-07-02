-- Cover participant_id on votes so host resets (which delete participants and
-- fire the ON DELETE SET NULL trigger against votes) do not full-scan the
-- table. Drop the two indexes that exactly duplicate the unique-constraint
-- indexes already backing events(code) and votes(activity_id, device_id):
-- they add write amplification without serving any read path.
create index if not exists votes_participant_id_idx
  on public.votes (participant_id);

drop index if exists public.events_code_idx;
drop index if exists public.votes_activity_id_idx;
