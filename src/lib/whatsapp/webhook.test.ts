// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  allowedPriorStatuses,
  extractWebhookEvents,
  isOptOutText,
  verifyWebhookSignature,
} from "@/lib/whatsapp/webhook";

describe("WhatsApp webhook signatures", () => {
  it("verifies the exact raw request body", () => {
    const rawBody = '{"object":"whatsapp_business_account"}';
    const signature =
      "sha256=73bb575f1206d6f67207f0ad17ce785e2ed26414aeb0a669b416ffeb647c3507";
    expect(
      verifyWebhookSignature(rawBody, signature, "fixed-app-secret"),
    ).toBe(true);
    expect(
      verifyWebhookSignature(`${rawBody}\n`, signature, "fixed-app-secret"),
    ).toBe(false);
    expect(verifyWebhookSignature(rawBody, "sha256=bad", "fixed-app-secret"))
      .toBe(false);
  });
});

describe("WhatsApp opt-out text", () => {
  it.each(["STOP", " unsubscribe ", "remove  me"])(
    "recognizes %j",
    (text) => expect(isOptOutText(text)).toBe(true),
  );

  it.each(["stop please", "remove", "hello"])("ignores %j", (text) => {
    expect(isOptOutText(text)).toBe(false);
  });
});

describe("WhatsApp webhook event extraction", () => {
  it("extracts and deduplicates supported statuses", () => {
    const change = {
      field: "messages",
      value: {
        statuses: [
          { id: "wamid.sent", status: "sent", timestamp: "0" },
          { id: "wamid.delivered", status: "delivered", timestamp: "0" },
          { id: "wamid.read", status: "read", timestamp: "0" },
          {
            id: "wamid.failed",
            status: "failed",
            timestamp: "0",
            errors: [{ code: 131, title: "Undeliverable" }],
          },
        ],
      },
    };
    const payload = {
      entry: [
        { changes: [change] },
        { changes: [change] },
      ],
    };

    expect(extractWebhookEvents(payload)).toEqual([
      {
        kind: "status",
        messageId: "wamid.sent",
        status: "sent",
        occurredAt: "1970-01-01T00:00:00.000Z",
      },
      {
        kind: "status",
        messageId: "wamid.delivered",
        status: "delivered",
        occurredAt: "1970-01-01T00:00:00.000Z",
      },
      {
        kind: "status",
        messageId: "wamid.read",
        status: "read",
        occurredAt: "1970-01-01T00:00:00.000Z",
      },
      {
        kind: "status",
        messageId: "wamid.failed",
        status: "failed",
        occurredAt: "1970-01-01T00:00:00.000Z",
        errorCode: "131",
        errorMessage: "Undeliverable",
      },
    ]);
  });

  it("extracts opt-outs and ignores other or non-Indian messages", () => {
    const payload = {
      entry: [
        {
          changes: [
            {
              field: "messages",
              value: {
                messages: [
                  {
                    from: "919876543210",
                    timestamp: "1",
                    type: "text",
                    text: { body: " remove   me " },
                  },
                  {
                    from: "919876543211",
                    timestamp: "1",
                    type: "text",
                    text: { body: "Hello" },
                  },
                  {
                    from: "14155552671",
                    timestamp: "1",
                    type: "text",
                    text: { body: "STOP" },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    expect(extractWebhookEvents(payload)).toEqual([
      {
        kind: "opt_out",
        phoneE164: "+919876543210",
        occurredAt: "1970-01-01T00:00:01.000Z",
      },
    ]);
  });

  it("does not allow a late sent event to replace delivered or read", () => {
    expect(allowedPriorStatuses("sent")).not.toContain("delivered");
    expect(allowedPriorStatuses("delivered")).toContain("sent");
    expect(allowedPriorStatuses("read")).toContain("delivered");
    expect(allowedPriorStatuses("failed")).not.toContain("read");
  });
});
