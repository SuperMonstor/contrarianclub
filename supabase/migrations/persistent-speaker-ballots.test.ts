// @vitest-environment node

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL("./20260718000000_012_persistent_speaker_ballots.sql", import.meta.url),
  "utf8",
);

describe("persistent speaker ballot migration contract", () => {
  it("locks ballot writes to the expected speaker round", () => {
    expect(migration).toContain("for update");
    expect(migration).toContain("v_challenge_round <> p_expected_round");
    expect(migration).toContain("p_expected_round is null");
    expect(migration).toContain("raise exception 'stale_round'");
    expect(migration).toContain("unique (activity_id, round, device_id)");
  });

  it("serialises event end before the activity and ballot mutation", () => {
    const ballotFunction = migration.slice(
      migration.indexOf("set_speaker_ballot"),
      migration.indexOf("get_speaker_ballot"),
    );
    const eventLock = ballotFunction.indexOf("select status into v_event_status");
    const activityLock = ballotFunction.indexOf(
      "select event_id, status, phase, challenge_round",
    );

    expect(eventLock).toBeGreaterThan(-1);
    expect(activityLock).toBeGreaterThan(-1);
    expect(eventLock).toBeLessThan(activityLock);
    expect(ballotFunction.slice(eventLock, activityLock)).toContain("for update");
  });

  it.each([
    "invalid_token",
    "invalid_activity",
    "poll_not_open",
    "speaker_paused",
    "event_not_active",
    "voting_not_open_yet",
  ])("enforces the %s rejection", (reason) => {
    expect(migration).toContain(`raise exception '${reason}'`);
  });

  it("supports mutable ballots and revision-driven realtime refresh", () => {
    expect(migration).toContain("on conflict (activity_id, round, device_id) do update");
    expect(migration).toContain("challenge_revision = challenge_revision + 1");
  });

  it("pauses the current section without opening or resuming the target", () => {
    const switchFunction = migration.slice(
      migration.indexOf("admin_switch_section"),
      migration.indexOf("admin_start_speaker"),
    );
    expect(switchFunction).toContain("set status = 'closed'");
    expect(switchFunction).toContain("challenge_paused = true");
    expect(switchFunction).not.toContain("challenge_paused = false");
    expect(switchFunction).not.toContain("set status = 'open'");
    expect(switchFunction).toContain(
      "('pre_debate', 'speaker_challenge', 'post_debate')",
    );
    expect(switchFunction).not.toContain("PHASE_ORDER");
  });

  it("restores protected time and keeps unlocked ballots open indefinitely", () => {
    expect(migration).toContain(
      "make_interval(secs => coalesce(v_remaining, 0))",
    );
    expect(migration).not.toContain("voting_closes_at");
  });

  it("transactionally pauses a running speaker when the event ends", () => {
    const eventStatusFunction = migration.slice(
      migration.indexOf("admin_set_event_status"),
      migration.indexOf("admin_reset_speaker"),
    );

    expect(eventStatusFunction).toContain("perform 1 from events");
    expect(eventStatusFunction).toContain("for update");
    expect(eventStatusFunction).toContain("p_status in ('ended', 'archived')");
    expect(eventStatusFunction).toContain("challenge_paused = true");
    expect(eventStatusFunction).toContain(
      "challenge_revision = challenge_revision + 1",
    );
  });

  it("clears new and legacy challenge data in the rehearsal reset", () => {
    expect(migration).toContain("delete from speaker_ballots");
    expect(migration).toContain("delete from challenge_joins");
    expect(migration).toContain("delete from votes");
  });

  it("does not rewrite the existing pre-vote and post-vote submission path", () => {
    expect(migration).not.toContain("create or replace function public.cast_vote");
    expect(migration).not.toContain("drop table public.votes");
    expect(migration).not.toContain("drop table public.poll_options");
  });
});
