import { describe, expect, it } from "vitest";
import {
  buildTemplateParameters,
  buildTemplatePayload,
  validateCampaignInput,
} from "@/lib/whatsapp/template";

const campaign = {
  title: "Should AI replace software engineers?",
  date: "Thursday, August 27",
  time: "7:00 PM",
  venue: "Bangalore International Centre",
  ticketUrl: "https://contrarian.club/tickets/ai",
};

describe("WhatsApp campaign template", () => {
  it("uses a friendly fallback for a missing subscriber name", () => {
    expect(buildTemplateParameters(null, campaign)).toEqual([
      "there",
      "Should AI replace software engineers?",
      "Thursday, August 27",
      "7:00 PM",
      "Bangalore International Centre",
      "https://contrarian.club/tickets/ai",
    ]);
  });

  it("requires non-empty fields and an HTTPS ticket URL", () => {
    expect(() =>
      validateCampaignInput({ ...campaign, title: "  " }),
    ).toThrow("Debate title is required.");
    expect(() =>
      validateCampaignInput({ ...campaign, ticketUrl: "http://x.test" }),
    ).toThrow("Ticket URL must use HTTPS.");
    expect(() =>
      validateCampaignInput({ ...campaign, venue: "x".repeat(121) }),
    ).toThrow("Venue must be 120 characters or fewer.");
  });

  it("builds six ordered text parameters for Meta", () => {
    expect(
      buildTemplatePayload(
        { recipientPhone: "+919876543210", recipientName: " Asha " },
        campaign,
        {
          templateName: "new_debate_announcement",
          templateLanguage: "en",
        },
      ),
    ).toEqual({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: "919876543210",
      type: "template",
      template: {
        name: "new_debate_announcement",
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: "Asha" },
              { type: "text", text: campaign.title },
              { type: "text", text: campaign.date },
              { type: "text", text: campaign.time },
              { type: "text", text: campaign.venue },
              { type: "text", text: campaign.ticketUrl },
            ],
          },
        ],
      },
    });
  });
});
