-- Campaigns now come in two kinds: debate announcements, and the one-time
-- welcome message that tells each subscriber what this number is for.
alter table public.whatsapp_campaigns
  add column kind text not null default 'announcement'
  check (kind in ('announcement', 'welcome'));

create index whatsapp_deliveries_subscriber_idx
  on public.whatsapp_deliveries (subscriber_id);

-- Announcement posters are sent as the template's image header. Meta fetches
-- the image from a public URL, so the bucket is public and limited to the
-- formats and size WhatsApp accepts for header images.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'whatsapp-posters',
  'whatsapp-posters',
  true,
  5242880,
  array['image/jpeg', 'image/png']
)
on conflict (id) do nothing;

-- A subscriber counts as welcomed once a welcome message was sent or may have
-- been sent. Failed and skipped attempts leave them eligible for the next one.
create or replace function public.create_whatsapp_welcome_campaign(
  p_template_name text,
  p_language_code text,
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
    '{}'::jsonb,
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

create or replace function public.count_pending_whatsapp_welcomes()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer
    from public.whatsapp_subscribers as subscriber
   where subscriber.is_active = true
     and not exists (
       select 1
         from public.whatsapp_deliveries as delivery
         join public.whatsapp_campaigns as campaign
           on campaign.id = delivery.campaign_id
        where campaign.kind = 'welcome'
          and delivery.subscriber_id = subscriber.id
          and delivery.status not in ('failed', 'skipped')
     );
$$;

revoke all on function public.create_whatsapp_welcome_campaign(text, text, uuid) from public, anon, authenticated;
grant execute on function public.create_whatsapp_welcome_campaign(text, text, uuid) to service_role;

revoke all on function public.count_pending_whatsapp_welcomes() from public, anon, authenticated;
grant execute on function public.count_pending_whatsapp_welcomes() to service_role;
