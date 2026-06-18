create extension if not exists pgcrypto;

create table public.events (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  created_at timestamptz not null default now()
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  type text not null default 'multiple_choice',
  prompt text not null,
  status text not null default 'draft' check (status in ('draft', 'open', 'closed')),
  results_visibility text not null default 'hidden' check (results_visibility in ('hidden', 'revealed')),
  created_at timestamptz not null default now()
);

create table public.poll_options (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  label text not null,
  sort_order integer not null default 0
);

create table public.participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  device_id text not null,
  display_name text,
  created_at timestamptz not null default now(),
  unique (event_id, device_id)
);

create table public.votes (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  option_id uuid not null references public.poll_options(id) on delete cascade,
  participant_id uuid references public.participants(id) on delete set null,
  device_id text not null,
  created_at timestamptz not null default now(),
  unique (activity_id, device_id)
);

create table public.presentation_state (
  event_id uuid primary key references public.events(id) on delete cascade,
  active_activity_id uuid references public.activities(id) on delete set null,
  mode text not null default 'join' check (mode in ('join', 'poll', 'results')),
  updated_at timestamptz not null default now()
);

create index events_code_idx on public.events (code);
create index activities_event_id_idx on public.activities (event_id);
create index poll_options_activity_id_idx on public.poll_options (activity_id, sort_order);
create index votes_activity_id_idx on public.votes (activity_id);
create index votes_option_id_idx on public.votes (option_id);

alter table public.events enable row level security;
alter table public.activities enable row level security;
alter table public.poll_options enable row level security;
alter table public.participants enable row level security;
alter table public.votes enable row level security;
alter table public.presentation_state enable row level security;

create policy "public can read events"
  on public.events for select
  using (true);

create policy "public can read activities"
  on public.activities for select
  using (true);

create policy "public can read poll options"
  on public.poll_options for select
  using (true);

create policy "public can read presentation state"
  on public.presentation_state for select
  using (true);

create policy "public can join events"
  on public.participants for insert
  with check (true);

create policy "public can read participants"
  on public.participants for select
  using (true);

create policy "public can submit votes"
  on public.votes for insert
  with check (true);

create policy "public can read votes"
  on public.votes for select
  using (true);

alter publication supabase_realtime add table public.events;
alter publication supabase_realtime add table public.activities;
alter publication supabase_realtime add table public.poll_options;
alter publication supabase_realtime add table public.votes;
alter publication supabase_realtime add table public.presentation_state;
