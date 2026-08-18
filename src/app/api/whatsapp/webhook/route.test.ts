// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/whatsapp/server/config", () => ({
  getWhatsAppConfig: () => ({
    appSecret: "app-secret",
    webhookVerifyToken: "verify-token",
  }),
}));
vi.mock("@/lib/whatsapp/webhook", () => ({
  verifyWebhookSignature: vi.fn(),
  extractWebhookEvents: vi.fn(),
}));
vi.mock("@/lib/whatsapp/server/webhooks", () => ({
  processWhatsAppWebhookEvents: vi.fn(),
}));

import { GET, POST } from "@/app/api/whatsapp/webhook/route";
import {
  extractWebhookEvents,
  verifyWebhookSignature,
} from "@/lib/whatsapp/webhook";
import { processWhatsAppWebhookEvents } from "@/lib/whatsapp/server/webhooks";

describe("Meta WhatsApp webhook route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(verifyWebhookSignature).mockReturnValue(true);
    vi.mocked(extractWebhookEvents).mockReturnValue([]);
    vi.mocked(processWhatsAppWebhookEvents).mockResolvedValue(undefined);
  });

  it("returns the challenge only for Meta's valid verification request", async () => {
    const valid = await GET(
      new Request(
        "https://club.test/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=verify-token&hub.challenge=12345",
      ),
    );
    expect(valid.status).toBe(200);
    await expect(valid.text()).resolves.toBe("12345");

    const invalid = await GET(
      new Request(
        "https://club.test/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=12345",
      ),
    );
    expect(invalid.status).toBe(403);
  });

  it("rejects a bad signature before attempting JSON parsing", async () => {
    vi.mocked(verifyWebhookSignature).mockReturnValue(false);
    const response = await POST(
      new Request("https://club.test/api/whatsapp/webhook", {
        method: "POST",
        headers: { "x-hub-signature-256": "sha256=bad" },
        body: "not json",
      }),
    );
    expect(response.status).toBe(401);
    expect(extractWebhookEvents).not.toHaveBeenCalled();
  });

  it("acknowledges signed payloads after processing their events", async () => {
    const events = [
      {
        kind: "status" as const,
        messageId: "wamid.123",
        status: "read" as const,
        occurredAt: "2026-08-19T00:00:00.000Z",
      },
    ];
    vi.mocked(extractWebhookEvents).mockReturnValue(events);
    const response = await POST(
      new Request("https://club.test/api/whatsapp/webhook", {
        method: "POST",
        headers: { "x-hub-signature-256": "sha256=valid" },
        body: "{}",
      }),
    );
    expect(response.status).toBe(200);
    expect(processWhatsAppWebhookEvents).toHaveBeenCalledWith(events);
  });
});
