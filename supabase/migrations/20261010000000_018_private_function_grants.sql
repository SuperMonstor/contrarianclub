-- Earlier migrations revoked execute from PUBLIC only. Supabase projects with
-- the legacy default privileges also grant execute directly to anon and
-- authenticated, so these security definer functions stayed callable with the
-- public anon key. Remove the direct grants and keep each function private.

-- Admin and WhatsApp functions the server calls with the service role.
revoke all on function public.admin_switch_section(uuid, uuid) from public, anon, authenticated;
revoke all on function public.admin_start_speaker(uuid) from public, anon, authenticated;
revoke all on function public.admin_pause_speaker(uuid) from public, anon, authenticated;
revoke all on function public.admin_resume_speaker(uuid) from public, anon, authenticated;
revoke all on function public.admin_advance_speaker(uuid) from public, anon, authenticated;
revoke all on function public.admin_set_event_status(uuid, text) from public, anon, authenticated;
revoke all on function public.admin_reset_speaker(uuid) from public, anon, authenticated;
revoke all on function public.apply_whatsapp_import(text, text, text, text, text, text, date, uuid, integer, jsonb) from public, anon, authenticated;
revoke all on function public.create_whatsapp_campaign(text, text, jsonb, uuid) from public, anon, authenticated;
revoke all on function public.claim_whatsapp_deliveries(uuid, integer) from public, anon, authenticated;
revoke all on function public.mark_stale_whatsapp_deliveries_unknown(uuid) from public, anon, authenticated;
revoke all on function public.refresh_whatsapp_campaign_status(uuid) from public, anon, authenticated;

grant execute on function public.admin_switch_section(uuid, uuid) to service_role;
grant execute on function public.admin_start_speaker(uuid) to service_role;
grant execute on function public.admin_pause_speaker(uuid) to service_role;
grant execute on function public.admin_resume_speaker(uuid) to service_role;
grant execute on function public.admin_advance_speaker(uuid) to service_role;
grant execute on function public.admin_set_event_status(uuid, text) to service_role;
grant execute on function public.admin_reset_speaker(uuid) to service_role;
grant execute on function public.apply_whatsapp_import(text, text, text, text, text, text, date, uuid, integer, jsonb) to service_role;
grant execute on function public.create_whatsapp_campaign(text, text, jsonb, uuid) to service_role;
grant execute on function public.claim_whatsapp_deliveries(uuid, integer) to service_role;
grant execute on function public.mark_stale_whatsapp_deliveries_unknown(uuid) to service_role;
grant execute on function public.refresh_whatsapp_campaign_status(uuid) to service_role;

-- Internal helpers only other functions and triggers call.
revoke all on function public.snapshot_speaker_round(uuid, integer) from public, anon, authenticated;
revoke all on function public.refresh_speaker_round_threshold(uuid, integer) from public, anon, authenticated;
revoke all on function public.touch_whatsapp_updated_at() from public, anon, authenticated;

-- The pre-electorate join path. The app stopped calling it in migration 013,
-- and it still writes the obsolete challenge_joins table.
revoke all on function public.join_challenge_round(uuid, uuid) from public, anon, authenticated;
