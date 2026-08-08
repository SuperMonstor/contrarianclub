// @vitest-environment node

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL(
    "./20260808020000_015_refresh_all_live_speaker_rounds.sql",
    import.meta.url,
  ),
  "utf8",
);

describe("all live speaker rounds migration contract", () => {
  it("refreshes every open speaker round when event enrollment grows", () => {
    const joinFunction = migration.slice(
      migration.indexOf("create or replace function public.join_speaker_electorate"),
      migration.indexOf("revoke all on function"),
    );

    expect(joinFunction).toContain("where event_id = v_event_id");
    expect(joinFunction).toContain("and phase = 'speaker_challenge'");
    expect(joinFunction).toContain("and status = 'open'");
    expect(joinFunction).toContain("perform refresh_speaker_round_threshold");
    expect(joinFunction).not.toContain("from presentation_state");
  });

  it("does not rewrite rounds for a duplicate enrollment", () => {
    expect(migration).toContain("if v_inserted_count = 0 then");
    expect(migration).toContain("return;");
  });

  it("creates and reconciles already-open rounds when the migration is applied", () => {
    const reconciliation = migration.slice(migration.indexOf("do $$"));

    expect(reconciliation).toContain("perform 1 from events");
    expect(reconciliation).toContain("for update");
    expect(reconciliation).toContain("if not exists (");
    expect(reconciliation).toContain("perform snapshot_speaker_round");
    expect(reconciliation).toContain("perform refresh_speaker_round_threshold");
    expect(reconciliation).toContain("challenge_revision = challenge_revision + 1");
  });

  it("preserves public enrollment access without exposing helper functions", () => {
    expect(migration).toContain(
      "revoke all on function public.join_speaker_electorate(uuid) from public",
    );
    expect(migration).toMatch(
      /grant execute on function public\.join_speaker_electorate\(uuid\)\s+to anon, authenticated;/,
    );
  });
});
