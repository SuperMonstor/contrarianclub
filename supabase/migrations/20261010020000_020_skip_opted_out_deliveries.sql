-- A campaign snapshot records who was eligible when it was created, but only
-- current consent permits a send. A subscriber who replies STOP while a
-- campaign is queued or paused is marked skipped instead of being messaged.

alter table public.whatsapp_deliveries
  drop constraint whatsapp_deliveries_status_check;

alter table public.whatsapp_deliveries
  add constraint whatsapp_deliveries_status_check
  check (status in ('queued', 'sending', 'sent', 'delivered', 'read', 'retryable_failed', 'unknown', 'failed', 'skipped'));

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
  update public.whatsapp_deliveries as delivery
     set status = 'skipped',
         claimed_at = null,
         last_error_code = 'subscriber_inactive',
         last_error_message = 'The subscriber opted out before this message was sent.'
    from public.whatsapp_subscribers as subscriber
   where delivery.campaign_id = p_campaign_id
     and delivery.status in ('queued', 'retryable_failed')
     and subscriber.id = delivery.subscriber_id
     and subscriber.is_active = false;

  with claimed as (
    select delivery.id
      from public.whatsapp_deliveries as delivery
     where delivery.campaign_id = p_campaign_id
       and delivery.status in ('queued', 'retryable_failed')
       and delivery.attempt_count < 3
       and exists (
         select 1
           from public.whatsapp_subscribers as subscriber
          where subscriber.id = delivery.subscriber_id
            and subscriber.is_active = true
       )
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
