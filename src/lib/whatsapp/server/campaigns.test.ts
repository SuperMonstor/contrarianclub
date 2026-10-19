// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  canRetryUnknownDelivery,
  createAnnouncementCampaign,
  createWelcomeCampaign,
  sendCampaignBatch,
} from "@/lib/whatsapp/server/campaigns";

const parameters = {
  debateNumber: "12",
  inviteOnly: false,
  motions: ["This house believes the AI boom is a bubble."],
  location: "BIC",
  time: "Saturday, 8 November, 7:00 PM",
  detailsUrl: "https://tickets.example/debate-12",
  posterUrl: "https://project.supabase.co/storage/v1/object/public/whatsapp-posters/a.png",
};

const announcementCampaign = {
  kind: "announcement",
  template_name: "debate_announcement",
  language_code: "en",
  parameters,
};

const config = () => ({
  templateName: "debate_announcement",
  welcomeTemplateName: "subscriber_welcome",
  templateLanguage: "en",
});

const emptyQueue = { pending: 0, inFlight: 0, needsReview: 0 };

describe("WhatsApp campaign service", () => {
  it("does not offer a retry after the third attempt", () => {
    expect(canRetryUnknownDelivery(2)).toBe(true);
    expect(canRetryUnknownDelivery(3)).toBe(false);
  });

  it("creates an announcement snapshot with the configured template", async () => {
    const createSnapshot = vi.fn().mockResolvedValue({
      campaignId: "campaign-1",
      recipientCount: 42,
    });

    await expect(
      createAnnouncementCampaign(parameters, "admin-1", {
        getConfig: config,
        isPosterUrl: () => true,
        createSnapshot,
      } as never),
    ).resolves.toEqual({ campaignId: "campaign-1", recipientCount: 42 });
    expect(createSnapshot).toHaveBeenCalledWith({
      parameters,
      userId: "admin-1",
      templateName: "debate_announcement",
      languageCode: "en",
    });
  });

  it("refuses a poster that is not in the club's poster bucket", async () => {
    const createSnapshot = vi.fn();
    await expect(
      createAnnouncementCampaign(parameters, "admin-1", {
        getConfig: config,
        isPosterUrl: () => false,
        createSnapshot,
      } as never),
    ).rejects.toThrow("Upload the poster again before sending.");
    expect(createSnapshot).not.toHaveBeenCalled();
  });

  it("creates a welcome snapshot with the welcome template", async () => {
    const createWelcomeSnapshot = vi.fn().mockResolvedValue({
      campaignId: "campaign-2",
      recipientCount: 7,
    });
    await createWelcomeCampaign("admin-1", {
      getConfig: config,
      createWelcomeSnapshot,
    } as never);
    expect(createWelcomeSnapshot).toHaveBeenCalledWith({
      userId: "admin-1",
      templateName: "subscriber_welcome",
      languageCode: "en",
    });
  });

  it("sends each campaign kind with its own template payload", async () => {
    const delivery = {
      id: "delivery-1",
      campaign_id: "campaign-1",
      recipient_phone: "+919876543210",
      recipient_name: "Asha",
      attempt_count: 1,
    };
    const run = async (campaign: object) => {
      const send = vi.fn().mockResolvedValue({ kind: "sent", messageId: "wamid.1" });
      await sendCampaignBatch("campaign-1", {
        markStale: vi.fn().mockResolvedValue(undefined),
        loadCampaign: vi.fn().mockResolvedValue(campaign),
        claim: vi.fn().mockResolvedValue([delivery]),
        send,
        updateDelivery: vi.fn().mockResolvedValue(undefined),
        refresh: vi.fn().mockResolvedValue("completed"),
        loadQueueState: vi.fn().mockResolvedValue(emptyQueue),
      } as never);
      return send.mock.calls[0][0];
    };

    const announcementPayload = await run(announcementCampaign);
    expect(announcementPayload.template.name).toBe("debate_announcement");
    expect(announcementPayload.template.components).toHaveLength(3);

    const welcomePayload = await run({
      kind: "welcome",
      template_name: "subscriber_welcome",
      language_code: "en",
      parameters: {},
    });
    expect(welcomePayload).toEqual({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: "919876543210",
      type: "template",
      template: { name: "subscriber_welcome", language: { code: "en" } },
    });
  });

  it("fails a batch with invalid parameters before claiming anyone", async () => {
    const claim = vi.fn();
    await expect(
      sendCampaignBatch("campaign-1", {
        markStale: vi.fn().mockResolvedValue(undefined),
        loadCampaign: vi.fn().mockResolvedValue({
          ...announcementCampaign,
          parameters: { title: "An older debate" },
        }),
        claim,
      } as never),
    ).rejects.toThrow();
    expect(claim).not.toHaveBeenCalled();
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
      loadCampaign: vi.fn().mockResolvedValue(announcementCampaign),
      claim,
      send,
      updateDelivery,
      refresh: vi.fn().mockResolvedValue("completed"),
      loadQueueState: vi.fn().mockResolvedValue(emptyQueue),
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
        loadCampaign: vi.fn().mockResolvedValue(announcementCampaign),
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
        loadQueueState: vi.fn().mockResolvedValue({
          ...emptyQueue,
          pending: expectedStatus === "retryable_failed" ? 1 : 0,
        }),
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
      loadCampaign: vi.fn().mockResolvedValue(announcementCampaign),
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
      loadQueueState: vi.fn().mockResolvedValue(emptyQueue),
    } as never);
    expect(updateDelivery).toHaveBeenCalledWith(
      "delivery-1",
      expect.objectContaining({ status: "unknown" }),
    );
  });

  it("reports in-flight and uncertain deliveries left from earlier batches", async () => {
    const result = await sendCampaignBatch("campaign-1", {
      markStale: vi.fn().mockResolvedValue(undefined),
      loadCampaign: vi.fn().mockResolvedValue(announcementCampaign),
      claim: vi.fn().mockResolvedValue([]),
      send: vi.fn(),
      updateDelivery: vi.fn(),
      refresh: vi.fn().mockResolvedValue("sending"),
      loadQueueState: vi
        .fn()
        .mockResolvedValue({ pending: 0, inFlight: 3, needsReview: 2 }),
    } as never);

    expect(result).toMatchObject({
      claimed: 0,
      hasMore: false,
      inFlight: 3,
      needsReview: 2,
    });
  });
});
