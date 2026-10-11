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

const campaignCreationFix = readFileSync(
  new URL("./20261010010000_019_fix_campaign_creation.sql", import.meta.url),
  "utf8",
);

const skipOptedOut = readFileSync(
  new URL("./20261010020000_020_skip_opted_out_deliveries.sql", import.meta.url),
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

describe("campaign creation fix", () => {
  it("drops the conflict target that collided with the campaign_id output column", () => {
    expect(campaignCreationFix).toContain(
      "create or replace function public.create_whatsapp_campaign",
    );
    expect(campaignCreationFix).not.toContain("on conflict");
    expect(campaignCreationFix).toContain("where subscriber.is_active = true;");
  });
});

describe("opted-out deliveries", () => {
  it("adds a skipped status for subscribers who opt out before sending", () => {
    expect(skipOptedOut).toMatch(/check \(status in \([^)]*'skipped'\)\)/);
  });

  it("skips inactive subscribers and claims only active ones", () => {
    expect(skipOptedOut).toContain(
      "create or replace function public.claim_whatsapp_deliveries",
    );
    expect(skipOptedOut).toContain("set status = 'skipped'");
    expect(skipOptedOut).toContain("and subscriber.is_active = false;");
    expect(skipOptedOut).toContain("and subscriber.is_active = true");
    expect(skipOptedOut).toContain("for update skip locked");
  });
});
