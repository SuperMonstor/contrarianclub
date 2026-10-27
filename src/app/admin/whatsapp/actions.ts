"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/auth";
import { currentAdminPath } from "@/lib/admin-routes";
import { createServiceClient } from "@/lib/supabase/server";
import {
  createAnnouncementCampaign,
  createWelcomeCampaign,
  isUuid,
} from "@/lib/whatsapp/server/campaigns";
import { createPosterUpload } from "@/lib/whatsapp/server/posters";

export async function createWhatsAppCampaign(formData: FormData) {
  const user = await requireAdminUser();
  if (formData.get("acknowledgeCharges") !== "yes") {
    throw new Error("Confirm that Meta messaging charges may apply.");
  }

  const result = await createAnnouncementCampaign(
    {
      debateNumber: String(formData.get("debateNumber") ?? ""),
      inviteOnly: formData.get("inviteOnly") === "yes",
      price: String(formData.get("price") ?? ""),
      location: String(formData.get("location") ?? ""),
      time: String(formData.get("time") ?? ""),
      detailsUrl: String(formData.get("detailsUrl") ?? ""),
      posterUrl: String(formData.get("posterUrl") ?? ""),
    },
    user.id,
  );
  redirect(
    `${await currentAdminPath(`/whatsapp/campaigns/${result.campaignId}`)}?send=1`,
  );
}

export async function createWhatsAppWelcomeCampaign(formData: FormData) {
  const user = await requireAdminUser();
  if (formData.get("acknowledgeCharges") !== "yes") {
    throw new Error("Confirm that Meta messaging charges may apply.");
  }
  const result = await createWelcomeCampaign(
    { headerImageUrl: String(formData.get("headerImageUrl") ?? "") },
    user.id,
  );
  redirect(
    `${await currentAdminPath(`/whatsapp/campaigns/${result.campaignId}`)}?send=1`,
  );
}

// Returns errors instead of throwing because production builds hide thrown
// Server Action messages, and the form shows this one inline.
export async function createWhatsAppPosterUpload(contentType: string, size: number) {
  await requireAdminUser();
  try {
    return { ok: true as const, ...(await createPosterUpload(contentType, size)) };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "The poster could not be uploaded.",
    };
  }
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
    .lt("attempt_count", 3)
    .select("campaign_id")
    .maybeSingle<{ campaign_id: string }>();
  if (error) throw error;
  if (!data) throw new Error("Unknown delivery not found.");

  revalidatePath(`/admin/whatsapp/campaigns/${data.campaign_id}`);
}

export async function setWhatsAppSubscriberActive(formData: FormData) {
  await requireAdminUser();
  const subscriberId = String(formData.get("subscriberId") ?? "");
  const activeValue = String(formData.get("isActive") ?? "");
  if (!isUuid(subscriberId) || !["true", "false"].includes(activeValue)) {
    throw new Error("Invalid subscriber update.");
  }
  const isActive = activeValue === "true";
  if (isActive && formData.get("confirmOptIn") !== "yes") {
    throw new Error("Confirm the subscriber's new opt-in before reactivating.");
  }

  const now = new Date().toISOString();
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("whatsapp_subscribers")
    .update({
      is_active: isActive,
      preference_at: now,
      preference_source: "admin",
      opted_out_at: isActive ? null : now,
    })
    .eq("id", subscriberId);
  if (error) throw error;

  revalidatePath("/admin/whatsapp");
  revalidatePath("/admin/whatsapp/subscribers");
}
