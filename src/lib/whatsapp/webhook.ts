import { createHmac, timingSafeEqual } from "node:crypto";
import { normalizeIndianPhone } from "@/lib/whatsapp/phone";
import type { WhatsAppDeliveryStatus } from "@/lib/whatsapp/types";

export type WhatsAppWebhookEvent =
  | {
      kind: "status";
      messageId: string;
      status: "sent" | "delivered" | "read" | "failed";
      occurredAt: string;
      errorCode?: string;
      errorMessage?: string;
    }
  | { kind: "opt_out"; phoneE164: string; occurredAt: string };

type JsonRecord = Record<string, unknown>;

function record(value: unknown): JsonRecord | null {
  return value !== null && typeof value === "object"
    ? (value as JsonRecord)
    : null;
}

function array(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function timestampIso(value: unknown): string | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds < 0) return null;
  return new Date(seconds * 1000).toISOString();
}

export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
  appSecret: string,
): boolean {
  if (!signature?.startsWith("sha256=") || !appSecret) return false;
  const suppliedHex = signature.slice(7);
  if (!/^[a-f0-9]{64}$/i.test(suppliedHex)) return false;

  const expected = createHmac("sha256", appSecret).update(rawBody).digest();
  const supplied = Buffer.from(suppliedHex, "hex");
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

// Typed replies, plus the labels of quick reply stop buttons. This number
// only sends announcements, so a bare "no" reply also counts as opting out.
const OPT_OUT_PHRASES = [
  "STOP",
  "NO",
  "UNSUBSCRIBE",
  "REMOVE ME",
  "STOP PROMOTIONS",
  "STOP UPDATES",
];

export function isOptOutText(value: string): boolean {
  const normalized = value.trim().replace(/\s+/g, " ").toUpperCase();
  return OPT_OUT_PHRASES.includes(normalized);
}

// A typed reply arrives as a text message. A tap on a template quick reply
// button arrives as a button message carrying the button's label and payload.
function replyText(message: JsonRecord): string | null {
  if (message.type === "text") {
    const body = record(message.text)?.body;
    return typeof body === "string" ? body : null;
  }
  if (message.type === "button") {
    const button = record(message.button);
    if (typeof button?.text === "string") return button.text;
    return typeof button?.payload === "string" ? button.payload : null;
  }
  return null;
}

export function allowedPriorStatuses(
  status: "sent" | "delivered" | "read" | "failed",
): WhatsAppDeliveryStatus[] {
  const pending: WhatsAppDeliveryStatus[] = [
    "queued",
    "sending",
    "retryable_failed",
  ];
  if (status === "sent") return [...pending, "sent"];
  if (status === "delivered") return [...pending, "sent", "delivered"];
  if (status === "read") return [...pending, "sent", "delivered", "read"];
  return [...pending, "sent", "failed"];
}

function statusEvents(value: JsonRecord): WhatsAppWebhookEvent[] {
  const events: WhatsAppWebhookEvent[] = [];
  for (const item of array(value.statuses)) {
    const statusRecord = record(item);
    if (!statusRecord) continue;
    const messageId = statusRecord.id;
    const status = statusRecord.status;
    const occurredAt = timestampIso(statusRecord.timestamp);
    if (
      typeof messageId !== "string" ||
      !["sent", "delivered", "read", "failed"].includes(String(status)) ||
      !occurredAt
    ) {
      continue;
    }

    const event: WhatsAppWebhookEvent = {
      kind: "status",
      messageId,
      status: status as "sent" | "delivered" | "read" | "failed",
      occurredAt,
    };
    const error = record(array(statusRecord.errors)[0]);
    if (event.status === "failed" && error) {
      if (error.code !== undefined) event.errorCode = String(error.code);
      const message =
        typeof error.title === "string"
          ? error.title
          : typeof error.message === "string"
            ? error.message
            : null;
      if (message) event.errorMessage = message.slice(0, 500);
    }
    events.push(event);
  }
  return events;
}

function optOutEvents(value: JsonRecord): WhatsAppWebhookEvent[] {
  const events: WhatsAppWebhookEvent[] = [];
  for (const item of array(value.messages)) {
    const message = record(item);
    const text = message ? replyText(message) : null;
    if (!message || text === null || !isOptOutText(text)) continue;
    const phoneE164 = normalizeIndianPhone(message.from);
    const occurredAt = timestampIso(message.timestamp);
    if (!phoneE164 || !occurredAt) continue;
    events.push({ kind: "opt_out", phoneE164, occurredAt });
  }
  return events;
}

export function extractWebhookEvents(payload: unknown): WhatsAppWebhookEvent[] {
  const root = record(payload);
  if (!root) return [];
  const events: WhatsAppWebhookEvent[] = [];

  for (const entryValue of array(root.entry)) {
    const entry = record(entryValue);
    for (const changeValue of array(entry?.changes)) {
      const change = record(changeValue);
      if (!change || change.field !== "messages") continue;
      const value = record(change.value);
      if (!value) continue;
      events.push(...statusEvents(value), ...optOutEvents(value));
    }
  }

  const deduplicated = new Map<string, WhatsAppWebhookEvent>();
  for (const event of events) {
    const key =
      event.kind === "status"
        ? `status:${event.messageId}:${event.status}:${event.occurredAt}`
        : `opt-out:${event.phoneE164}:${event.occurredAt}`;
    deduplicated.set(key, event);
  }
  return [...deduplicated.values()];
}
