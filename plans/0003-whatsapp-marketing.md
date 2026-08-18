# 0003 WhatsApp Marketing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an isolated, protected WhatsApp marketing section that imports deduplicated Indian subscribers from Excel and sends resumable Meta Cloud API campaigns to every active subscriber.

**Architecture:** The existing Next.js application owns the admin UI, protected import and batch routes, and the public signed webhook. Supabase stores the master subscriber list and transactional campaign state in tables whose names begin with `whatsapp_`. Pure TypeScript modules normalize workbook rows, build template payloads, and parse webhooks, while server-only modules hold credentials and database access.

**Tech Stack:** Next.js 16.2 App Router, React 19, TypeScript, Supabase Postgres and Auth, Vitest, `read-excel-file` 9.x, Meta WhatsApp Cloud API

**Spec:** `docs/superpowers/specs/2026-08-19-whatsapp-marketing-design.md`

## Global Constraints

- Marketing lives under `/admin/whatsapp` and does not read or write debate event records.
- Every ten-digit Indian mobile number is stored once in E.164 form as `+91XXXXXXXXXX`.
- Every campaign snapshots all active subscribers. There is no segmentation in this release.
- Only the approved `new_debate_announcement` template is sent.
- The workbook upload limit is 4 MB so it stays below Vercel's 4.5 MB function payload limit.
- Uploaded workbook bytes and raw rows are never persisted.
- Every privileged page, Server Action, and admin Route Handler verifies the existing Supabase admin session inside the operation.
- Meta secrets remain server-only and never use a `NEXT_PUBLIC_` prefix.
- Unknown Meta outcomes are never retried automatically.
- No implementation or test command sends a real production WhatsApp message.
- Follow the installed Next.js 16.2 documentation in `node_modules/next/dist/docs/` when an API detail differs from older Next.js conventions.
- Never use an em dash in code, comments, documentation, commit messages, or UI copy.

---

## File Structure

### Database

- `supabase/migrations/20260819000000_016_whatsapp_marketing_tables.sql`: private tables, constraints, indexes, and update trigger.
- `supabase/migrations/20260819010000_017_whatsapp_marketing_functions.sql`: transactional import, campaign snapshot, delivery claim, stale claim, and campaign status functions.
- `supabase/migrations/whatsapp-marketing-tables.test.ts`: static schema and access-control contract.
- `supabase/migrations/whatsapp-marketing-functions.test.ts`: static RPC and transaction contract.

### Pure domain modules

- `src/lib/whatsapp/types.ts`: shared row, preview, campaign, delivery, and webhook types.
- `src/lib/whatsapp/phone.ts`: Indian mobile normalization and masking.
- `src/lib/whatsapp/importer.ts`: heading detection, row normalization, deduplication, and preference ordering.
- `src/lib/whatsapp/template.ts`: campaign input validation, preview text, and Meta template payload.
- `src/lib/whatsapp/webhook.ts`: signature verification, opt-out parsing, and webhook event extraction.
- Matching `*.test.ts` files verify each pure module.

### Server-only modules

- `src/lib/whatsapp/server/config.ts`: validated Meta environment configuration.
- `src/lib/whatsapp/server/workbook.ts`: `.xlsx` file validation and parsing through `read-excel-file/node`.
- `src/lib/whatsapp/server/imports.ts`: preview comparison and transactional import application.
- `src/lib/whatsapp/server/meta.ts`: direct Graph API client and error classification.
- `src/lib/whatsapp/server/campaigns.ts`: campaign creation, batch processing, and aggregate status.
- `src/lib/whatsapp/server/subscribers.ts`: subscriber list and manual preference updates.
- `src/lib/whatsapp/server/request.ts`: same-origin validation for authenticated mutation routes.

### Routes and actions

- `src/app/api/admin/whatsapp/imports/preview/route.ts`: protected multipart preview route.
- `src/app/api/admin/whatsapp/imports/confirm/route.ts`: protected multipart confirmation route.
- `src/app/api/admin/whatsapp/campaigns/[id]/send-batch/route.ts`: protected resumable batch route.
- `src/app/api/whatsapp/webhook/route.ts`: public verification and signed event route.
- `src/app/admin/whatsapp/actions.ts`: campaign creation and manual subscriber preference Server Actions.

### Admin UI

- `src/app/admin/whatsapp/page.tsx`: overview.
- `src/app/admin/whatsapp/subscribers/page.tsx`: searchable master list.
- `src/app/admin/whatsapp/import/page.tsx`: import page.
- `src/app/admin/whatsapp/campaigns/new/page.tsx`: campaign form page.
- `src/app/admin/whatsapp/campaigns/[id]/page.tsx`: campaign progress page.
- `src/components/whatsapp/marketing-header.tsx`: shared isolated navigation.
- `src/components/whatsapp/import-workbook-form.tsx`: upload, mapping, preview, and confirmation state.
- `src/components/whatsapp/campaign-form.tsx`: template inputs and preview.
- `src/components/whatsapp/campaign-runner.tsx`: resumable batch loop.
- Focused component tests cover client behavior.

### Configuration and documentation

- `.env.example`: server-only Meta variable names.
- `README.md`: migration and route summary.
- `docs/setup.md`: link to the marketing setup guide.
- `docs/whatsapp-setup.md`: complete Meta Business, number, token, template, webhook, and staged test runbook.

---

### Task 1: Create the private WhatsApp schema

**Files:**
- Create: `supabase/migrations/20260819000000_016_whatsapp_marketing_tables.sql`
- Create: `supabase/migrations/whatsapp-marketing-tables.test.ts`

**Interfaces:**
- Produces: `whatsapp_subscribers`, `whatsapp_imports`, `whatsapp_campaigns`, and `whatsapp_deliveries` with the exact columns and status checks in the approved spec.
- Produces: unique constraints on `phone_e164`, `file_sha256`, `(campaign_id, subscriber_id)`, and non-null `whatsapp_message_id` values.
- Security: enables RLS without public policies on all four tables.

- [ ] **Step 1: Write the failing schema contract test**

```ts
// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL("./20260819000000_016_whatsapp_marketing_tables.sql", import.meta.url),
  "utf8",
);

describe("WhatsApp marketing tables", () => {
  it("creates four isolated private tables", () => {
    for (const table of [
      "whatsapp_subscribers",
      "whatsapp_imports",
      "whatsapp_campaigns",
      "whatsapp_deliveries",
    ]) {
      expect(migration).toContain(`create table public.${table}`);
      expect(migration).toContain(
        `alter table public.${table} enable row level security`,
      );
    }
    expect(migration).not.toContain("create policy");
    expect(migration).not.toContain("references public.events");
  });

  it("enforces subscriber and delivery idempotency", () => {
    expect(migration).toContain("phone_e164 text not null unique");
    expect(migration).toContain("file_sha256 text not null unique");
    expect(migration).toContain("unique (campaign_id, subscriber_id)");
    expect(migration).toContain("whatsapp_deliveries_message_id_uidx");
  });
});
```

- [ ] **Step 2: Run the contract test and verify it fails because the migration is absent**

Run: `npm test -- supabase/migrations/whatsapp-marketing-tables.test.ts`

Expected: FAIL with an `ENOENT` error for migration 016.

- [ ] **Step 3: Add the complete table migration**

Use these status constraints and foreign-key relationships exactly:

```sql
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
```

Add indexes for active subscribers, recent imports, recent campaigns, campaign status, and the partial unique message ID. Add a single trigger function that maintains `updated_at` on subscribers and deliveries. Enable RLS on all four tables and create no policies.

```sql
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
```

- [ ] **Step 4: Run the schema contract test**

Run: `npm test -- supabase/migrations/whatsapp-marketing-tables.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the schema**

```bash
git add supabase/migrations/20260819000000_016_whatsapp_marketing_tables.sql supabase/migrations/whatsapp-marketing-tables.test.ts
git commit -m "feat: add whatsapp marketing tables"
```

### Task 2: Add transactional database functions

**Files:**
- Create: `supabase/migrations/20260819010000_017_whatsapp_marketing_functions.sql`
- Create: `supabase/migrations/whatsapp-marketing-functions.test.ts`

**Interfaces:**
- Produces: `apply_whatsapp_import(...)` returning import ID and five counts.
- Produces: `create_whatsapp_campaign(...)` returning campaign ID and recipient count.
- Produces: `claim_whatsapp_deliveries(uuid, integer)` returning claimed delivery snapshots.
- Produces: `mark_stale_whatsapp_deliveries_unknown(uuid)` and `refresh_whatsapp_campaign_status(uuid)`.
- Security: every function sets `search_path = public`, is revoked from `public`, and is granted only to `service_role`.

- [ ] **Step 1: Write the failing function contract test**

```ts
// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL("./20260819010000_017_whatsapp_marketing_functions.sql", import.meta.url),
  "utf8",
);

describe("WhatsApp marketing functions", () => {
  it("keeps import and campaign creation transactional", () => {
    expect(migration).toContain("create or replace function public.apply_whatsapp_import");
    expect(migration).toContain("create or replace function public.create_whatsapp_campaign");
    expect(migration).toContain("on conflict (campaign_id, subscriber_id) do nothing");
    expect(migration).toContain("where is_active = true");
  });

  it("claims work without selecting unknown or successful deliveries", () => {
    expect(migration).toContain("for update skip locked");
    expect(migration).toContain("status in ('queued', 'retryable_failed')");
    expect(migration).toContain("attempt_count < 3");
  });

  it("exposes functions only to the service role", () => {
    expect(migration).toMatch(/revoke all on function[\s\S]+from public;/);
    expect(migration).toMatch(/grant execute on function[\s\S]+to service_role;/);
  });
});
```

- [ ] **Step 2: Run the function contract test and verify it fails**

Run: `npm test -- supabase/migrations/whatsapp-marketing-functions.test.ts`

Expected: FAIL with `ENOENT` for migration 017.

- [ ] **Step 3: Implement `apply_whatsapp_import`**

Accept metadata plus a JSONB array whose objects have `phone_e164`, `name`, `is_active`, and `preference_at`. Lock an existing subscriber before comparing preferences. Add active Yes rows, ignore new No rows, update only when the input preference is newer, and count every input exactly once. Insert the `whatsapp_imports` row and all subscriber changes inside the function's transaction.

```sql
create or replace function public.apply_whatsapp_import(
  p_file_name text,
  p_file_sha256 text,
  p_name_column text,
  p_phone_column text,
  p_consent_column text,
  p_preference_time_column text,
  p_source_date date,
  p_imported_by uuid,
  p_invalid_count integer,
  p_rows jsonb
)
returns table (
  import_id uuid,
  added_count integer,
  updated_count integer,
  deactivated_count integer,
  unchanged_count integer,
  invalid_count integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_import_id uuid;
  v_row record;
  v_existing public.whatsapp_subscribers%rowtype;
  v_added integer := 0;
  v_updated integer := 0;
  v_deactivated integer := 0;
  v_unchanged integer := 0;
begin
  if p_invalid_count < 0
    or jsonb_typeof(p_rows) <> 'array'
    or jsonb_array_length(p_rows) = 0 then
    raise exception 'invalid_import';
  end if;

  if (
    select count(*) <> count(distinct row.phone_e164)
      from jsonb_to_recordset(p_rows) as row(
        phone_e164 text,
        name text,
        is_active boolean,
        preference_at timestamptz
      )
  ) then
    raise exception 'duplicate_import_phone';
  end if;

  insert into public.whatsapp_imports (
    file_name,
    file_sha256,
    name_column,
    phone_column,
    consent_column,
    preference_time_column,
    source_date,
    added_count,
    updated_count,
    deactivated_count,
    unchanged_count,
    invalid_count,
    imported_by
  ) values (
    p_file_name,
    p_file_sha256,
    p_name_column,
    p_phone_column,
    p_consent_column,
    p_preference_time_column,
    p_source_date,
    0,
    0,
    0,
    0,
    p_invalid_count,
    p_imported_by
  )
  returning id into v_import_id;

  for v_row in
    select
      row.phone_e164,
      nullif(btrim(row.name), '') as name,
      row.is_active,
      row.preference_at
    from jsonb_to_recordset(p_rows) as row(
      phone_e164 text,
      name text,
      is_active boolean,
      preference_at timestamptz
    )
  loop
    if v_row.phone_e164 !~ '^\+91[6-9][0-9]{9}$'
      or v_row.is_active is null
      or v_row.preference_at is null then
      raise exception 'invalid_import_row';
    end if;

    select subscriber.*
      into v_existing
      from public.whatsapp_subscribers as subscriber
     where subscriber.phone_e164 = v_row.phone_e164
       for update;

    if not found then
      if v_row.is_active then
        insert into public.whatsapp_subscribers (
          phone_e164,
          name,
          is_active,
          preference_at,
          preference_source,
          source_import_id,
          opted_out_at
        ) values (
          v_row.phone_e164,
          v_row.name,
          true,
          v_row.preference_at,
          'import',
          v_import_id,
          null
        );
        v_added := v_added + 1;
      else
        v_unchanged := v_unchanged + 1;
      end if;
    elsif v_row.preference_at <= v_existing.preference_at then
      v_unchanged := v_unchanged + 1;
    else
      if v_existing.is_active and not v_row.is_active then
        v_deactivated := v_deactivated + 1;
      else
        v_updated := v_updated + 1;
      end if;

      update public.whatsapp_subscribers as subscriber
         set name = coalesce(v_row.name, subscriber.name),
             is_active = v_row.is_active,
             preference_at = v_row.preference_at,
             preference_source = 'import',
             source_import_id = v_import_id,
             opted_out_at = case
               when v_row.is_active then null
               else v_row.preference_at
             end
       where subscriber.id = v_existing.id;
    end if;
  end loop;

  update public.whatsapp_imports as import
     set added_count = v_added,
         updated_count = v_updated,
         deactivated_count = v_deactivated,
         unchanged_count = v_unchanged
   where import.id = v_import_id;

  return query
  select
    v_import_id,
    v_added,
    v_updated,
    v_deactivated,
    v_unchanged,
    p_invalid_count;
end;
$$;
```

Use `jsonb_to_recordset(p_rows)` to validate the row shape in SQL. Reject an empty array, a repeated file hash, malformed E.164 values, and negative invalid counts.

- [ ] **Step 4: Implement campaign snapshot and delivery claims**

`create_whatsapp_campaign` inserts one campaign, inserts deliveries from all active subscribers with `on conflict do nothing`, writes the resulting count, rejects a zero-recipient campaign, and returns the ID and count.

```sql
create or replace function public.create_whatsapp_campaign(
  p_template_name text,
  p_language_code text,
  p_parameters jsonb,
  p_created_by uuid
)
returns table (campaign_id uuid, recipient_count integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_campaign_id uuid;
  v_recipient_count integer;
begin
  if nullif(btrim(p_template_name), '') is null
    or nullif(btrim(p_language_code), '') is null
    or p_parameters is null
    or p_created_by is null then
    raise exception 'invalid_campaign';
  end if;

  insert into public.whatsapp_campaigns (
    template_name,
    language_code,
    parameters,
    status,
    created_by,
    started_at
  ) values (
    btrim(p_template_name),
    btrim(p_language_code),
    p_parameters,
    'sending',
    p_created_by,
    now()
  )
  returning id into v_campaign_id;

  insert into public.whatsapp_deliveries (
    campaign_id,
    subscriber_id,
    recipient_phone,
    recipient_name
  )
  select
    v_campaign_id,
    subscriber.id,
    subscriber.phone_e164,
    subscriber.name
  from public.whatsapp_subscribers as subscriber
  where is_active = true
  on conflict (campaign_id, subscriber_id) do nothing;

  get diagnostics v_recipient_count = row_count;
  if v_recipient_count = 0 then
    raise exception 'no_active_subscribers';
  end if;

  update public.whatsapp_campaigns
     set recipient_count = v_recipient_count
   where id = v_campaign_id;

  return query select v_campaign_id, v_recipient_count;
end;
$$;
```

`claim_whatsapp_deliveries` uses one CTE with `for update skip locked`, limits the batch from 1 through 20, changes rows to `sending`, increments `attempt_count`, sets `claimed_at`, and returns the exact columns required by the Meta sender.

```sql
create or replace function public.claim_whatsapp_deliveries(
  p_campaign_id uuid,
  p_limit integer default 20
)
returns table (
  id uuid,
  campaign_id uuid,
  recipient_phone text,
  recipient_name text,
  attempt_count integer
)
language sql
security definer
set search_path = public
as $$
  with claimed as (
    select delivery.id
      from public.whatsapp_deliveries as delivery
     where delivery.campaign_id = p_campaign_id
       and delivery.status in ('queued', 'retryable_failed')
       and delivery.attempt_count < 3
     order by delivery.created_at, delivery.id
     for update skip locked
     limit greatest(1, least(coalesce(p_limit, 20), 20))
  )
  update public.whatsapp_deliveries as delivery
     set status = 'sending',
         attempt_count = delivery.attempt_count + 1,
         claimed_at = now()
    from claimed
   where delivery.id = claimed.id
  returning
    delivery.id,
    delivery.campaign_id,
    delivery.recipient_phone,
    delivery.recipient_name,
    delivery.attempt_count;
$$;
```

`mark_stale_whatsapp_deliveries_unknown` changes `sending` rows older than five minutes to `unknown`.

```sql
create or replace function public.mark_stale_whatsapp_deliveries_unknown(
  p_campaign_id uuid
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  update public.whatsapp_deliveries
     set status = 'unknown',
         last_error_code = 'stale_claim',
         last_error_message = 'The send outcome could not be confirmed.'
   where campaign_id = p_campaign_id
     and status = 'sending'
     and claimed_at < now() - interval '5 minutes';
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;
```

`refresh_whatsapp_campaign_status` derives `sending`, `completed`, or `partial_failed` from delivery rows without replacing `cancelled`.

```sql
create or replace function public.refresh_whatsapp_campaign_status(
  p_campaign_id uuid
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
begin
  select status into v_status
    from public.whatsapp_campaigns
   where id = p_campaign_id
   for update;
  if not found then raise exception 'campaign_not_found'; end if;
  if v_status = 'cancelled' then return v_status; end if;

  if exists (
    select 1 from public.whatsapp_deliveries
     where campaign_id = p_campaign_id
       and status in ('queued', 'sending', 'retryable_failed')
  ) then
    v_status := 'sending';
  elsif exists (
    select 1 from public.whatsapp_deliveries
     where campaign_id = p_campaign_id
       and status in ('failed', 'unknown')
  ) then
    v_status := 'partial_failed';
  else
    v_status := 'completed';
  end if;

  update public.whatsapp_campaigns
     set status = v_status,
         completed_at = case
           when v_status in ('completed', 'partial_failed') then now()
           else null
         end
   where id = p_campaign_id;
  return v_status;
end;
$$;
```

- [ ] **Step 5: Revoke and grant every function signature explicitly**

```sql
revoke all on function public.apply_whatsapp_import(text, text, text, text, text, text, date, uuid, integer, jsonb) from public;
grant execute on function public.apply_whatsapp_import(text, text, text, text, text, text, date, uuid, integer, jsonb) to service_role;
```

```sql
revoke all on function public.create_whatsapp_campaign(text, text, jsonb, uuid) from public;
grant execute on function public.create_whatsapp_campaign(text, text, jsonb, uuid) to service_role;

revoke all on function public.claim_whatsapp_deliveries(uuid, integer) from public;
grant execute on function public.claim_whatsapp_deliveries(uuid, integer) to service_role;

revoke all on function public.mark_stale_whatsapp_deliveries_unknown(uuid) from public;
grant execute on function public.mark_stale_whatsapp_deliveries_unknown(uuid) to service_role;

revoke all on function public.refresh_whatsapp_campaign_status(uuid) from public;
grant execute on function public.refresh_whatsapp_campaign_status(uuid) to service_role;
```

- [ ] **Step 6: Run both migration contract tests**

Run: `npm test -- supabase/migrations/whatsapp-marketing-tables.test.ts supabase/migrations/whatsapp-marketing-functions.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit the functions**

```bash
git add supabase/migrations/20260819010000_017_whatsapp_marketing_functions.sql supabase/migrations/whatsapp-marketing-functions.test.ts
git commit -m "feat: add whatsapp marketing transactions"
```

### Task 3: Build the workbook import domain

**Files:**
- Create: `src/lib/whatsapp/types.ts`
- Create: `src/lib/whatsapp/phone.ts`
- Create: `src/lib/whatsapp/phone.test.ts`
- Create: `src/lib/whatsapp/importer.ts`
- Create: `src/lib/whatsapp/importer.test.ts`

**Interfaces:**
- Produces: `normalizeIndianPhone(value: unknown): string | null`.
- Produces: `maskIndianPhone(phoneE164: string): string`.
- Produces: `detectImportColumns(headers: string[]): ImportColumnDetection`.
- Produces: `normalizeImportRows(rows, mapping, sourceDate): NormalizedImport`.
- `NormalizedImport.rows` is deduplicated and safe to pass to `apply_whatsapp_import`.

- [ ] **Step 1: Write failing phone normalization tests**

```ts
expect(normalizeIndianPhone("98765 43210")).toBe("+919876543210");
expect(normalizeIndianPhone("09876543210")).toBe("+919876543210");
expect(normalizeIndianPhone("+91-98765-43210")).toBe("+919876543210");
expect(normalizeIndianPhone(9876543210)).toBe("+919876543210");
expect(normalizeIndianPhone("5876543210")).toBeNull();
expect(normalizeIndianPhone("98765")).toBeNull();
expect(maskIndianPhone("+919876543210")).toBe("+91******3210");
```

- [ ] **Step 2: Run the phone tests and verify they fail**

Run: `npm test -- src/lib/whatsapp/phone.test.ts`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement phone normalization and shared types**

Keep phone functions pure. Convert finite integer numbers without scientific notation, remove non-digits from strings, strip a leading `0` or `91`, then validate exactly ten digits beginning with 6 through 9.

- [ ] **Step 4: Write failing heading and row tests**

Cover the supplied historical heading and newer WhatsApp-specific headings:

```ts
const headers = [
  "Name",
  "Phone",
  "Would you like to stay updated with future debates?",
  "Time of Purchase",
];
expect(detectImportColumns(headers).mapping).toEqual({
  name: "Name",
  phone: "Phone",
  consent: "Would you like to stay updated with future debates?",
  preferenceTime: "Time of Purchase",
});

expect(
  detectImportColumns(["Name", "Phone", "Updates", "WhatsApp updates"])
    .ambiguous,
).toContain("consent");
```

Also test Yes, No, blank consent, missing names, source-date fallback at `23:59:59.999+05:30`, later preferences winning, same-time conflicts becoming invalid, and deduplication by normalized phone.

- [ ] **Step 5: Run importer tests and verify they fail**

Run: `npm test -- src/lib/whatsapp/importer.test.ts`

Expected: FAIL because the importer is absent.

- [ ] **Step 6: Implement deterministic heading and row normalization**

Represent workbook rows as `WorkbookCell[][]`, where a cell is `string | number | boolean | Date | null`. Normalize headings by lowercasing and removing punctuation. Use exact aliases first, then keyword matches. Return ambiguity instead of picking the first candidate.

Return aggregate invalid issues in this shape so the UI never receives full phone numbers:

```ts
type ImportIssue = {
  rowNumber: number;
  maskedPhone: string | null;
  message: string;
};
```

- [ ] **Step 7: Run domain tests**

Run: `npm test -- src/lib/whatsapp/phone.test.ts src/lib/whatsapp/importer.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit the import domain**

```bash
git add src/lib/whatsapp/types.ts src/lib/whatsapp/phone.ts src/lib/whatsapp/phone.test.ts src/lib/whatsapp/importer.ts src/lib/whatsapp/importer.test.ts
git commit -m "feat: normalize whatsapp subscriber imports"
```

### Task 4: Parse workbooks and expose protected import routes

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/lib/whatsapp/server/workbook.ts`
- Create: `src/lib/whatsapp/server/workbook.test.ts`
- Create: `src/lib/whatsapp/server/request.ts`
- Create: `src/lib/whatsapp/server/request.test.ts`
- Create: `src/lib/whatsapp/server/imports.ts`
- Create: `src/app/api/admin/whatsapp/imports/preview/route.ts`
- Create: `src/app/api/admin/whatsapp/imports/confirm/route.ts`

**Interfaces:**
- Consumes: Task 2 `apply_whatsapp_import` RPC and Task 3 normalization functions.
- Produces: `parseImportWorkbook(file: File): Promise<ParsedWorkbook>`.
- Produces: authenticated JSON preview and confirmation endpoints.

- [ ] **Step 1: Install the current `read-excel-file` 9.x package**

Run: `npm install read-excel-file@^9.3.5`

Expected: `package.json` and `package-lock.json` contain the direct dependency.

- [ ] **Step 2: Write failing workbook validation tests**

Mock `read-excel-file/node` and verify that the adapter rejects non-`.xlsx` names, files larger than `4 * 1024 * 1024`, empty workbooks, and workbooks without a non-empty sheet. Verify it selects the first non-empty sheet and returns its rows without evaluating formulas.

- [ ] **Step 3: Implement the Node-only workbook adapter**

```ts
import "server-only";
import readWorkbook from "read-excel-file/node";

export const MAX_WORKBOOK_BYTES = 4 * 1024 * 1024;

export async function parseImportWorkbook(file: File) {
  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    throw new ImportFileError("Only .xlsx workbooks are supported.");
  }
  if (file.size === 0 || file.size > MAX_WORKBOOK_BYTES) {
    throw new ImportFileError("Workbook must be between 1 byte and 4 MB.");
  }
  const sheets = await readWorkbook(Buffer.from(await file.arrayBuffer()));
  const sheet = sheets.find(({ data }) => data.some((row) => row.some(hasValue)));
  if (!sheet) throw new ImportFileError("Workbook has no non-empty worksheet.");
  return { sheetName: sheet.sheet, rows: sheet.data };
}
```

- [ ] **Step 4: Test and implement same-origin mutation checks**

`isSameOrigin(request)` must compare the parsed `Origin` hostname and port with `Host`, allow a missing Origin only for same-site non-browser clients that already have a valid admin session, and reject malformed or mismatched origins.

- [ ] **Step 5: Implement import preview and confirmation services**

The preview service computes SHA-256, detects or validates the selected mapping, normalizes rows, fetches matching subscribers in bounded groups, and returns added, updated, deactivated, unchanged, and invalid counts. It reports `alreadyImported` when the hash exists.

The confirmation service repeats every parse and comparison step, rejects duplicate hashes, and calls:

```ts
await supabase.rpc("apply_whatsapp_import", {
  p_file_name: file.name,
  p_file_sha256: fileSha256,
  p_name_column: mapping.name,
  p_phone_column: mapping.phone,
  p_consent_column: mapping.consent,
  p_preference_time_column: mapping.preferenceTime,
  p_source_date: sourceDate,
  p_imported_by: userId,
  p_invalid_count: normalized.invalidCount,
  p_rows: normalized.rows,
});
```

- [ ] **Step 6: Implement both Route Handlers**

Each handler uses `request.formData()`, checks `getAdminUser()`, checks same origin, validates `file instanceof File`, returns safe 400 or 409 responses for input errors, and returns a generic 500 without logging workbook rows. Set `runtime = "nodejs"` and `dynamic = "force-dynamic"`.

- [ ] **Step 7: Run workbook and import tests**

Run: `npm test -- src/lib/whatsapp/server/workbook.test.ts src/lib/whatsapp/server/request.test.ts src/lib/whatsapp/importer.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit workbook imports**

```bash
git add package.json package-lock.json src/lib/whatsapp/server src/app/api/admin/whatsapp/imports
git commit -m "feat: import whatsapp subscribers from excel"
```

### Task 5: Build the Meta template and API client

**Files:**
- Create: `src/lib/whatsapp/template.ts`
- Create: `src/lib/whatsapp/template.test.ts`
- Create: `src/lib/whatsapp/server/config.ts`
- Create: `src/lib/whatsapp/server/config.test.ts`
- Create: `src/lib/whatsapp/server/meta.ts`
- Create: `src/lib/whatsapp/server/meta.test.ts`

**Interfaces:**
- Produces: `validateCampaignInput(input): CampaignParameters`.
- Produces: `buildTemplatePayload(delivery, campaign, config): MetaTemplatePayload`.
- Produces: `sendTemplateMessage(input): Promise<MetaSendResult>` with `sent`, `retryable`, `terminal`, or `unknown` classification.

- [ ] **Step 1: Write failing template tests**

```ts
expect(buildTemplateParameters(null, campaign)).toEqual([
  "there",
  campaign.title,
  campaign.date,
  campaign.time,
  campaign.venue,
  campaign.ticketUrl,
]);
expect(() => validateCampaignInput({ ...campaign, ticketUrl: "http://x.test" }))
  .toThrow("Ticket URL must use HTTPS.");
```

Verify that the Meta `to` field removes the leading plus, the component contains six text parameters in order, and blank or overlong fields are rejected before any database write.

- [ ] **Step 2: Implement campaign validation and payload construction**

Use one `body` component and the configured template name and language:

```ts
return {
  messaging_product: "whatsapp",
  recipient_type: "individual",
  to: delivery.recipient_phone.replace(/^\+/, ""),
  type: "template",
  template: {
    name: config.templateName,
    language: { code: config.templateLanguage },
    components: [{
      type: "body",
      parameters: values.map((text) => ({ type: "text", text })),
    }],
  },
};
```

- [ ] **Step 3: Test and implement server-only configuration**

`getWhatsAppConfig()` reads all eight required variable names from the spec, trims them, validates `WHATSAPP_GRAPH_API_VERSION` with `^v[0-9]+\.[0-9]+$`, and returns missing variable names without values. Import `server-only` at the top.

- [ ] **Step 4: Write failing API classification tests**

Mock `fetch` for a 200 with `wamid`, a 429, a 500, a terminal 400 with Meta error code, malformed JSON, and a thrown network error. Expected classifications are `sent`, `retryable`, `retryable`, `terminal`, `unknown`, and `unknown` respectively.

- [ ] **Step 5: Implement the direct Graph API client**

Send to `https://graph.facebook.com/${graphApiVersion}/${phoneNumberId}/messages` with a bearer token and JSON content type. Use a 15-second timeout. Parse only the `messages[0].id` or the safe Meta error fields. Never return or log the token, request payload, response contacts, or full phone number.

- [ ] **Step 6: Run Meta module tests**

Run: `npm test -- src/lib/whatsapp/template.test.ts src/lib/whatsapp/server/config.test.ts src/lib/whatsapp/server/meta.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit the Meta client**

```bash
git add src/lib/whatsapp/template.ts src/lib/whatsapp/template.test.ts src/lib/whatsapp/server/config.ts src/lib/whatsapp/server/config.test.ts src/lib/whatsapp/server/meta.ts src/lib/whatsapp/server/meta.test.ts
git commit -m "feat: add whatsapp cloud api client"
```

### Task 6: Verify and process Meta webhooks

**Files:**
- Create: `src/lib/whatsapp/webhook.ts`
- Create: `src/lib/whatsapp/webhook.test.ts`
- Create: `src/app/api/whatsapp/webhook/route.ts`
- Create: `src/app/api/whatsapp/webhook/route.test.ts`

**Interfaces:**
- Consumes: Task 3 phone normalization and Task 5 app secret configuration.
- Produces: `verifyWebhookSignature(rawBody, signature, appSecret): boolean`.
- Produces: `extractWebhookEvents(payload): WhatsAppWebhookEvent[]`.
- Produces: public GET verification and POST event endpoints.

- [ ] **Step 1: Write failing signature, status, and opt-out tests**

Use a fixed app secret and fixture body to assert the exact
`sha256=<hex digest>` signature. Cover duplicate payload entries, sent,
delivered, read, failed, unknown message IDs, STOP, ` unsubscribe `, `remove  me`,
non-opt-out text, and non-Indian senders.

- [ ] **Step 2: Implement webhook parsing as pure functions**

Use `createHmac` and `timingSafeEqual` only after verifying equal buffer lengths.
Normalize opt-out text with `trim().replace(/\s+/g, " ").toUpperCase()` and
accept exactly `STOP`, `UNSUBSCRIBE`, and `REMOVE ME`.

Extract events without trusting optional array positions. Return only:

```ts
type WhatsAppWebhookEvent =
  | { kind: "status"; messageId: string; status: "sent" | "delivered" | "read" | "failed"; occurredAt: string; errorCode?: string; errorMessage?: string }
  | { kind: "opt_out"; phoneE164: string; occurredAt: string };
```

- [ ] **Step 3: Write the failing route tests**

Mock the configuration and service client. Verify the GET handshake returns the
challenge only for `hub.mode=subscribe` and the configured token. Verify POST
rejects a bad signature before JSON parsing and acknowledges valid unknown
events with 200.

- [ ] **Step 4: Implement the public webhook route**

Read POST requests with `request.text()` exactly once, verify the raw body, parse
JSON, and then apply events. Status updates must not regress `read` or
`delivered`. Opt-out updates set `is_active = false`, `preference_source =
'whatsapp'`, `preference_at` and `opted_out_at` to the event timestamp.

- [ ] **Step 5: Run webhook tests**

Run: `npm test -- src/lib/whatsapp/webhook.test.ts src/app/api/whatsapp/webhook/route.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit the webhook**

```bash
git add src/lib/whatsapp/webhook.ts src/lib/whatsapp/webhook.test.ts src/app/api/whatsapp/webhook
git commit -m "feat: process whatsapp delivery webhooks"
```

### Task 7: Create and process campaigns

**Files:**
- Create: `src/lib/whatsapp/server/campaigns.ts`
- Create: `src/lib/whatsapp/server/campaigns.test.ts`
- Create: `src/app/api/admin/whatsapp/campaigns/[id]/send-batch/route.ts`
- Create: `src/app/api/admin/whatsapp/campaigns/[id]/send-batch/route.test.ts`
- Create: `src/app/admin/whatsapp/actions.ts`

**Interfaces:**
- Consumes: Task 2 campaign RPCs and Task 5 Meta client.
- Produces: `createCampaign(parameters, userId)`.
- Produces: `sendCampaignBatch(campaignId): BatchResult`.
- Produces: `createWhatsAppCampaign` Server Action.
- Produces: `requeueUnknownWhatsAppDelivery` Server Action with an explicit duplicate-risk acknowledgement.

- [ ] **Step 1: Write failing campaign service tests**

Mock the Supabase and Meta boundaries. Verify active subscriber snapshots use the
configured template, batches claim at most 20, only five Meta calls run at once,
successful sends store the `wamid`, 429 and 5xx become retryable until attempt
three, terminal 4xx becomes failed, and thrown fetch outcomes become unknown.

- [ ] **Step 2: Implement campaign creation**

Validate the five form fields and the charges confirmation before calling
`create_whatsapp_campaign`. Use configuration for the template name and
language. Redirect to the campaign detail route with `?send=1` only after the
RPC succeeds.

- [ ] **Step 3: Implement bounded batch sending**

Call `mark_stale_whatsapp_deliveries_unknown` before claiming. Load the parent
campaign once. Process claimed deliveries in groups of five with
`Promise.allSettled`, updating each row immediately after its own result. Call
`refresh_whatsapp_campaign_status` after the group completes.

Return this browser-safe result:

```ts
type BatchResult = {
  claimed: number;
  sent: number;
  retryable: number;
  failed: number;
  unknown: number;
  hasMore: boolean;
  retryAfterMs: number;
};
```

- [ ] **Step 4: Implement the unknown-delivery retry action**

`requeueUnknownWhatsAppDelivery(formData)` rechecks admin auth, requires
`acknowledgeDuplicateRisk` to equal `yes`, validates the delivery UUID, and
changes only a row whose current status is `unknown` back to `queued`. Preserve
its attempt count so the three-attempt ceiling still applies. Revalidate the
campaign detail page after the update.

- [ ] **Step 5: Implement and test the protected batch route**

The route verifies admin auth and same origin, validates the UUID path parameter,
calls one batch, and returns no-store JSON. A request without a user returns 401,
a bad origin returns 403, bad input returns 400, and an unknown campaign returns
404.

- [ ] **Step 6: Run campaign tests**

Run: `npm test -- src/lib/whatsapp/server/campaigns.test.ts 'src/app/api/admin/whatsapp/campaigns/[id]/send-batch/route.test.ts'`

Expected: PASS.

- [ ] **Step 7: Commit campaign processing**

```bash
git add src/lib/whatsapp/server/campaigns.ts src/lib/whatsapp/server/campaigns.test.ts src/app/api/admin/whatsapp/campaigns src/app/admin/whatsapp/actions.ts
git commit -m "feat: send resumable whatsapp campaigns"
```

### Task 8: Build the isolated subscriber and import interface

**Files:**
- Modify: `src/app/admin/page.tsx`
- Modify: `src/app/admin/whatsapp/actions.ts`
- Create: `src/lib/whatsapp/server/subscribers.ts`
- Create: `src/components/whatsapp/marketing-header.tsx`
- Create: `src/components/whatsapp/import-workbook-form.tsx`
- Create: `src/components/whatsapp/import-workbook-form.test.tsx`
- Create: `src/app/admin/whatsapp/page.tsx`
- Create: `src/app/admin/whatsapp/subscribers/page.tsx`
- Create: `src/app/admin/whatsapp/import/page.tsx`

**Interfaces:**
- Consumes: Tasks 3 and 4 import preview and confirmation responses.
- Produces: authenticated overview, subscriber search, preference controls, and complete import flow.

- [ ] **Step 1: Write the failing import component test**

Mock `fetch` and use a synthetic `File`. Verify selection shows the file name,
Preview posts multipart data, ambiguity reveals mapping dropdowns, source date is
required when no timestamp column exists, Confirm sends the same file again,
and the completed state shows all five aggregate counts.

- [ ] **Step 2: Implement the reusable marketing header**

Render the logo, `WhatsApp marketing` title, links to Overview, Subscribers,
Import Excel, and New campaign, plus a link back to Events. Build links with
`adminPath` so they work on both `/admin` paths and the admin hostname.

- [ ] **Step 3: Implement server-side subscriber queries and actions**

Query only the fields displayed by each page. Search with a trimmed term and a
bounded result limit. `setWhatsAppSubscriberActive(formData)` rechecks admin
auth, validates the UUID and boolean, records `preference_source = 'admin'`, and
sets or clears `opted_out_at` consistently.

- [ ] **Step 4: Implement overview and subscriber pages**

Show active and inactive totals, the latest import summary, recent campaigns,
masked phone numbers, and status chips. Do not fetch through internal Route
Handlers from Server Components. Query the service module directly, as required
by the installed Next.js backend-for-frontend guide.

- [ ] **Step 5: Implement the import state machine**

Use explicit `idle`, `previewing`, `mapping`, `ready`, `confirming`, `complete`,
and `error` states. Keep the `File` object only in component memory. Show only
masked invalid rows and aggregate counts. Disable confirmation when mapping or
source date requirements are unmet.

- [ ] **Step 6: Add one navigation link from Events to the isolated section**

Add a `WhatsApp marketing` link in the existing admin header. Do not add event
IDs, event actions, or campaign counts to event cards.

- [ ] **Step 7: Run subscriber and import UI tests**

Run: `npm test -- src/components/whatsapp/import-workbook-form.test.tsx`

Expected: PASS.

- [ ] **Step 8: Commit the subscriber interface**

```bash
git add src/app/admin/page.tsx src/app/admin/whatsapp src/components/whatsapp src/lib/whatsapp/server/subscribers.ts
git commit -m "feat: add whatsapp subscriber admin"
```

### Task 9: Build campaign creation and progress pages

**Files:**
- Create: `src/components/whatsapp/campaign-form.tsx`
- Create: `src/components/whatsapp/campaign-form.test.tsx`
- Create: `src/components/whatsapp/campaign-runner.tsx`
- Create: `src/components/whatsapp/campaign-runner.test.tsx`
- Create: `src/app/admin/whatsapp/campaigns/new/page.tsx`
- Create: `src/app/admin/whatsapp/campaigns/[id]/page.tsx`

**Interfaces:**
- Consumes: Task 7 Server Action and batch endpoint.
- Produces: fixed-template preview, explicit charge confirmation, automatic start after `?send=1`, manual resume, safe retry, and live aggregate progress.

- [ ] **Step 1: Write failing campaign form tests**

Verify all five fields are required, the preview uses the exact approved copy,
the ticket URL must be HTTPS, recipient count is visible before submission, and
the Send button remains disabled until the charge confirmation is checked.

- [ ] **Step 2: Implement the campaign form and page**

Use a Client Component only for preview and local validation. Submit through the
Task 7 Server Action, which repeats validation and authorization. Do not let the
browser choose the Meta template name or language.

- [ ] **Step 3: Write failing campaign runner tests**

Mock successive batch responses to verify the runner continues while `hasMore`
is true, waits for `retryAfterMs`, stops on unknown outcomes, resumes on button
press, refreshes the page after progress, and never starts automatically unless
`autoStart` is true.

- [ ] **Step 4: Implement the campaign runner and detail page**

Display queued, sent, delivered, read, retryable, failed, and unknown counts.
Unknown rows receive their own warning. Retrying an unknown delivery requires a
separate confirmation checkbox explaining that a duplicate is possible, and
submits the Task 7 `requeueUnknownWhatsAppDelivery` action.

- [ ] **Step 5: Run campaign component tests**

Run: `npm test -- src/components/whatsapp/campaign-form.test.tsx src/components/whatsapp/campaign-runner.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit campaign UI**

```bash
git add src/components/whatsapp/campaign-form.tsx src/components/whatsapp/campaign-form.test.tsx src/components/whatsapp/campaign-runner.tsx src/components/whatsapp/campaign-runner.test.tsx src/app/admin/whatsapp/campaigns
git commit -m "feat: add whatsapp campaign admin"
```

### Task 10: Document Meta setup and deployment configuration

**Files:**
- Modify: `.env.example`
- Modify: `README.md`
- Modify: `docs/setup.md`
- Create: `docs/whatsapp-setup.md`

**Interfaces:**
- Documents: Business Portfolio, app, test number, dedicated number, template,
  payment setup, system user token, WABA subscription, webhook, secrets, and
  staged verification.

- [ ] **Step 1: Add server-only environment variable names**

```text
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=
WHATSAPP_APP_SECRET=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=
WHATSAPP_GRAPH_API_VERSION=
WHATSAPP_TEMPLATE_NAME=new_debate_announcement
WHATSAPP_TEMPLATE_LANGUAGE=en
```

State directly above them that none may use a `NEXT_PUBLIC_` prefix.

- [ ] **Step 2: Write the Meta setup guide**

Use current Meta labels where available and explicitly note common label
variants. Include direct links to Meta for Developers, Business Settings,
WhatsApp Manager, Cloud API setup, Meta's official Postman collection, and the
WhatsApp Business Messaging Policy.

Include the exact MARKETING template body and six representative sample values.
Explain how to create a dedicated Indian number, choose a six-digit two-step PIN,
create and assign a system user, generate the production token with
`whatsapp_business_messaging` and `whatsapp_business_management`, set the
callback URL, choose a random verification token, subscribe to `messages`, and
confirm `X-Hub-Signature-256` delivery.

Finish with checkboxes for test number, one production recipient, small internal
campaign, STOP verification, and full campaign. State that a production send can
incur Meta charges and always requires an explicit in-app confirmation.

- [ ] **Step 3: Update project setup references**

Add migrations 016 and 017 to the ordered lists in `README.md` and
`docs/setup.md`. Add `/admin/whatsapp` to the route summary and link the new
setup guide. Do not describe marketing as part of event publishing.

- [ ] **Step 4: Check documentation and generated text for forbidden em dashes**

Run: `rg -n $'\u2014' .env.example README.md docs/whatsapp-setup.md docs/setup.md src/lib/whatsapp src/app/admin/whatsapp src/components/whatsapp supabase/migrations/20260819000000_016_whatsapp_marketing_tables.sql supabase/migrations/20260819010000_017_whatsapp_marketing_functions.sql`

Expected: no matches.

- [ ] **Step 5: Commit setup documentation**

```bash
git add .env.example README.md docs/setup.md docs/whatsapp-setup.md
git commit -m "docs: add whatsapp cloud api setup"
```

### Task 11: Run full verification and reconcile the sample workbook

**Files:**
- Modify only files required to fix verification failures.

**Interfaces:**
- Verifies: the complete local feature without making a real Meta send.

- [ ] **Step 1: Run focused WhatsApp tests**

Run: `npm test -- src/lib/whatsapp src/components/whatsapp src/app/api/whatsapp src/app/api/admin/whatsapp supabase/migrations/whatsapp-marketing-tables.test.ts supabase/migrations/whatsapp-marketing-functions.test.ts`

Expected: PASS.

- [ ] **Step 2: Run the complete unit suite**

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 3: Run static analysis**

Run: `npm run lint`

Expected: exit 0 with no errors.

- [ ] **Step 4: Run the production build**

Run: `npm run build`

Expected: Next.js 16.2 production build succeeds and all new routes compile.

- [ ] **Step 5: Reconcile the supplied workbook without persisting personal data**

Run the workbook parser locally against
`/Users/sudarshansk/Downloads/guest_list_should_trillionaires_exist_keynote_debate.xlsx`
through a temporary test invocation. Log only sheet name, row count, consent
counts, valid phone count, duplicate count, and import preview totals.

Expected source facts: 42 data rows, 34 Yes, 8 No, 42 valid Indian phones, and 0
duplicate phone rows. Do not log names, emails, or phone numbers.

- [ ] **Step 6: Check the final diff and repository status**

Run: `git status -sb`

Run: `git diff --check`

Expected: no unstaged implementation changes after final fix commits and no
whitespace errors.

- [ ] **Step 7: Commit verification fixes through their owning task**

If verification finds a defect, return to the task that owns the affected file,
add a failing regression test, apply the minimal fix, rerun that task's checks,
and use that task's explicit commit file list. Skip this step when verification
required no fixes.

---

## Execution Notes

- Implement inline in this session because delegation was not requested.
- Apply test-driven development within every task. Do not write implementation
  code before its focused failing test exists.
- Before editing UI components, load and follow the frontend design skill while
  preserving the existing gallery-at-night admin design system.
- Before claiming completion, load and follow the verification-before-completion
  skill and run every command in Task 11.
- Do not deploy, push, create a pull request, trigger GitHub Actions, or send a
  production WhatsApp message without separate user authorization.
