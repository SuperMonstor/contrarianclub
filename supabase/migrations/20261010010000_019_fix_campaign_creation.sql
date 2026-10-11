-- The original conflict target named campaign_id, which PL/pgSQL resolved
-- against the function's campaign_id output column and failed at runtime.
-- A brand new campaign cannot already have deliveries, and each subscriber
-- appears once, so the conflict clause is not needed at all.
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
  where subscriber.is_active = true;

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
