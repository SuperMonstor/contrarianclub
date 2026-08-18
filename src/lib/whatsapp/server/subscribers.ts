import "server-only";
import { createServiceClient } from "@/lib/supabase/server";

export type WhatsAppSubscriber = {
  id: string;
  phone_e164: string;
  name: string | null;
  is_active: boolean;
  preference_at: string;
  preference_source: "import" | "whatsapp" | "admin";
  opted_out_at: string | null;
};

export type WhatsAppImportSummary = {
  id: string;
  file_name: string;
  added_count: number;
  updated_count: number;
  deactivated_count: number;
  unchanged_count: number;
  invalid_count: number;
  created_at: string;
};

export type WhatsAppCampaignSummary = {
  id: string;
  parameters: {
    title?: string;
    date?: string;
  };
  status: string;
  recipient_count: number;
  created_at: string;
};

export async function getWhatsAppOverview() {
  const supabase = createServiceClient();
  const [active, inactive, latestImport, recentCampaigns] = await Promise.all([
    supabase
      .from("whatsapp_subscribers")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("whatsapp_subscribers")
      .select("id", { count: "exact", head: true })
      .eq("is_active", false),
    supabase
      .from("whatsapp_imports")
      .select(
        "id, file_name, added_count, updated_count, deactivated_count, unchanged_count, invalid_count, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<WhatsAppImportSummary>(),
    supabase
      .from("whatsapp_campaigns")
      .select("id, parameters, status, recipient_count, created_at")
      .order("created_at", { ascending: false })
      .limit(8)
      .returns<WhatsAppCampaignSummary[]>(),
  ]);

  for (const result of [active, inactive, latestImport, recentCampaigns]) {
    if (result.error) throw result.error;
  }
  return {
    activeCount: active.count ?? 0,
    inactiveCount: inactive.count ?? 0,
    latestImport: latestImport.data,
    recentCampaigns: recentCampaigns.data ?? [],
  };
}

function safeSearchTerm(value: string): string {
  return value.trim().replace(/[^a-zA-Z0-9+\s-]/g, "").slice(0, 80);
}

export async function getWhatsAppSubscribers(search: string) {
  const supabase = createServiceClient();
  const term = safeSearchTerm(search);
  let query = supabase
    .from("whatsapp_subscribers")
    .select(
      "id, phone_e164, name, is_active, preference_at, preference_source, opted_out_at",
    )
    .order("updated_at", { ascending: false })
    .limit(200);

  if (term) {
    query = query.or(`name.ilike.%${term}%,phone_e164.ilike.%${term}%`);
  }
  const { data, error } = await query.returns<WhatsAppSubscriber[]>();
  if (error) throw error;
  return data ?? [];
}

export async function getActiveWhatsAppSubscriberCount() {
  const supabase = createServiceClient();
  const { count, error } = await supabase
    .from("whatsapp_subscribers")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);
  if (error) throw error;
  return count ?? 0;
}
