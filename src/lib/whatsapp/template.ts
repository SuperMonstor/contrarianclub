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

export const WELCOME_TEMPLATE_BODY = [
  "Hello, Sudarshan from The Contrarian Club here. You'd signed up to be notified of future debates.",
  "",
  "You'll ONLY receive a message when there's a new debate coming up, and you can opt out at any time by tapping the button below or replying STOP.",
].join("\n");

// The announcement's Details button is a dynamic URL button. Meta appends the
// campaign ID to this path, and the route redirects to the campaign's link.
export const DETAILS_BUTTON_PATH = "/api/whatsapp/details/";

export const MAX_MOTIONS = 2;
const META_BODY_LIMIT = 1024;
const LIMITS = {
  motion: 400,
  location: 160,
  time: 120,
  url: 2048,
} as const;

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
  if (renderAnnouncementBody(parameters).length > META_BODY_LIMIT) {
    throw new Error(
      "The message is too long for WhatsApp. Shorten the motions, location, or time.",
    );
  }
  return parameters;
}

function templateMessage(
  recipientPhone: string,
  config: TemplateConfig,
  components?: unknown[],
) {
  return {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: recipientPhone.replace(/^\+/, ""),
    type: "template",
    template: {
      name: config.templateName,
      language: { code: config.templateLanguage },
      ...(components ? { components } : {}),
    },
  };
}

export function buildAnnouncementPayload(
  recipientPhone: string,
  input: AnnouncementInput,
  campaignId: string,
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
      parameters: [{ type: "text", text: campaignId }],
    },
  ]);
}

// The welcome template has no variables, and its quick reply button needs no
// parameters, so the message carries no components at all.
export function buildWelcomePayload(
  recipientPhone: string,
  config: TemplateConfig,
) {
  return templateMessage(recipientPhone, config);
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
