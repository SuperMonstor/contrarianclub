// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  createCampaign,
  sendCampaignBatch,
} from "@/lib/whatsapp/server/campaigns";

const parameters = {
  title: "A debate",
  date: "August 27",
  time: "7:00 PM",
  venue: "BIC",
  ticketUrl: "https://contrarian.club/tickets",
};

describe("WhatsApp campaign service", () => {
  it("creates a snapshot with the configured template", async () => {
    const createSnapshot = vi.fn().mockResolvedValue({
      campaignId: "campaign-1",
      recipientCount: 42,
    });

    await expect(
      createCampaign(parameters, "admin-1", {
        getConfig: () => ({
          templateName: "new_debate_announcement",
          templateLanguage: "en",
        }),
        createSnapshot,
      } as never),
    ).resolves.toEqual({ campaignId: "campaign-1", recipientCount: 42 });
    expect(createSnapshot).toHaveBeenCalledWith({
      parameters,
      userId: "admin-1",
      templateName: "new_debate_announcement",
      languageCode: "en",
    });
  });

  it("claims 20 at most and runs no more than five Meta calls together", async () => {
    const deliveries = Array.from({ length: 11 }, (_, index) => ({
      id: `delivery-${index}`,
      campaign_id: "campaign-1",
      recipient_phone: `+9190000000${String(index).padStart(2, "0")}`,
      recipient_name: null,
      attempt_count: 1,
    }));
    let active = 0;
    let maximumActive = 0;
    const send = vi.fn(async () => {
      active += 1;
      maximumActive = Math.max(maximumActive, active);
      await new Promise((resolve) => setTimeout(resolve, 1));
      active -= 1;
      return { kind: "sent" as const, messageId: `wamid.${Date.now()}` };
    });
    const updateDelivery = vi.fn().mockResolvedValue(undefined);
    const claim = vi.fn().mockResolvedValue(deliveries);
    const dependencies = {
      markStale: vi.fn().mockResolvedValue(undefined),
      loadCampaign: vi.fn().mockResolvedValue({ parameters }),
      claim,
      send,
      updateDelivery,
      refresh: vi.fn().mockResolvedValue("completed"),
      hasPending: vi.fn().mockResolvedValue(false),
    };

    const result = await sendCampaignBatch("campaign-1", dependencies as never);

    expect(claim).toHaveBeenCalledWith("campaign-1", 20);
    expect(maximumActive).toBeLessThanOrEqual(5);
    expect(updateDelivery).toHaveBeenCalledTimes(11);
    expect(result).toMatchObject({ claimed: 11, sent: 11, hasMore: false });
  });

  it.each([
    [{ kind: "retryable", errorCode: "4", message: "Busy" }, 1, "retryable_failed"],
    [{ kind: "retryable", errorCode: "4", message: "Busy" }, 3, "failed"],
    [{ kind: "terminal", errorCode: "132001", message: "Missing" }, 1, "failed"],
    [{ kind: "unknown", message: "No response" }, 1, "unknown"],
  ] as const)(
    "maps %j on attempt %s to %s",
    async (metaResult, attemptCount, expectedStatus) => {
      const updateDelivery = vi.fn().mockResolvedValue(undefined);
      const dependencies = {
        markStale: vi.fn().mockResolvedValue(undefined),
        loadCampaign: vi.fn().mockResolvedValue({ parameters }),
        claim: vi.fn().mockResolvedValue([
          {
            id: "delivery-1",
            campaign_id: "campaign-1",
            recipient_phone: "+919876543210",
            recipient_name: "Asha",
            attempt_count: attemptCount,
          },
        ]),
        send: vi.fn().mockResolvedValue(metaResult),
        updateDelivery,
        refresh: vi.fn().mockResolvedValue("partial_failed"),
        hasPending: vi.fn().mockResolvedValue(expectedStatus === "retryable_failed"),
      };

      await sendCampaignBatch("campaign-1", dependencies as never);
      expect(updateDelivery).toHaveBeenCalledWith(
        "delivery-1",
        expect.objectContaining({ status: expectedStatus }),
      );
    },
  );

  it("marks thrown send outcomes unknown", async () => {
    const updateDelivery = vi.fn().mockResolvedValue(undefined);
    await sendCampaignBatch("campaign-1", {
      markStale: vi.fn().mockResolvedValue(undefined),
      loadCampaign: vi.fn().mockResolvedValue({ parameters }),
      claim: vi.fn().mockResolvedValue([
        {
          id: "delivery-1",
          campaign_id: "campaign-1",
          recipient_phone: "+919876543210",
          recipient_name: null,
          attempt_count: 1,
        },
      ]),
      send: vi.fn().mockRejectedValue(new Error("network")),
      updateDelivery,
      refresh: vi.fn().mockResolvedValue("partial_failed"),
      hasPending: vi.fn().mockResolvedValue(false),
    } as never);
    expect(updateDelivery).toHaveBeenCalledWith(
      "delivery-1",
      expect.objectContaining({ status: "unknown" }),
    );
  });
});
