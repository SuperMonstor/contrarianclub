import { describe, expect, it } from "vitest";
import {
  getTopicResetScope,
  requestProgress,
  speakerRequestThreshold,
  summarizeSpeakerBallots,
} from "@/lib/speaker-challenge";

describe("speaker request summary", () => {
  it("counts only next-speaker requests", () => {
    expect(summarizeSpeakerBallots(["next", "keep", "next"])).toEqual({
      nextVotes: 2,
    });
  });

  it("uses exactly half of the live electorate rounded up", () => {
    expect(speakerRequestThreshold(0)).toBe(0);
    expect(speakerRequestThreshold(1)).toBe(1);
    expect(speakerRequestThreshold(10)).toBe(5);
    expect(speakerRequestThreshold(11)).toBe(6);
  });

  it("has no absolute minimum threshold", () => {
    expect(speakerRequestThreshold(2)).toBe(1);
  });

  it("caps displayed progress at one hundred percent", () => {
    expect(requestProgress(2, 4)).toBe(50);
    expect(requestProgress(5, 4)).toBe(100);
    expect(requestProgress(0, 0)).toBe(0);
  });
});

describe("topic reset scope", () => {
  const activities = [
    {
      id: "topic-1-pre",
      topic_id: "topic-1",
      sort_order: 0,
      phase: "pre_debate" as const,
      created_at: "2026-08-08T00:00:00.000Z",
    },
    {
      id: "topic-1-post",
      topic_id: "topic-1",
      sort_order: 2,
      phase: "post_debate" as const,
      created_at: "2026-08-08T00:02:00.000Z",
    },
    {
      id: "topic-2-pre",
      topic_id: "topic-2",
      sort_order: 0,
      phase: "pre_debate" as const,
      created_at: "2026-08-08T00:03:00.000Z",
    },
    {
      id: "topic-2-post",
      topic_id: "topic-2",
      sort_order: 2,
      phase: "post_debate" as const,
      created_at: "2026-08-08T00:04:00.000Z",
    },
  ];

  it("cascades only through later steps in the selected topic", () => {
    expect(
      getTopicResetScope(activities, "topic-1-pre").map(
        (activity) => activity.id,
      ),
    ).toEqual(["topic-1-pre", "topic-1-post"]);
    expect(
      getTopicResetScope(activities, "topic-2-post").map(
        (activity) => activity.id,
      ),
    ).toEqual(["topic-2-post"]);
  });
});
