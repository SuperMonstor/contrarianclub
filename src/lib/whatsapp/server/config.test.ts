// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  getWhatsAppConfig,
  WhatsAppConfigError,
} from "@/lib/whatsapp/server/config";

const variables = [
  "WHATSAPP_ACCESS_TOKEN",
  "WHATSAPP_PHONE_NUMBER_ID",
  "WHATSAPP_BUSINESS_ACCOUNT_ID",
  "WHATSAPP_APP_SECRET",
  "WHATSAPP_WEBHOOK_VERIFY_TOKEN",
  "WHATSAPP_GRAPH_API_VERSION",
  "WHATSAPP_TEMPLATE_NAME",
  "WHATSAPP_TEMPLATE_LANGUAGE",
] as const;

const original = Object.fromEntries(
  variables.map((name) => [name, process.env[name]]),
);

afterEach(() => {
  for (const name of variables) {
    const value = original[name];
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});

function configure() {
  process.env.WHATSAPP_ACCESS_TOKEN = " token ";
  process.env.WHATSAPP_PHONE_NUMBER_ID = "phone-id";
  process.env.WHATSAPP_BUSINESS_ACCOUNT_ID = "waba-id";
  process.env.WHATSAPP_APP_SECRET = "app-secret";
  process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN = "verify-token";
  process.env.WHATSAPP_GRAPH_API_VERSION = "v25.0";
  process.env.WHATSAPP_TEMPLATE_NAME = "new_debate_announcement";
  process.env.WHATSAPP_TEMPLATE_LANGUAGE = "en";
}

describe("WhatsApp server configuration", () => {
  it("returns trimmed server-only values", () => {
    configure();
    expect(getWhatsAppConfig()).toMatchObject({
      accessToken: "token",
      phoneNumberId: "phone-id",
      graphApiVersion: "v25.0",
      templateName: "new_debate_announcement",
      templateLanguage: "en",
    });
  });

  it("lists missing variable names without their values", () => {
    configure();
    delete process.env.WHATSAPP_ACCESS_TOKEN;
    delete process.env.WHATSAPP_APP_SECRET;

    expect(() => getWhatsAppConfig()).toThrowError(
      new WhatsAppConfigError([
        "WHATSAPP_ACCESS_TOKEN",
        "WHATSAPP_APP_SECRET",
      ]),
    );
  });

  it("rejects malformed Graph API versions", () => {
    configure();
    process.env.WHATSAPP_GRAPH_API_VERSION = "latest";
    expect(() => getWhatsAppConfig()).toThrow(
      "WHATSAPP_GRAPH_API_VERSION must look like v25.0.",
    );
  });
});
