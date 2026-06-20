alter table public.events
  add column if not exists status text not null default 'draft'
  check (status in ('draft', 'live', 'ended', 'archived'));

create index if not exists events_status_idx on public.events (status);
