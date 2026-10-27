// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL("./20261027010000_023_whatsapp_test_sends.sql", import.meta.url),
  "utf8",
);

describe("WhatsApp test sends migration", () => {
  it("flags testers and test campaigns", () => {
    expect(migration).toContain(
      "add column is_tester boolean not null default false;",
    );
    expect(migration).toContain("add column is_test boolean not null default false;");
  });

  it("snapshots only active testers for a test send", () => {
    expect(migration).toContain(
      "drop function public.create_whatsapp_campaign(text, text, jsonb, uuid);",
    );
    expect(migration).toContain(
      "and (not p_test_only or subscriber.is_tester = true);",
    );
    expect(migration).toContain("raise exception 'no_active_testers';");
  });

  it("keeps the new signature private to the service role", () => {
    expect(migration).toContain(
      "revoke all on function public.create_whatsapp_campaign(text, text, jsonb, uuid, boolean) from public, anon, authenticated;",
    );
    expect(migration).toContain(
      "grant execute on function public.create_whatsapp_campaign(text, text, jsonb, uuid, boolean) to service_role;",
    );
  });
});
