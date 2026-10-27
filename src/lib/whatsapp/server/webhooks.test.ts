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

  const optOutEvent = {
    kind: "opt_out" as const,
    phoneE164: "+919876543210",
    occurredAt: "2026-08-19T10:00:00.000Z",
  };
  const optOutUpdate = {
    is_active: false,
    preference_at: "2026-08-19T10:00:00.000Z",
    preference_source: "whatsapp",
    opted_out_at: "2026-08-19T10:00:00.000Z",
  };

  // The first update only matches active subscribers. The fallback update
  // records the preference for anyone already inactive.
  function optOutClient(activeRows: { id: string }[]) {
    const transition = {
      eq: vi.fn(),
      select: vi.fn().mockResolvedValue({ data: activeRows, error: null }),
    };
    transition.eq.mockReturnValue(transition);
    const record = { eq: vi.fn().mockResolvedValue({ error: null }) };
    const update = vi.fn().mockReturnValueOnce(transition).mockReturnValueOnce(record);
    return {
      client: { from: vi.fn().mockReturnValue({ update }), rpc: vi.fn() },
      update,
      transition,
      record,
    };
  }

  it("records an opt-out and confirms it to an active subscriber", async () => {
    const { client, update, transition } = optOutClient([{ id: "subscriber-1" }]);
    const sendReply = vi.fn().mockResolvedValue({ kind: "sent", messageId: "wamid.2" });

    await processWhatsAppWebhookEvents([optOutEvent], client as never, sendReply);

    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith(optOutUpdate);
    expect(transition.eq).toHaveBeenCalledWith("phone_e164", "+919876543210");
    expect(transition.eq).toHaveBeenCalledWith("is_active", true);
    expect(sendReply).toHaveBeenCalledWith({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: "919876543210",
      type: "text",
      text: {
        body: "You've been unsubscribed from The Contrarian Debate Club. You won't receive any more messages from us.",
      },
    });
  });

  it("records a repeat opt-out without replying again", async () => {
    const { client, update, record } = optOutClient([]);
    const sendReply = vi.fn();

    await processWhatsAppWebhookEvents([optOutEvent], client as never, sendReply);

    expect(update).toHaveBeenCalledTimes(2);
    expect(update).toHaveBeenLastCalledWith(optOutUpdate);
    expect(record.eq).toHaveBeenCalledWith("phone_e164", "+919876543210");
    expect(sendReply).not.toHaveBeenCalled();
  });

  it("keeps the opt-out when the confirmation cannot be sent", async () => {
    const { client } = optOutClient([{ id: "subscriber-1" }]);
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const sendReply = vi.fn().mockRejectedValue(new Error("network"));

    await expect(
      processWhatsAppWebhookEvents([optOutEvent], client as never, sendReply),
    ).resolves.toBeUndefined();
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });
});
