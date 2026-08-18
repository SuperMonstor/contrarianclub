import "server-only";
import { buildTemplatePayload } from "@/lib/whatsapp/template";
import type { CampaignParameters } from "@/lib/whatsapp/types";
import { getWhatsAppConfig } from "@/lib/whatsapp/server/config";

type SendInput = {
  delivery: {
    recipientPhone: string;
    recipientName: string | null;
  };
  campaign: CampaignParameters;
};

export type MetaSendResult =
  | { kind: "sent"; messageId: string }
  | {
      kind: "retryable" | "terminal" | "unknown";
      errorCode?: string;
      message: string;
    };

type MetaBody = {
  messages?: Array<{ id?: unknown }>;
  error?: { code?: unknown; message?: unknown };
};

function parseMetaBody(text: string): MetaBody | null {
  try {
    const value = JSON.parse(text);
    return value && typeof value === "object" ? (value as MetaBody) : null;
  } catch {
    return null;
  }
}

function safeError(body: MetaBody | null, fallback: string) {
  return {
    errorCode:
      body?.error?.code === undefined ? undefined : String(body.error.code),
    message:
      typeof body?.error?.message === "string"
        ? body.error.message.slice(0, 500)
        : fallback,
  };
}

export async function sendTemplateMessage(
  input: SendInput,
): Promise<MetaSendResult> {
  const config = getWhatsAppConfig();
  const payload = buildTemplatePayload(input.delivery, input.campaign, config);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(
      `https://graph.facebook.com/${config.graphApiVersion}/${config.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      },
    );
    const body = parseMetaBody(await response.text());

    if (response.ok) {
      const messageId = body?.messages?.[0]?.id;
      if (typeof messageId === "string" && messageId) {
        return { kind: "sent", messageId };
      }
      return {
        kind: "unknown",
        message: "Meta accepted the request without a usable message ID.",
      };
    }

    if (response.status === 429 || response.status >= 500) {
      return {
        kind: "retryable",
        ...safeError(body, "Meta is temporarily unavailable."),
      };
    }

    return {
      kind: "terminal",
      ...safeError(body, "Meta rejected the message."),
    };
  } catch {
    return {
      kind: "unknown",
      message: "The Meta response could not be confirmed.",
    };
  } finally {
    clearTimeout(timeout);
  }
}
