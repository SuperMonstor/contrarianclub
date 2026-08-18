// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/whatsapp/server/config", () => ({
  getWhatsAppConfig: () => ({
    accessToken: "secret-token",
    phoneNumberId: "phone-id",
    businessAccountId: "waba-id",
    appSecret: "app-secret",
    webhookVerifyToken: "verify-token",
    graphApiVersion: "v25.0",
    templateName: "new_debate_announcement",
    templateLanguage: "en",
  }),
}));

import { sendTemplateMessage } from "@/lib/whatsapp/server/meta";

const originalFetch = global.fetch;
const input = {
  delivery: {
    recipientPhone: "+919876543210",
    recipientName: "Asha",
  },
  campaign: {
    title: "A debate",
    date: "August 27",
    time: "7:00 PM",
    venue: "BIC",
    ticketUrl: "https://contrarian.club/tickets",
  },
};

afterEach(() => {
  global.fetch = originalFetch;
  vi.useRealTimers();
});

beforeEach(() => vi.restoreAllMocks());

describe("Meta WhatsApp message sending", () => {
  it("returns Meta's message ID after acceptance", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ messages: [{ id: "wamid.123" }] }), {
        status: 200,
      }),
    );
    await expect(sendTemplateMessage(input)).resolves.toEqual({
      kind: "sent",
      messageId: "wamid.123",
    });
  });

  it.each([429, 500, 503])("classifies HTTP %s as retryable", async (status) => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: { code: 4, message: "Busy" } }), {
        status,
      }),
    );
    await expect(sendTemplateMessage(input)).resolves.toMatchObject({
      kind: "retryable",
      errorCode: "4",
    });
  });

  it("classifies other Meta 4xx responses as terminal", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ error: { code: 132001, message: "Template missing" } }),
        { status: 400 },
      ),
    );
    await expect(sendTemplateMessage(input)).resolves.toEqual({
      kind: "terminal",
      errorCode: "132001",
      message: "Template missing",
    });
  });

  it("marks malformed successful responses as unknown", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response("not json", { status: 200 }),
    );
    await expect(sendTemplateMessage(input)).resolves.toMatchObject({
      kind: "unknown",
    });
  });

  it("marks network failures as unknown because Meta may have accepted", async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError("network lost"));
    await expect(sendTemplateMessage(input)).resolves.toMatchObject({
      kind: "unknown",
    });
  });
});
