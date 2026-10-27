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
  motions: ["This house believes the AI boom is a bubble."],
  location: "Bangalore International Centre",
  time: "Saturday, 8 November, 7:00 PM",
  detailsUrl: "https://offlyn.life/e/ncWEIfi",
  posterUrl: "https://project.supabase.co/storage/v1/object/public/whatsapp-posters/a.png",
};

const config = { templateName: "debate_announcement", templateLanguage: "en" };

describe("WhatsApp announcement template", () => {
  it("matches the body submitted to Meta", () => {
    expect(ANNOUNCEMENT_TEMPLATE_BODY).toBe(
      "*Contrarian Debate Club #{{1}}*\n\nA new debate is coming up.\n\n*Motions:* {{2}}\n\n*Location:* {{3}}\n\n*Time:* {{4}}\n\nTap below for details.",
    );
  });

  it("renders one motion as written", () => {
    expect(renderAnnouncementBody(validateAnnouncement(announcement))).toContain(
      "*Motions:* This house believes the AI boom is a bubble.",
    );
  });

  it("numbers two motions on one line and marks invite-only debates", () => {
    const body = renderAnnouncementBody(
      validateAnnouncement({
        ...announcement,
        inviteOnly: true,
        motions: ["First motion.", "Second motion."],
      }),
    );
    expect(body).toContain("*Contrarian Debate Club #12 (invite only)*");
    expect(body).toContain("*Motions:* 1) First motion. 2) Second motion.");
  });

  it("flattens line breaks and repeated spaces that Meta rejects", () => {
    const parameters = validateAnnouncement({
      ...announcement,
      motions: ["  A motion\nacross    lines  ", ""],
      location: "Hall\tB",
    });
    expect(parameters.motions).toEqual(["A motion across lines"]);
    expect(parameters.location).toBe("Hall B");
  });

  it("rejects incomplete or unsafe input", () => {
    expect(() => validateAnnouncement({ ...announcement, debateNumber: "twelve" })).toThrow(
      "Debate number must be a whole number, such as 12.",
    );
    expect(() => validateAnnouncement({ ...announcement, motions: [" "] })).toThrow(
      "Add at least one motion.",
    );
    expect(() =>
      validateAnnouncement({ ...announcement, motions: ["One", "Two", "Three"] }),
    ).toThrow("Add no more than 2 motions.");
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

  it("rejects a message longer than Meta's body limit", () => {
    expect(() =>
      validateAnnouncement({
        ...announcement,
        motions: ["m".repeat(400), "n".repeat(400)],
        location: "l".repeat(160),
      }),
    ).toThrow("The message is too long for WhatsApp.");
  });

  it("sends the poster header, four body values, and the Offlyn path as the button suffix", () => {
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
              { type: "text", text: announcement.motions[0] },
              { type: "text", text: announcement.location },
              { type: "text", text: announcement.time },
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
