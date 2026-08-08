// @vitest-environment node

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL(
    "./20260808000000_013_two_topics_and_speaker_electorate.sql",
    import.meta.url,
  ),
  "utf8",
);

describe("two-topic speaker electorate migration contract", () => {
  it("groups opening, audience, and closing activities by topic", () => {
    expect(migration).toContain("create table if not exists public.debate_topics");
    expect(migration).toContain("add column if not exists topic_id uuid");
    expect(migration).toContain("activities_topic_phase_unique_idx");
  });

  it("enrolls a device only once per event", () => {
    expect(migration).toContain("primary key (event_id, device_id)");
    expect(migration).toContain("join_speaker_electorate");
    expect(migration).toContain("on conflict (event_id, device_id) do nothing");
  });

  it("snapshots eligibility before each speaker round", () => {
    expect(migration).toContain("enrollment_cutoff timestamptz not null");
    expect(migration).toContain("joined_at <= v_cutoff");
    expect(migration).toContain("perform snapshot_speaker_round");
  });

  it("uses exactly half of the electorate rounded up with no minimum", () => {
    expect(migration).toContain("ceil(v_eligible_count / 2.0)::integer");
    expect(migration).toContain("speaker_rounds_exact_threshold_check");
    expect(migration).toContain(
      "threshold_count = ceil(eligible_count / 2.0)::integer",
    );
    expect(migration).not.toContain("greatest(5");
    expect(migration).not.toContain("least(5");
  });

  it("freezes requests after the threshold is reached", () => {
    expect(migration).toContain("if v_reached_at is not null then");
    expect(migration).toContain("raise exception 'threshold_reached'");
    expect(migration).toContain("set reached_at = coalesce(reached_at, now())");
  });

  it("revokes obsolete mutable Keep and Next ballots from public clients", () => {
    expect(migration).toContain(
      "revoke all on function public.set_speaker_ballot(uuid, uuid, integer, text) from public",
    );
    expect(migration).toMatch(
      /revoke all on function public\.set_speaker_ballot\(uuid, uuid, integer, text\)\s+from anon, authenticated;/,
    );
    expect(migration).toMatch(
      /revoke all on function public\.get_speaker_ballot\(uuid, uuid\)\s+from anon, authenticated;/,
    );
    expect(migration).toContain(
      "grant execute on function public.set_next_speaker_request",
    );
  });

  it("requires every debate activity to belong to a topic", () => {
    expect(migration).toContain("activities_debate_topic_required_check");
    expect(migration).toContain("or topic_id is not null");
  });
});
