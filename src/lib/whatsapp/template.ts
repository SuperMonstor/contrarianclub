import type { CampaignParameters } from "@/lib/whatsapp/types";

type TemplateConfig = {
  templateName: string;
  templateLanguage: string;
};

type TemplateDelivery = {
  recipientPhone: string;
  recipientName: string | null;
};

const FIELD_LIMITS = {
  title: 240,
  date: 120,
  time: 120,
  venue: 120,
  ticketUrl: 2048,
} as const;

const FIELD_LABELS: Record<keyof CampaignParameters, string> = {
  title: "Debate title",
  date: "Date",
  time: "Time",
  venue: "Venue",
  ticketUrl: "Ticket URL",
};

export function validateCampaignInput(
  input: CampaignParameters,
): CampaignParameters {
  const normalized = Object.fromEntries(
    (Object.keys(FIELD_LIMITS) as Array<keyof CampaignParameters>).map((field) => [
      field,
      typeof input[field] === "string" ? input[field].trim() : "",
    ]),
  ) as CampaignParameters;

  for (const field of Object.keys(FIELD_LIMITS) as Array<keyof CampaignParameters>) {
    const value = normalized[field];
    const label = FIELD_LABELS[field];
    if (!value) throw new Error(`${label} is required.`);
    if (value.length > FIELD_LIMITS[field]) {
      throw new Error(`${label} must be ${FIELD_LIMITS[field]} characters or fewer.`);
    }
  }

  let ticketUrl: URL;
  try {
    ticketUrl = new URL(normalized.ticketUrl);
  } catch {
    throw new Error("Ticket URL must be a valid HTTPS URL.");
  }
  if (ticketUrl.protocol !== "https:") {
    throw new Error("Ticket URL must use HTTPS.");
  }

  return normalized;
}

export function buildTemplateParameters(
  recipientName: string | null,
  campaign: CampaignParameters,
): string[] {
  const validated = validateCampaignInput(campaign);
  const name = recipientName?.trim().slice(0, 80) || "there";
  return [
    name,
    validated.title,
    validated.date,
    validated.time,
    validated.venue,
    validated.ticketUrl,
  ];
}

export function buildTemplatePayload(
  delivery: TemplateDelivery,
  campaign: CampaignParameters,
  config: TemplateConfig,
) {
  const values = buildTemplateParameters(delivery.recipientName, campaign);
  return {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: delivery.recipientPhone.replace(/^\+/, ""),
    type: "template",
    template: {
      name: config.templateName,
      language: { code: config.templateLanguage },
      components: [
        {
          type: "body",
          parameters: values.map((text) => ({ type: "text", text })),
        },
      ],
    },
  };
}
