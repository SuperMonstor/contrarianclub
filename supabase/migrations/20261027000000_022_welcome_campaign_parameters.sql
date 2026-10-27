-- The approved welcome template has an image header the admin picks for each
-- batch, so a welcome campaign now stores its parameters like announcements.
drop function public.create_whatsapp_welcome_campaign(text, text, uuid);

create or replace function public.create_whatsapp_welcome_campaign(
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
#variable_conflict use_column
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
    kind,
    template_name,
    language_code,
    parameters,
    status,
    created_by,
    started_at
  ) values (
    'welcome',
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
    and not exists (
      select 1
        from public.whatsapp_deliveries as delivery
        join public.whatsapp_campaigns as campaign
          on campaign.id = delivery.campaign_id
       where campaign.kind = 'welcome'
         and campaign.id <> v_campaign_id
         and delivery.subscriber_id = subscriber.id
         and delivery.status not in ('failed', 'skipped')
    );

  get diagnostics v_recipient_count = row_count;
  if v_recipient_count = 0 then
    raise exception 'no_unwelcomed_subscribers';
  end if;

  update public.whatsapp_campaigns
     set recipient_count = v_recipient_count
   where id = v_campaign_id;

  return query select v_campaign_id, v_recipient_count;
end;
$$;

revoke all on function public.create_whatsapp_welcome_campaign(text, text, jsonb, uuid) from public, anon, authenticated;
grant execute on function public.create_whatsapp_welcome_campaign(text, text, jsonb, uuid) to service_role;
