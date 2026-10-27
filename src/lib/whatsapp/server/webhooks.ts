import "server-only";
import { createServiceClient } from "@/lib/supabase/server";
import {
  OPT_OUT_CONFIRMATION,
  buildTextPayload,
} from "@/lib/whatsapp/template";
import { allowedPriorStatuses } from "@/lib/whatsapp/webhook";
import type { WhatsAppWebhookEvent } from "@/lib/whatsapp/webhook";
import {
  sendWhatsAppMessage,
  type MetaSendResult,
} from "@/lib/whatsapp/server/meta";

type ServiceClient = ReturnType<typeof createServiceClient>;
type SendReply = (payload: object) => Promise<MetaSendResult>;

async function processStatusEvent(
  event: Extract<WhatsAppWebhookEvent, { kind: "status" }>,
  supabase: ServiceClient,
) {
  const timestampField = {
    sent: "sent_at",
    delivered: "delivered_at",
    read: "read_at",
    failed: "failed_at",
  }[event.status];
  const update: Record<string, string | null> = {
    status: event.status,
    [timestampField]: event.occurredAt,
  };
  if (event.status === "failed") {
    update.last_error_code = event.errorCode ?? null;
    update.last_error_message = event.errorMessage ?? "Meta reported delivery failure.";
  }

  const { data, error } = await supabase
    .from("whatsapp_deliveries")
    .update(update)
    .eq("whatsapp_message_id", event.messageId)
    .in("status", allowedPriorStatuses(event.status))
    .select("campaign_id")
    .maybeSingle<{ campaign_id: string }>();
  if (error) throw error;
  if (data?.campaign_id) {
    const { error: refreshError } = await supabase.rpc(
      "refresh_whatsapp_campaign_status",
      { p_campaign_id: data.campaign_id },
    );
    if (refreshError) throw refreshError;
  }
}

// A failed confirmation must not fail the webhook: the opt-out is already
// stored, and a retried webhook would find the subscriber inactive anyway.
async function confirmOptOut(phoneE164: string, sendReply: SendReply) {
  try {
    const result = await sendReply(buildTextPayload(phoneE164, OPT_OUT_CONFIRMATION));
    if (result.kind !== "sent") {
      console.error("WhatsApp opt-out confirmation failed:", result.message);
    }
  } catch (error) {
    console.error(
      "WhatsApp opt-out confirmation failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
  }
}

async function processOptOutEvent(
  event: Extract<WhatsAppWebhookEvent, { kind: "opt_out" }>,
  supabase: ServiceClient,
  sendReply: SendReply,
) {
  const optOut = {
    is_active: false,
    preference_at: event.occurredAt,
    preference_source: "whatsapp",
    opted_out_at: event.occurredAt,
  };

  // Only the change from active to inactive is confirmed, so repeated STOPs
  // and Meta's webhook retries never send a second reply.
  const { data, error } = await supabase
    .from("whatsapp_subscribers")
    .update(optOut)
    .eq("phone_e164", event.phoneE164)
    .eq("is_active", true)
    .select("id");
  if (error) throw error;
  if (data?.length) {
    await confirmOptOut(event.phoneE164, sendReply);
    return;
  }

  // Already inactive: still record the newest preference so an older import
  // cannot reactivate the subscriber.
  const { error: recordError } = await supabase
    .from("whatsapp_subscribers")
    .update(optOut)
    .eq("phone_e164", event.phoneE164);
  if (recordError) throw recordError;
}

export async function processWhatsAppWebhookEvents(
  events: WhatsAppWebhookEvent[],
  supabase: ServiceClient = createServiceClient(),
  sendReply: SendReply = sendWhatsAppMessage,
): Promise<void> {
  for (const event of events) {
    if (event.kind === "status") await processStatusEvent(event, supabase);
    else await processOptOutEvent(event, supabase, sendReply);
  }
}
