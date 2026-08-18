// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { processWhatsAppWebhookEvents } from "@/lib/whatsapp/server/webhooks";

describe("WhatsApp webhook database processing", () => {
  it("applies a monotonic status update and refreshes its campaign", async () => {
    const update = vi.fn();
    const statusChain = {
      eq: vi.fn(),
      in: vi.fn(),
      select: vi.fn(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { campaign_id: "campaign-1" },
        error: null,
      }),
    };
    statusChain.eq.mockReturnValue(statusChain);
    statusChain.in.mockReturnValue(statusChain);
    statusChain.select.mockReturnValue(statusChain);
    update.mockReturnValue(statusChain);
    const client = {
      from: vi.fn().mockReturnValue({ update }),
      rpc: vi.fn().mockResolvedValue({ error: null }),
    };

    await processWhatsAppWebhookEvents(
      [
        {
          kind: "status",
          messageId: "wamid.123",
          status: "read",
          occurredAt: "2026-08-19T10:00:00.000Z",
        },
      ],
      client as never,
    );

    expect(update).toHaveBeenCalledWith({
      status: "read",
      read_at: "2026-08-19T10:00:00.000Z",
    });
    expect(statusChain.eq).toHaveBeenCalledWith(
      "whatsapp_message_id",
      "wamid.123",
    );
    expect(statusChain.in).toHaveBeenCalledWith("status", [
      "queued",
      "sending",
      "retryable_failed",
      "sent",
      "delivered",
      "read",
    ]);
    expect(client.rpc).toHaveBeenCalledWith(
      "refresh_whatsapp_campaign_status",
      { p_campaign_id: "campaign-1" },
    );
  });

  it("always records an explicit WhatsApp opt-out immediately", async () => {
    const optOutChain = {
      eq: vi.fn().mockResolvedValue({ error: null }),
    };
    const update = vi.fn().mockReturnValue(optOutChain);
    const client = {
      from: vi.fn().mockReturnValue({ update }),
      rpc: vi.fn(),
    };

    await processWhatsAppWebhookEvents(
      [
        {
          kind: "opt_out",
          phoneE164: "+919876543210",
          occurredAt: "2026-08-19T10:00:00.000Z",
        },
      ],
      client as never,
    );

    expect(update).toHaveBeenCalledWith({
      is_active: false,
      preference_at: "2026-08-19T10:00:00.000Z",
      preference_source: "whatsapp",
      opted_out_at: "2026-08-19T10:00:00.000Z",
    });
    expect(optOutChain.eq).toHaveBeenCalledWith(
      "phone_e164",
      "+919876543210",
    );
  });
});
