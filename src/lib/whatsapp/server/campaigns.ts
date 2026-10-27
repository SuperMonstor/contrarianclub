import "server-only";
import { createServiceClient } from "@/lib/supabase/server";
import {
  buildAnnouncementPayload,
  buildWelcomePayload,
  validateAnnouncement,
  validateWelcome,
  type AnnouncementInput,
  type WelcomeInput,
} from "@/lib/whatsapp/template";
import type { WhatsAppCampaignKind } from "@/lib/whatsapp/types";
import { getWhatsAppConfig } from "@/lib/whatsapp/server/config";
import {
  sendWhatsAppMessage,
  type MetaSendResult,
} from "@/lib/whatsapp/server/meta";
import { isWhatsAppPosterUrl } from "@/lib/whatsapp/server/posters";

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

type CampaignSnapshot = { campaignId: string; recipientCount: number };

type CreateDependencies = {
  getConfig: () => {
    templateName: string;
    welcomeTemplateName: string;
    templateLanguage: string;
  };
  isPosterUrl: (url: string) => boolean;
  createSnapshot: (input: {
    parameters: AnnouncementInput;
    userId: string;
    templateName: string;
    languageCode: string;
  }) => Promise<CampaignSnapshot>;
  createWelcomeSnapshot: (input: {
    parameters: WelcomeInput;
    userId: string;
    templateName: string;
    languageCode: string;
  }) => Promise<CampaignSnapshot>;
};

type SendableCampaign = {
  kind: WhatsAppCampaignKind;
  template_name: string;
  language_code: string;
  parameters: Record<string, unknown>;
};

type SendDependencies = {
  markStale: (campaignId: string) => Promise<void>;
  loadCampaign: (campaignId: string) => Promise<SendableCampaign | null>;
  claim: (campaignId: string, limit: number) => Promise<ClaimedDelivery[]>;
  send: typeof sendWhatsAppMessage;
  updateDelivery: (id: string, update: DeliveryUpdate) => Promise<void>;
  refresh: (campaignId: string) => Promise<string>;
  loadQueueState: (campaignId: string) => Promise<QueueState>;
};

type QueueState = {
  // Deliveries the next batch can still claim.
  pending: number;
  // Claimed deliveries whose send outcome is not recorded yet.
  inFlight: number;
  // Deliveries with an uncertain outcome an admin has to review.
  needsReview: number;
};

export type BatchResult = {
  claimed: number;
  sent: number;
  retryable: number;
  failed: number;
  unknown: number;
  hasMore: boolean;
  inFlight: number;
  needsReview: number;
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

export function canRetryUnknownDelivery(attemptCount: number): boolean {
  return Number.isInteger(attemptCount) && attemptCount >= 0 && attemptCount < 3;
}

function snapshotResult(data: unknown): CampaignSnapshot {
  const result = (Array.isArray(data) ? data[0] : data) as
    | { campaign_id: string; recipient_count: number }
    | null;
  if (!result) throw new Error("Campaign transaction returned no result.");
  return {
    campaignId: result.campaign_id,
    recipientCount: result.recipient_count,
  };
}

function defaultCreateDependencies(): CreateDependencies {
  return {
    getConfig: getWhatsAppConfig,
    isPosterUrl: isWhatsAppPosterUrl,
    async createSnapshot(input) {
      const supabase = createServiceClient();
      const { data, error } = await supabase.rpc("create_whatsapp_campaign", {
        p_template_name: input.templateName,
        p_language_code: input.languageCode,
        p_parameters: input.parameters,
        p_created_by: input.userId,
      });
      if (error) throw error;
      return snapshotResult(data);
    },
    async createWelcomeSnapshot(input) {
      const supabase = createServiceClient();
      const { data, error } = await supabase.rpc(
        "create_whatsapp_welcome_campaign",
        {
          p_template_name: input.templateName,
          p_language_code: input.languageCode,
          p_parameters: input.parameters,
          p_created_by: input.userId,
        },
      );
      if (error) throw error;
      return snapshotResult(data);
    },
  };
}

export async function createAnnouncementCampaign(
  input: AnnouncementInput,
  userId: string,
  dependencies: CreateDependencies = defaultCreateDependencies(),
) {
  const parameters = validateAnnouncement(input);
  if (!dependencies.isPosterUrl(parameters.posterUrl)) {
    throw new Error("Upload the poster again before sending.");
  }
  const config = dependencies.getConfig();
  return dependencies.createSnapshot({
    parameters,
    userId,
    templateName: config.templateName,
    languageCode: config.templateLanguage,
  });
}

export async function createWelcomeCampaign(
  input: WelcomeInput,
  userId: string,
  dependencies: CreateDependencies = defaultCreateDependencies(),
) {
  const parameters = validateWelcome(input);
  if (!dependencies.isPosterUrl(parameters.headerImageUrl)) {
    throw new Error("Upload the image again before sending.");
  }
  const config = dependencies.getConfig();
  return dependencies.createWelcomeSnapshot({
    parameters,
    userId,
    templateName: config.welcomeTemplateName,
    languageCode: config.templateLanguage,
  });
}

export async function getPendingWelcomeCount(): Promise<number> {
  const { data, error } = await createServiceClient().rpc(
    "count_pending_whatsapp_welcomes",
  );
  if (error) throw error;
  return Number(data ?? 0);
}

// Builds the Meta payload for one recipient. Campaign parameters are validated
// once, before any delivery is claimed, so a bad campaign fails the batch
// instead of failing every message.
function payloadBuilder(campaign: SendableCampaign) {
  const config = {
    templateName: campaign.template_name,
    templateLanguage: campaign.language_code,
  };
  if (campaign.kind === "welcome") {
    const parameters = validateWelcome(campaign.parameters as WelcomeInput);
    return (delivery: ClaimedDelivery) =>
      buildWelcomePayload(
        { phone: delivery.recipient_phone, name: delivery.recipient_name },
        parameters,
        config,
      );
  }
  const parameters = validateAnnouncement(campaign.parameters as AnnouncementInput);
  return (delivery: ClaimedDelivery) =>
    buildAnnouncementPayload(delivery.recipient_phone, parameters, config);
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
        .select("kind, template_name, language_code, parameters")
        .eq("id", campaignId)
        .maybeSingle<SendableCampaign>();
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
    send: sendWhatsAppMessage,
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
    async loadQueueState(campaignId) {
      const deliveries = () =>
        supabase
          .from("whatsapp_deliveries")
          .select("id", { count: "exact", head: true })
          .eq("campaign_id", campaignId);
      const results = await Promise.all([
        deliveries()
          .in("status", ["queued", "retryable_failed"])
          .lt("attempt_count", 3),
        deliveries().eq("status", "sending"),
        deliveries().eq("status", "unknown"),
      ]);
      for (const result of results) {
        if (result.error) throw result.error;
      }
      const [pending, inFlight, needsReview] = results.map(
        (result) => result.count ?? 0,
      );
      return { pending, inFlight, needsReview };
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
  buildPayload: (delivery: ClaimedDelivery) => object,
  dependencies: SendDependencies,
) {
  let result: MetaSendResult;
  try {
    result = await dependencies.send(buildPayload(delivery));
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
  const buildPayload = payloadBuilder(campaign);
  const deliveries = await dependencies.claim(campaignId, 20);
  const counts = { sent: 0, retryable: 0, failed: 0, unknown: 0 };

  for (let index = 0; index < deliveries.length; index += 5) {
    const settled = await Promise.allSettled(
      deliveries
        .slice(index, index + 5)
        .map((delivery) => processDelivery(delivery, buildPayload, dependencies)),
    );
    for (const result of settled) {
      if (result.status === "fulfilled") counts[result.value] += 1;
      else counts.unknown += 1;
    }
  }

  await dependencies.refresh(campaignId);
  const queue = await dependencies.loadQueueState(campaignId);
  const hasMore = queue.pending > 0;
  return {
    claimed: deliveries.length,
    ...counts,
    hasMore,
    inFlight: queue.inFlight,
    needsReview: queue.needsReview,
    retryAfterMs: hasMore && counts.retryable > 0 ? 1_000 : 0,
  };
}

type CampaignRecord = {
  id: string;
  kind: WhatsAppCampaignKind;
  template_name: string;
  language_code: string;
  parameters: Record<string, unknown>;
  status: string;
  recipient_count: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
};

type UnknownDelivery = {
  id: string;
  recipient_phone: string;
  recipient_name: string | null;
  attempt_count: number;
  last_error_message: string | null;
};

export async function getCampaignDetail(campaignId: string) {
  if (!isUuid(campaignId)) return null;
  const supabase = createServiceClient();
  const statuses = [
    "queued",
    "sending",
    "sent",
    "delivered",
    "read",
    "retryable_failed",
    "unknown",
    "failed",
    "skipped",
  ] as const;
  const [campaignResult, ...countResults] = await Promise.all([
    supabase
      .from("whatsapp_campaigns")
      .select(
        "id, kind, template_name, language_code, parameters, status, recipient_count, started_at, completed_at, created_at",
      )
      .eq("id", campaignId)
      .maybeSingle<CampaignRecord>(),
    ...statuses.map((status) =>
      supabase
        .from("whatsapp_deliveries")
        .select("id", { count: "exact", head: true })
        .eq("campaign_id", campaignId)
        .eq("status", status),
    ),
  ]);
  if (campaignResult.error) throw campaignResult.error;
  for (const result of countResults) {
    if (result.error) throw result.error;
  }
  if (!campaignResult.data) return null;

  const { data: unknownDeliveries, error: unknownError } = await supabase
    .from("whatsapp_deliveries")
    .select(
      "id, recipient_phone, recipient_name, attempt_count, last_error_message",
    )
    .eq("campaign_id", campaignId)
    .eq("status", "unknown")
    .order("updated_at", { ascending: false })
    .limit(50)
    .returns<UnknownDelivery[]>();
  if (unknownError) throw unknownError;

  return {
    campaign: campaignResult.data,
    counts: Object.fromEntries(
      statuses.map((status, index) => [status, countResults[index]?.count ?? 0]),
    ) as Record<(typeof statuses)[number], number>,
    unknownDeliveries: unknownDeliveries ?? [],
  };
}
