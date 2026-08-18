// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL(
    "./20260819010000_017_whatsapp_marketing_functions.sql",
    import.meta.url,
  ),
  "utf8",
);

describe("WhatsApp marketing functions", () => {
  it("keeps import and campaign creation transactional", () => {
    expect(migration).toContain(
      "create or replace function public.apply_whatsapp_import",
    );
    expect(migration).toContain(
      "create or replace function public.create_whatsapp_campaign",
    );
    expect(migration).toContain(
      "on conflict (campaign_id, subscriber_id) do nothing",
    );
    expect(migration).toContain("where subscriber.is_active = true");
  });

  it("claims only retry-safe pending work", () => {
    expect(migration).toContain("for update skip locked");
    expect(migration).toContain(
      "delivery.status in ('queued', 'retryable_failed')",
    );
    expect(migration).toContain("delivery.attempt_count < 3");
  });

  it("exposes functions only to the service role", () => {
    expect(migration).toMatch(/revoke all on function[\s\S]+from public;/);
    expect(migration).toMatch(
      /grant execute on function[\s\S]+to service_role;/,
    );
  });
});
