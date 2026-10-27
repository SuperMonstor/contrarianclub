// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL(
    "./20261019000000_021_whatsapp_announcements_and_welcome.sql",
    import.meta.url,
  ),
  "utf8",
);

describe("WhatsApp announcements and welcome migration", () => {
  it("separates announcement and welcome campaigns", () => {
    expect(migration).toContain("add column kind text not null default 'announcement'");
    expect(migration).toContain("check (kind in ('announcement', 'welcome'))");
  });

  it("stores posters in a public bucket limited to WhatsApp header images", () => {
    expect(migration).toContain("'whatsapp-posters'");
    expect(migration).toContain("5242880");
    expect(migration).toContain("array['image/jpeg', 'image/png']");
  });

  it("welcomes each active subscriber once unless earlier attempts failed", () => {
    expect(migration).toContain(
      "create or replace function public.create_whatsapp_welcome_campaign",
    );
    expect(migration).toContain("#variable_conflict use_column");
    expect(migration.match(/delivery\.status not in \('failed', 'skipped'\)/g)).toHaveLength(2);
    expect(migration).toContain("raise exception 'no_unwelcomed_subscribers'");
  });

  it("keeps the new functions private to the service role", () => {
    for (const signature of [
      "create_whatsapp_welcome_campaign(text, text, uuid)",
      "count_pending_whatsapp_welcomes()",
    ]) {
      expect(migration).toContain(
        `revoke all on function public.${signature} from public, anon, authenticated;`,
      );
      expect(migration).toContain(
        `grant execute on function public.${signature} to service_role;`,
      );
    }
  });
});
