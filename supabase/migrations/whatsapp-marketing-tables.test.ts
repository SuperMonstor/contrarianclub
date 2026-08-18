// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL("./20260819000000_016_whatsapp_marketing_tables.sql", import.meta.url),
  "utf8",
);

describe("WhatsApp marketing tables", () => {
  it("creates four isolated private tables", () => {
    for (const table of [
      "whatsapp_subscribers",
      "whatsapp_imports",
      "whatsapp_campaigns",
      "whatsapp_deliveries",
    ]) {
      expect(migration).toContain(`create table public.${table}`);
      expect(migration).toContain(
        `alter table public.${table} enable row level security`,
      );
    }

    expect(migration).not.toContain("create policy");
    expect(migration).not.toContain("references public.events");
  });

  it("enforces subscriber and delivery idempotency", () => {
    expect(migration).toContain("phone_e164 text not null unique");
    expect(migration).toContain("file_sha256 text not null unique");
    expect(migration).toContain("unique (campaign_id, subscriber_id)");
    expect(migration).toContain("whatsapp_deliveries_message_id_uidx");
  });
});
