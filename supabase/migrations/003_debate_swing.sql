alter table public.activities
  add column if not exists phase text not null default 'general'
  check (phase in ('general', 'pre_debate', 'post_debate'));

create index if not exists activities_event_phase_idx
  on public.activities (event_id, phase);
