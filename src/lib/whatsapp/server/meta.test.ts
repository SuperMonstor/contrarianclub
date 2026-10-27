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
    templateName: "debate_announcement",
    welcomeTemplateName: "subscriber_welcome",
    templateLanguage: "en",
  }),
}));

import { sendWhatsAppMessage } from "@/lib/whatsapp/server/meta";

const originalFetch = global.fetch;
const input = {
  messaging_product: "whatsapp",
  to: "919876543210",
  type: "template",
  template: { name: "subscriber_welcome", language: { code: "en" } },
};

afterEach(() => {
  global.fetch = originalFetch;
  vi.useRealTimers();
});

beforeEach(() => vi.restoreAllMocks());

describe("Meta WhatsApp message sending", () => {
  it("posts the payload and returns Meta's message ID after acceptance", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ messages: [{ id: "wamid.123" }] }), {
        status: 200,
      }),
    );
    global.fetch = fetchMock;
    await expect(sendWhatsAppMessage(input)).resolves.toEqual({
      kind: "sent",
      messageId: "wamid.123",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://graph.facebook.com/v25.0/phone-id/messages",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(input),
        headers: expect.objectContaining({
          Authorization: "Bearer secret-token",
        }),
      }),
    );
  });

  it.each([429, 500, 503])("classifies HTTP %s as retryable", async (status) => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: { code: 4, message: "Busy" } }), {
        status,
      }),
    );
    await expect(sendWhatsAppMessage(input)).resolves.toMatchObject({
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
    await expect(sendWhatsAppMessage(input)).resolves.toEqual({
      kind: "terminal",
      errorCode: "132001",
      message: "Template missing",
    });
  });

  it("marks malformed successful responses as unknown", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response("not json", { status: 200 }),
    );
    await expect(sendWhatsAppMessage(input)).resolves.toMatchObject({
      kind: "unknown",
    });
  });

  it("marks network failures as unknown because Meta may have accepted", async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError("network lost"));
    await expect(sendWhatsAppMessage(input)).resolves.toMatchObject({
      kind: "unknown",
    });
  });
});
