// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL("./20261027000000_022_welcome_campaign_parameters.sql", import.meta.url),
  "utf8",
);

describe("welcome campaign parameters migration", () => {
  it("replaces the welcome function with one that stores parameters", () => {
    expect(migration).toContain(
      "drop function public.create_whatsapp_welcome_campaign(text, text, uuid);",
    );
    expect(migration).toContain("p_parameters jsonb,");
    expect(migration).toContain("or p_parameters is null");
    expect(migration).not.toContain("'{}'::jsonb");
  });

  it("keeps the new signature private to the service role", () => {
    expect(migration).toContain(
      "revoke all on function public.create_whatsapp_welcome_campaign(text, text, jsonb, uuid) from public, anon, authenticated;",
    );
    expect(migration).toContain(
      "grant execute on function public.create_whatsapp_welcome_campaign(text, text, jsonb, uuid) to service_role;",
    );
  });
});
