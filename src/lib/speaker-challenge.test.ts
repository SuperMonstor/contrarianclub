import { describe, expect, it } from "vitest";
import { ballotPercent, summarizeSpeakerBallots } from "@/lib/speaker-challenge";

describe("speaker ballot summary", () => {
  it("has no leader with zero ballots", () => {
    expect(summarizeSpeakerBallots([])).toEqual({
      keepVotes: 0,
      nextVotes: 0,
      totalBallots: 0,
      leader: "none",
    });
    expect(ballotPercent(0, 0)).toBe(0);
  });

  it("reports a tie", () => {
    expect(summarizeSpeakerBallots(["keep", "next"])).toMatchObject({
      keepVotes: 1,
      nextVotes: 1,
      totalBallots: 2,
      leader: "tie",
    });
  });

  it("lets one Next ballot lead without quorum", () => {
    expect(summarizeSpeakerBallots(["next"])).toMatchObject({
      totalBallots: 1,
      leader: "next",
    });
  });

  it("reports Keep speaking and Next speaker leaders", () => {
    expect(summarizeSpeakerBallots(["keep", "keep", "next"]).leader).toBe(
      "keep",
    );
    expect(summarizeSpeakerBallots(["next", "next", "keep"]).leader).toBe(
      "next",
    );
  });

  it("does not increase turnout when a device switches choices", () => {
    const before = summarizeSpeakerBallots(["next", "keep"]);
    const after = summarizeSpeakerBallots(["keep", "keep"]);

    expect(after.totalBallots).toBe(before.totalBallots);
    expect(after).toMatchObject({ keepVotes: 2, nextVotes: 0, leader: "keep" });
  });

  it("rounds percentages for the public split", () => {
    expect(ballotPercent(2, 3)).toBe(67);
    expect(ballotPercent(1, 3)).toBe(33);
  });
});
