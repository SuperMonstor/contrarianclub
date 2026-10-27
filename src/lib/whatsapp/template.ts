import type {
  AnnouncementParameters,
  WhatsAppCampaignKind,
} from "@/lib/whatsapp/types";

type TemplateConfig = {
  templateName: string;
  templateLanguage: string;
};

// The approved Meta template bodies. Each must match the text submitted in
// WhatsApp Manager exactly, with {{n}} wherever the app fills in a value.
export const ANNOUNCEMENT_TEMPLATE_BODY = [
  "*Contrarian Debate Club #{{1}}*",
  "",
  "A new debate is coming up.",
  "",
  "*Motions:* {{2}}",
  "",
  "*Location:* {{3}}",
  "",
  "*Time:* {{4}}",
  "",
  "Tap below for details.",
].join("\n");

// Mirrors the approved text, whose sign-off line Meta stores with a dash
// character written here as an escape.
export const WELCOME_TEMPLATE_BODY = [
  "Hi {{1}}, you're receiving this message because you signed up for updates from The Contrarian Debate Club.",
  "",
  "We'll only message you about upcoming debates. To unsubscribe at any time, reply STOP.",
  "",
  "\u2014 The Contrarian Debate Club",
].join("\n");

// The approved footer under the announcement body. It has no variables, so
// the app never sends it, but previews show it.
export const ANNOUNCEMENT_TEMPLATE_FOOTER =
  "We respect your inbox. Reply STOP to opt out anytime.";

// The announcement's View Details button is a dynamic URL button approved as
// https://offlyn.life/{{1}}, so the app sends the part of the event's Offlyn
// link after this base.
export const DETAILS_URL_BASE = "https://offlyn.life/";

export const MAX_MOTIONS = 2;
const META_BODY_LIMIT = 1024;
const LIMITS = {
  motion: 400,
  location: 160,
  time: 120,
  url: 2048,
} as const;

export type WelcomeInput = {
  headerImageUrl: string;
};

export type AnnouncementInput = {
  debateNumber: string;
  inviteOnly: boolean;
  motions: string[];
  location: string;
  time: string;
  detailsUrl: string;
  posterUrl: string;
};

// Meta rejects body parameters containing newlines, tabs, or more than four
// consecutive spaces, so every value is flattened to a single line.
export function toTemplateText(value: unknown): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

export function formatDebateNumber(debateNumber: string, inviteOnly: boolean) {
  return inviteOnly ? `${debateNumber} (invite only)` : debateNumber;
}

export function formatMotions(motions: string[]): string {
  if (motions.length === 1) return motions[0];
  return motions.map((motion, index) => `${index + 1}) ${motion}`).join(" ");
}

export function announcementBodyValues(parameters: AnnouncementParameters) {
  return [
    formatDebateNumber(parameters.debateNumber, parameters.inviteOnly),
    formatMotions(parameters.motions),
    parameters.location,
    parameters.time,
  ];
}

export function renderTemplateBody(body: string, values: string[]): string {
  return body.replace(/\{\{(\d+)\}\}/g, (_, index: string) => values[Number(index) - 1] ?? "");
}

export function renderAnnouncementBody(parameters: AnnouncementParameters) {
  return renderTemplateBody(
    ANNOUNCEMENT_TEMPLATE_BODY,
    announcementBodyValues(parameters),
  );
}

function requireText(value: unknown, label: string, limit: number): string {
  const text = toTemplateText(value);
  if (!text) throw new Error(`${label} is required.`);
  if (text.length > limit) {
    throw new Error(`${label} must be ${limit} characters or fewer.`);
  }
  return text;
}

function requireHttpsUrl(value: unknown, label: string): string {
  const text = requireText(value, label, LIMITS.url);
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    throw new Error(`${label} must be a valid HTTPS URL.`);
  }
  if (url.protocol !== "https:") throw new Error(`${label} must use HTTPS.`);
  return text;
}

export function detailsUrlSuffix(detailsUrl: string): string {
  if (!detailsUrl.startsWith(DETAILS_URL_BASE)) {
    throw new Error(`Details link must be an Offlyn link starting with ${DETAILS_URL_BASE}`);
  }
  const suffix = detailsUrl.slice(DETAILS_URL_BASE.length);
  if (!suffix) throw new Error("Details link must point to a specific Offlyn event.");
  return suffix;
}

export function validateAnnouncement(
  input: AnnouncementInput,
): AnnouncementParameters {
  const debateNumber = toTemplateText(input.debateNumber);
  if (!/^[1-9][0-9]{0,3}$/.test(debateNumber)) {
    throw new Error("Debate number must be a whole number, such as 12.");
  }

  const motions = (Array.isArray(input.motions) ? input.motions : [])
    .map(toTemplateText)
    .filter(Boolean);
  if (motions.length === 0) throw new Error("Add at least one motion.");
  if (motions.length > MAX_MOTIONS) {
    throw new Error(`Add no more than ${MAX_MOTIONS} motions.`);
  }
  if (motions.some((motion) => motion.length > LIMITS.motion)) {
    throw new Error(`Each motion must be ${LIMITS.motion} characters or fewer.`);
  }

  const parameters: AnnouncementParameters = {
    debateNumber,
    inviteOnly: input.inviteOnly === true,
    motions,
    location: requireText(input.location, "Location", LIMITS.location),
    time: requireText(input.time, "Time", LIMITS.time),
    detailsUrl: requireHttpsUrl(input.detailsUrl, "Details link"),
    posterUrl: requireHttpsUrl(input.posterUrl, "Poster"),
  };
  detailsUrlSuffix(parameters.detailsUrl);
  if (renderAnnouncementBody(parameters).length > META_BODY_LIMIT) {
    throw new Error(
      "The message is too long for WhatsApp. Shorten the motions, location, or time.",
    );
  }
  return parameters;
}

export function validateWelcome(input: WelcomeInput): WelcomeInput {
  return { headerImageUrl: requireHttpsUrl(input.headerImageUrl, "Image") };
}

// The welcome greets each subscriber by first name, falling back to "there".
export function greetingName(name: string | null): string {
  const first = toTemplateText(name ?? "").split(" ")[0]?.slice(0, 40);
  return first || "there";
}

function templateMessage(
  recipientPhone: string,
  config: TemplateConfig,
  components: unknown[],
) {
  return {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: recipientPhone.replace(/^\+/, ""),
    type: "template",
    template: {
      name: config.templateName,
      language: { code: config.templateLanguage },
      components,
    },
  };
}

export function buildAnnouncementPayload(
  recipientPhone: string,
  input: AnnouncementInput,
  config: TemplateConfig,
) {
  const parameters = validateAnnouncement(input);
  return templateMessage(recipientPhone, config, [
    {
      type: "header",
      parameters: [{ type: "image", image: { link: parameters.posterUrl } }],
    },
    {
      type: "body",
      parameters: announcementBodyValues(parameters).map((text) => ({
        type: "text",
        text,
      })),
    },
    {
      type: "button",
      sub_type: "url",
      index: "0",
      parameters: [{ type: "text", text: detailsUrlSuffix(parameters.detailsUrl) }],
    },
  ]);
}

export function buildWelcomePayload(
  recipient: { phone: string; name: string | null },
  input: WelcomeInput,
  config: TemplateConfig,
) {
  const { headerImageUrl } = validateWelcome(input);
  return templateMessage(recipient.phone, config, [
    {
      type: "header",
      parameters: [{ type: "image", image: { link: headerImageUrl } }],
    },
    {
      type: "body",
      parameters: [{ type: "text", text: greetingName(recipient.name) }],
    },
  ]);
}

// Sent as a free-form reply inside the customer service window that the
// subscriber's own STOP message opens, so it needs no approved template.
export const OPT_OUT_CONFIRMATION =
  "You've been unsubscribed from The Contrarian Debate Club. You won't receive any more messages from us.";

export function buildTextPayload(recipientPhone: string, body: string) {
  return {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: recipientPhone.replace(/^\+/, ""),
    type: "text",
    text: { body },
  };
}

export function campaignLabel(
  kind: WhatsAppCampaignKind,
  parameters: Record<string, unknown>,
): string {
  if (kind === "welcome") return "Welcome message";
  if (typeof parameters.debateNumber === "string") {
    return `Contrarian Debate Club #${formatDebateNumber(
      parameters.debateNumber,
      parameters.inviteOnly === true,
    )}`;
  }
  // Campaigns created before the current template stored a free-text title.
  if (typeof parameters.title === "string") return parameters.title;
  return "Debate announcement";
}
