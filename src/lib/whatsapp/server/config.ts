import "server-only";

const VARIABLE_MAP = {
  WHATSAPP_ACCESS_TOKEN: "accessToken",
  WHATSAPP_PHONE_NUMBER_ID: "phoneNumberId",
  WHATSAPP_BUSINESS_ACCOUNT_ID: "businessAccountId",
  WHATSAPP_APP_SECRET: "appSecret",
  WHATSAPP_WEBHOOK_VERIFY_TOKEN: "webhookVerifyToken",
  WHATSAPP_GRAPH_API_VERSION: "graphApiVersion",
  WHATSAPP_TEMPLATE_NAME: "templateName",
  WHATSAPP_TEMPLATE_LANGUAGE: "templateLanguage",
} as const;

export type WhatsAppConfig = {
  [Key in (typeof VARIABLE_MAP)[keyof typeof VARIABLE_MAP]]: string;
};

export class WhatsAppConfigError extends Error {
  readonly missingVariables: string[];

  constructor(missingVariables: string[]) {
    super(`Missing WhatsApp configuration: ${missingVariables.join(", ")}.`);
    this.name = "WhatsAppConfigError";
    this.missingVariables = missingVariables;
  }
}

export function getWhatsAppConfig(): WhatsAppConfig {
  const missing: string[] = [];
  const values: Partial<WhatsAppConfig> = {};

  for (const [variable, property] of Object.entries(VARIABLE_MAP)) {
    const value = process.env[variable]?.trim();
    if (!value) missing.push(variable);
    else values[property] = value;
  }

  if (missing.length > 0) throw new WhatsAppConfigError(missing);
  if (!/^v[0-9]+\.[0-9]+$/.test(values.graphApiVersion ?? "")) {
    throw new Error("WHATSAPP_GRAPH_API_VERSION must look like v25.0.");
  }

  return values as WhatsAppConfig;
}
