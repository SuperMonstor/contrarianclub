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
    select count(*) <> count(distinct input_row.phone_e164)
      from jsonb_to_recordset(p_rows) as input_row(
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
      input_row.phone_e164,
      nullif(btrim(input_row.name), '') as name,
      input_row.is_active,
      input_row.preference_at
    from jsonb_to_recordset(p_rows) as input_row(
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

  update public.whatsapp_imports as import_record
     set added_count = v_added,
         updated_count = v_updated,
         deactivated_count = v_deactivated,
         unchanged_count = v_unchanged
   where import_record.id = v_import_id;

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
  where subscriber.is_active = true
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

  if not found then
    raise exception 'campaign_not_found';
  end if;

  if v_status = 'cancelled' then
    return v_status;
  end if;

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

revoke all on function public.apply_whatsapp_import(text, text, text, text, text, text, date, uuid, integer, jsonb) from public;
grant execute on function public.apply_whatsapp_import(text, text, text, text, text, text, date, uuid, integer, jsonb) to service_role;

revoke all on function public.create_whatsapp_campaign(text, text, jsonb, uuid) from public;
grant execute on function public.create_whatsapp_campaign(text, text, jsonb, uuid) to service_role;

revoke all on function public.claim_whatsapp_deliveries(uuid, integer) from public;
grant execute on function public.claim_whatsapp_deliveries(uuid, integer) to service_role;

revoke all on function public.mark_stale_whatsapp_deliveries_unknown(uuid) from public;
grant execute on function public.mark_stale_whatsapp_deliveries_unknown(uuid) to service_role;

revoke all on function public.refresh_whatsapp_campaign_status(uuid) from public;
grant execute on function public.refresh_whatsapp_campaign_status(uuid) to service_role;
