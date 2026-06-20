alter table public.events
  add column if not exists is_default boolean not null default false;

create unique index if not exists events_single_default_idx
  on public.events (is_default)
  where is_default;
