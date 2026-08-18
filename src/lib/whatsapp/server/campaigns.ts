import "server-only";
import { createServiceClient } from "@/lib/supabase/server";
import { validateCampaignInput } from "@/lib/whatsapp/template";
import type { CampaignParameters } from "@/lib/whatsapp/types";
import { getWhatsAppConfig } from "@/lib/whatsapp/server/config";
import {
  sendTemplateMessage,
  type MetaSendResult,
} from "@/lib/whatsapp/server/meta";

type ClaimedDelivery = {
  id: string;
  campaign_id: string;
  recipient_phone: string;
  recipient_name: string | null;
  attempt_count: number;
};

type DeliveryUpdate = {
  status: "sent" | "retryable_failed" | "failed" | "unknown";
  whatsapp_message_id?: string;
  claimed_at: null;
  last_error_code: string | null;
  last_error_message: string | null;
  sent_at?: string;
  failed_at?: string | null;
};

type CreateDependencies = {
  getConfig: () => { templateName: string; templateLanguage: string };
  createSnapshot: (input: {
    parameters: CampaignParameters;
    userId: string;
    templateName: string;
    languageCode: string;
  }) => Promise<{ campaignId: string; recipientCount: number }>;
};

type SendDependencies = {
  markStale: (campaignId: string) => Promise<void>;
  loadCampaign: (
    campaignId: string,
  ) => Promise<{ parameters: CampaignParameters } | null>;
  claim: (campaignId: string, limit: number) => Promise<ClaimedDelivery[]>;
  send: typeof sendTemplateMessage;
  updateDelivery: (id: string, update: DeliveryUpdate) => Promise<void>;
  refresh: (campaignId: string) => Promise<string>;
  hasPending: (campaignId: string) => Promise<boolean>;
};

export type BatchResult = {
  claimed: number;
  sent: number;
  retryable: number;
  failed: number;
  unknown: number;
  hasMore: boolean;
  retryAfterMs: number;
};

export class CampaignNotFoundError extends Error {
  constructor(message = "Campaign not found.") {
    super(message);
    this.name = "CampaignNotFoundError";
  }
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function defaultCreateDependencies(): CreateDependencies {
  return {
    getConfig: getWhatsAppConfig,
    async createSnapshot(input) {
      const supabase = createServiceClient();
      const { data, error } = await supabase.rpc("create_whatsapp_campaign", {
        p_template_name: input.templateName,
        p_language_code: input.languageCode,
        p_parameters: input.parameters,
        p_created_by: input.userId,
      });
      if (error) throw error;
      const result = Array.isArray(data) ? data[0] : data;
      if (!result) throw new Error("Campaign transaction returned no result.");
      return {
        campaignId: result.campaign_id as string,
        recipientCount: result.recipient_count as number,
      };
    },
  };
}

export async function createCampaign(
  parameters: CampaignParameters,
  userId: string,
  dependencies: CreateDependencies = defaultCreateDependencies(),
) {
  const validated = validateCampaignInput(parameters);
  const config = dependencies.getConfig();
  return dependencies.createSnapshot({
    parameters: validated,
    userId,
    templateName: config.templateName,
    languageCode: config.templateLanguage,
  });
}

function defaultSendDependencies(): SendDependencies {
  const supabase = createServiceClient();
  return {
    async markStale(campaignId) {
      const { error } = await supabase.rpc(
        "mark_stale_whatsapp_deliveries_unknown",
        { p_campaign_id: campaignId },
      );
      if (error) throw error;
    },
    async loadCampaign(campaignId) {
      const { data, error } = await supabase
        .from("whatsapp_campaigns")
        .select("parameters")
        .eq("id", campaignId)
        .maybeSingle<{ parameters: CampaignParameters }>();
      if (error) throw error;
      return data;
    },
    async claim(campaignId, limit) {
      const { data, error } = await supabase.rpc("claim_whatsapp_deliveries", {
        p_campaign_id: campaignId,
        p_limit: limit,
      });
      if (error) throw error;
      return (data ?? []) as ClaimedDelivery[];
    },
    send: sendTemplateMessage,
    async updateDelivery(id, update) {
      const { error } = await supabase
        .from("whatsapp_deliveries")
        .update(update)
        .eq("id", id);
      if (error) throw error;
    },
    async refresh(campaignId) {
      const { data, error } = await supabase.rpc(
        "refresh_whatsapp_campaign_status",
        { p_campaign_id: campaignId },
      );
      if (error) throw error;
      return String(data);
    },
    async hasPending(campaignId) {
      const { count, error } = await supabase
        .from("whatsapp_deliveries")
        .select("id", { count: "exact", head: true })
        .eq("campaign_id", campaignId)
        .in("status", ["queued", "retryable_failed"])
        .lt("attempt_count", 3);
      if (error) throw error;
      return (count ?? 0) > 0;
    },
  };
}

async function persistMetaResult(
  delivery: ClaimedDelivery,
  result: MetaSendResult,
  dependencies: SendDependencies,
): Promise<"sent" | "retryable" | "failed" | "unknown"> {
  const now = new Date().toISOString();
  if (result.kind === "sent") {
    await dependencies.updateDelivery(delivery.id, {
      status: "sent",
      whatsapp_message_id: result.messageId,
      claimed_at: null,
      last_error_code: null,
      last_error_message: null,
      sent_at: now,
    });
    return "sent";
  }

  if (result.kind === "retryable" && delivery.attempt_count < 3) {
    await dependencies.updateDelivery(delivery.id, {
      status: "retryable_failed",
      claimed_at: null,
      last_error_code: result.errorCode ?? null,
      last_error_message: result.message,
    });
    return "retryable";
  }

  if (result.kind === "unknown") {
    await dependencies.updateDelivery(delivery.id, {
      status: "unknown",
      claimed_at: null,
      last_error_code: result.errorCode ?? "unknown_outcome",
      last_error_message: result.message,
    });
    return "unknown";
  }

  await dependencies.updateDelivery(delivery.id, {
    status: "failed",
    claimed_at: null,
    last_error_code: result.errorCode ?? null,
    last_error_message: result.message,
    failed_at: now,
  });
  return "failed";
}

async function processDelivery(
  delivery: ClaimedDelivery,
  campaign: { parameters: CampaignParameters },
  dependencies: SendDependencies,
) {
  let result: MetaSendResult;
  try {
    result = await dependencies.send({
      delivery: {
        recipientPhone: delivery.recipient_phone,
        recipientName: delivery.recipient_name,
      },
      campaign: campaign.parameters,
    });
  } catch {
    result = {
      kind: "unknown",
      message: "The send outcome could not be confirmed.",
    };
  }
  return persistMetaResult(delivery, result, dependencies);
}

export async function sendCampaignBatch(
  campaignId: string,
  dependencies: SendDependencies = defaultSendDependencies(),
): Promise<BatchResult> {
  await dependencies.markStale(campaignId);
  const campaign = await dependencies.loadCampaign(campaignId);
  if (!campaign) throw new CampaignNotFoundError();
  const deliveries = await dependencies.claim(campaignId, 20);
  const counts = { sent: 0, retryable: 0, failed: 0, unknown: 0 };

  for (let index = 0; index < deliveries.length; index += 5) {
    const settled = await Promise.allSettled(
      deliveries
        .slice(index, index + 5)
        .map((delivery) => processDelivery(delivery, campaign, dependencies)),
    );
    for (const result of settled) {
      if (result.status === "fulfilled") counts[result.value] += 1;
      else counts.unknown += 1;
    }
  }

  await dependencies.refresh(campaignId);
  const hasMore = await dependencies.hasPending(campaignId);
  return {
    claimed: deliveries.length,
    ...counts,
    hasMore,
    retryAfterMs: hasMore && counts.retryable > 0 ? 1_000 : 0,
  };
}
