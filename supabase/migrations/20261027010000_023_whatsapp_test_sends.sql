-- Test mode: subscribers flagged as testers can receive an announcement on its
-- own before it goes to the whole list, and a test campaign is marked so the
-- admin can tell it apart and send the same message to everyone afterwards.
alter table public.whatsapp_subscribers
  add column is_tester boolean not null default false;

alter table public.whatsapp_campaigns
  add column is_test boolean not null default false;

drop function public.create_whatsapp_campaign(text, text, jsonb, uuid);

create function public.create_whatsapp_campaign(
  p_template_name text,
  p_language_code text,
  p_parameters jsonb,
  p_created_by uuid,
  p_test_only boolean
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
    or p_created_by is null
    or p_test_only is null then
    raise exception 'invalid_campaign';
  end if;

  insert into public.whatsapp_campaigns (
    template_name,
    language_code,
    parameters,
    status,
    created_by,
    started_at,
    is_test
  ) values (
    btrim(p_template_name),
    btrim(p_language_code),
    p_parameters,
    'sending',
    p_created_by,
    now(),
    p_test_only
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
    and (not p_test_only or subscriber.is_tester = true);

  get diagnostics v_recipient_count = row_count;
  if v_recipient_count = 0 then
    if p_test_only then
      raise exception 'no_active_testers';
    end if;
    raise exception 'no_active_subscribers';
  end if;

  update public.whatsapp_campaigns
     set recipient_count = v_recipient_count
   where id = v_campaign_id;

  return query select v_campaign_id, v_recipient_count;
end;
$$;

revoke all on function public.create_whatsapp_campaign(text, text, jsonb, uuid, boolean) from public, anon, authenticated;
grant execute on function public.create_whatsapp_campaign(text, text, jsonb, uuid, boolean) to service_role;
