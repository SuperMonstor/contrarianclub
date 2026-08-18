import "server-only";
import { createServiceClient } from "@/lib/supabase/server";
import { allowedPriorStatuses } from "@/lib/whatsapp/webhook";
import type { WhatsAppWebhookEvent } from "@/lib/whatsapp/webhook";

type ServiceClient = ReturnType<typeof createServiceClient>;

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

async function processOptOutEvent(
  event: Extract<WhatsAppWebhookEvent, { kind: "opt_out" }>,
  supabase: ServiceClient,
) {
  const { error } = await supabase
    .from("whatsapp_subscribers")
    .update({
      is_active: false,
      preference_at: event.occurredAt,
      preference_source: "whatsapp",
      opted_out_at: event.occurredAt,
    })
    .eq("phone_e164", event.phoneE164);
  if (error) throw error;
}

export async function processWhatsAppWebhookEvents(
  events: WhatsAppWebhookEvent[],
  supabase: ServiceClient = createServiceClient(),
): Promise<void> {
  for (const event of events) {
    if (event.kind === "status") await processStatusEvent(event, supabase);
    else await processOptOutEvent(event, supabase);
  }
}
