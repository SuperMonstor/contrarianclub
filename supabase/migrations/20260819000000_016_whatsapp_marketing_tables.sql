create table public.whatsapp_subscribers (
  id uuid primary key default gen_random_uuid(),
  phone_e164 text not null unique check (phone_e164 ~ '^\+91[6-9][0-9]{9}$'),
  name text,
  is_active boolean not null default true,
  preference_at timestamptz not null,
  preference_source text not null check (preference_source in ('import', 'whatsapp', 'admin')),
  source_import_id uuid,
  opted_out_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.whatsapp_imports (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  file_sha256 text not null unique,
  name_column text not null,
  phone_column text not null,
  consent_column text not null,
  preference_time_column text,
  source_date date,
  added_count integer not null check (added_count >= 0),
  updated_count integer not null check (updated_count >= 0),
  deactivated_count integer not null check (deactivated_count >= 0),
  unchanged_count integer not null check (unchanged_count >= 0),
  invalid_count integer not null check (invalid_count >= 0),
  imported_by uuid not null,
  created_at timestamptz not null default now()
);

alter table public.whatsapp_subscribers
  add constraint whatsapp_subscribers_source_import_fkey
  foreign key (source_import_id)
  references public.whatsapp_imports(id)
  on delete set null;

create table public.whatsapp_campaigns (
  id uuid primary key default gen_random_uuid(),
  template_name text not null,
  language_code text not null,
  parameters jsonb not null,
  status text not null default 'draft'
    check (status in ('draft', 'sending', 'completed', 'partial_failed', 'cancelled')),
  recipient_count integer not null default 0 check (recipient_count >= 0),
  created_by uuid not null,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.whatsapp_deliveries (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.whatsapp_campaigns(id) on delete cascade,
  subscriber_id uuid not null references public.whatsapp_subscribers(id) on delete restrict,
  recipient_phone text not null,
  recipient_name text,
  status text not null default 'queued'
    check (status in ('queued', 'sending', 'sent', 'delivered', 'read', 'retryable_failed', 'unknown', 'failed')),
  whatsapp_message_id text,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  claimed_at timestamptz,
  last_error_code text,
  last_error_message text,
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campaign_id, subscriber_id)
);

create index whatsapp_subscribers_active_idx
  on public.whatsapp_subscribers (is_active, created_at desc);

create index whatsapp_imports_created_at_idx
  on public.whatsapp_imports (created_at desc);

create index whatsapp_campaigns_created_at_idx
  on public.whatsapp_campaigns (created_at desc);

create index whatsapp_deliveries_campaign_status_idx
  on public.whatsapp_deliveries (campaign_id, status, created_at);

create unique index whatsapp_deliveries_message_id_uidx
  on public.whatsapp_deliveries (whatsapp_message_id)
  where whatsapp_message_id is not null;

create or replace function public.touch_whatsapp_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger whatsapp_subscribers_touch_updated_at
before update on public.whatsapp_subscribers
for each row execute function public.touch_whatsapp_updated_at();

create trigger whatsapp_deliveries_touch_updated_at
before update on public.whatsapp_deliveries
for each row execute function public.touch_whatsapp_updated_at();

alter table public.whatsapp_subscribers enable row level security;
alter table public.whatsapp_imports enable row level security;
alter table public.whatsapp_campaigns enable row level security;
alter table public.whatsapp_deliveries enable row level security;

revoke all on function public.touch_whatsapp_updated_at() from public;
