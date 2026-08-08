// @vitest-environment node

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL("./20260808010000_014_live_speaker_voting.sql", import.meta.url),
  "utf8",
);

describe("live speaker voting migration contract", () => {
  it("keeps rehearsal reset on the current speaker stage", () => {
    expect(migration).toContain(
      "values (v_event_id, p_activity_id, 'poll', now())",
    );
  });

  it("makes every enrolled device eligible for the active round", () => {
    expect(migration).toContain("refresh_speaker_round_threshold");
    expect(migration).not.toContain("joined_at <= v_cutoff");
    expect(migration).toContain("speaker_rounds.round = v_round");
  });

  it("keeps requests and withdrawals open after crossing the threshold", () => {
    expect(migration).not.toContain("raise exception 'threshold_reached'");
    expect(migration).toContain("delete from speaker_ballots");
    expect(migration).toContain("else null");
  });

  it("preserves the public speaker RPC signatures", () => {
    expect(migration).toContain("join_speaker_electorate(p_token uuid)");
    expect(migration).toContain("get_speaker_participation(");
    expect(migration).toContain("set_next_speaker_request(");
  });
});
