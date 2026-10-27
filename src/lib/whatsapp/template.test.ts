import { describe, expect, it } from "vitest";
import {
  ANNOUNCEMENT_TEMPLATE_BODY,
  buildAnnouncementPayload,
  buildWelcomePayload,
  campaignLabel,
  greetingName,
  WELCOME_TEMPLATE_BODY,
  renderAnnouncementBody,
  validateAnnouncement,
} from "@/lib/whatsapp/template";

const announcement = {
  debateNumber: "12",
  inviteOnly: false,
  price: "599",
  location: "Bangalore International Centre",
  time: "Saturday, 8 November, 7:00 PM",
  detailsUrl: "https://offlyn.life/e/ncWEIfi",
  posterUrl: "https://project.supabase.co/storage/v1/object/public/whatsapp-posters/a.png",
};

const config = { templateName: "debate_announcement", templateLanguage: "en" };

describe("WhatsApp announcement template", () => {
  it("matches the body submitted to Meta", () => {
    expect(ANNOUNCEMENT_TEMPLATE_BODY).toBe(
      "*Contrarian Debate Club #{{1}}*\nWe're reaching out because you opted in to hear about future debates from The Contrarian Debate Club.\n\nFor the next 24 hours, before it goes public, tickets are capped at ₹{{2}} for people who've attended our debates before.\n*Time:* {{3}}\n*Location:* {{4}}\n\nTap below to book before it opens to everyone.",
    );
  });

  it("fills the time, place and price, and marks invite-only debates", () => {
    const body = renderAnnouncementBody(
      validateAnnouncement({ ...announcement, inviteOnly: true }),
    );
    expect(body).toContain("*Contrarian Debate Club #12 (invite only)*");
    expect(body).toContain("*Time:* Saturday, 8 November, 7:00 PM");
    expect(body).toContain("*Location:* Bangalore International Centre");
    expect(body).toContain("tickets are capped at ₹599 for people");
  });

  it("flattens line breaks and repeated spaces that Meta rejects", () => {
    const parameters = validateAnnouncement({
      ...announcement,
      time: "  Saturday\n7:00    PM  ",
      location: "Hall\tB",
    });
    expect(parameters.time).toBe("Saturday 7:00 PM");
    expect(parameters.location).toBe("Hall B");
  });

  it("rejects incomplete or unsafe input", () => {
    expect(() => validateAnnouncement({ ...announcement, debateNumber: "twelve" })).toThrow(
      "Debate number must be a whole number, such as 12.",
    );
    expect(() => validateAnnouncement({ ...announcement, price: "Rs 599" })).toThrow(
      "Price must be a whole number of rupees, such as 599.",
    );
    expect(() => validateAnnouncement({ ...announcement, time: " " })).toThrow(
      "Time is required.",
    );
    expect(() =>
      validateAnnouncement({ ...announcement, detailsUrl: "http://tickets.example" }),
    ).toThrow("Details link must use HTTPS.");
    expect(() =>
      validateAnnouncement({ ...announcement, detailsUrl: "https://tickets.example/e/1" }),
    ).toThrow("Details link must be an Offlyn link starting with https://offlyn.life/");
    expect(() =>
      validateAnnouncement({ ...announcement, detailsUrl: "https://offlyn.life/" }),
    ).toThrow("Details link must point to a specific Offlyn event.");
    expect(() => validateAnnouncement({ ...announcement, posterUrl: "" })).toThrow(
      "Poster is required.",
    );
  });

  it("sends the poster header, four body values in template order, and the Offlyn path as the button suffix", () => {
    expect(buildAnnouncementPayload("+919876543210", announcement, config)).toEqual({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: "919876543210",
      type: "template",
      template: {
        name: "debate_announcement",
        language: { code: "en" },
        components: [
          {
            type: "header",
            parameters: [{ type: "image", image: { link: announcement.posterUrl } }],
          },
          {
            type: "body",
            parameters: [
              { type: "text", text: "12" },
              { type: "text", text: "599" },
              { type: "text", text: announcement.time },
              { type: "text", text: announcement.location },
            ],
          },
          {
            type: "button",
            sub_type: "url",
            index: "0",
            parameters: [{ type: "text", text: "e/ncWEIfi" }],
          },
        ],
      },
    });
  });
});

describe("WhatsApp welcome template", () => {
  it("mirrors the approved body with one name variable", () => {
    expect(WELCOME_TEMPLATE_BODY.match(/\{\{\d+\}\}/g)).toEqual(["{{1}}"]);
    expect(WELCOME_TEMPLATE_BODY.startsWith("Hi {{1}}, you're receiving this message")).toBe(true);
  });

  it("greets subscribers by first name", () => {
    expect(greetingName("  Asha   Rao ")).toBe("Asha");
    expect(greetingName(null)).toBe("there");
    expect(greetingName("   ")).toBe("there");
  });

  it("sends the chosen image header and the first name", () => {
    expect(
      buildWelcomePayload(
        { phone: "+919876543210", name: "Asha Rao" },
        { headerImageUrl: "https://project.supabase.co/storage/v1/object/public/whatsapp-posters/b.jpg" },
        { templateName: "subscriber_welcome", templateLanguage: "en" },
      ),
    ).toEqual({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: "919876543210",
      type: "template",
      template: {
        name: "subscriber_welcome",
        language: { code: "en" },
        components: [
          {
            type: "header",
            parameters: [{ type: "image", image: { link: "https://project.supabase.co/storage/v1/object/public/whatsapp-posters/b.jpg" } }],
          },
          { type: "body", parameters: [{ type: "text", text: "Asha" }] },
        ],
      },
    });
  });

  it("requires an HTTPS image", () => {
    expect(() =>
      buildWelcomePayload(
        { phone: "+919876543210", name: null },
        { headerImageUrl: "" },
        { templateName: "subscriber_welcome", templateLanguage: "en" },
      ),
    ).toThrow("Image is required.");
  });
});

describe("campaign labels", () => {
  it("names each kind of campaign", () => {
    expect(campaignLabel("welcome", {})).toBe("Welcome message");
    expect(campaignLabel("announcement", { debateNumber: "12", inviteOnly: true })).toBe(
      "Contrarian Debate Club #12 (invite only)",
    );
    expect(campaignLabel("announcement", { title: "An older debate" })).toBe(
      "An older debate",
    );
  });
});
