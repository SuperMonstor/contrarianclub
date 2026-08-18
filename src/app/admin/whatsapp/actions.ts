"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/auth";
import { currentAdminPath } from "@/lib/admin-routes";
import { createServiceClient } from "@/lib/supabase/server";
import {
  createCampaign,
  isUuid,
} from "@/lib/whatsapp/server/campaigns";

export async function createWhatsAppCampaign(formData: FormData) {
  const user = await requireAdminUser();
  if (formData.get("acknowledgeCharges") !== "yes") {
    throw new Error("Confirm that Meta messaging charges may apply.");
  }

  const result = await createCampaign(
    {
      title: String(formData.get("title") ?? ""),
      date: String(formData.get("date") ?? ""),
      time: String(formData.get("time") ?? ""),
      venue: String(formData.get("venue") ?? ""),
      ticketUrl: String(formData.get("ticketUrl") ?? ""),
    },
    user.id,
  );
  redirect(
    `${await currentAdminPath(`/whatsapp/campaigns/${result.campaignId}`)}?send=1`,
  );
}

export async function requeueUnknownWhatsAppDelivery(formData: FormData) {
  await requireAdminUser();
  if (formData.get("acknowledgeDuplicateRisk") !== "yes") {
    throw new Error("Acknowledge the duplicate-send risk before retrying.");
  }
  const deliveryId = String(formData.get("deliveryId") ?? "");
  if (!isUuid(deliveryId)) throw new Error("Invalid delivery ID.");

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("whatsapp_deliveries")
    .update({
      status: "queued",
      claimed_at: null,
      last_error_code: null,
      last_error_message: null,
    })
    .eq("id", deliveryId)
    .eq("status", "unknown")
    .select("campaign_id")
    .maybeSingle<{ campaign_id: string }>();
  if (error) throw error;
  if (!data) throw new Error("Unknown delivery not found.");

  revalidatePath(`/admin/whatsapp/campaigns/${data.campaign_id}`);
}
