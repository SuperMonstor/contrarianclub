import { describe, expect, it } from "vitest";
import { buildSwingSummary } from "@/lib/event-state";
import type { ActivitySummary } from "@/lib/types";

describe("topic swing pairing", () => {
  it("pairs opening and closing votes only within the active topic", () => {
    const activity = (
      id: string,
      topicId: string,
      phase: "pre_debate" | "post_debate",
    ): ActivitySummary => ({
      id,
      event_id: "event-1",
      topic_id: topicId,
      sort_order: phase === "pre_debate" ? 0 : 2,
      type: "multiple_choice",
      phase,
      prompt: phase,
      status: "closed",
      results_visibility: "revealed",
      created_at: "2026-08-08T00:00:00.000Z",
    });
    const activities = [
      activity("topic-1-pre", "topic-1", "pre_debate"),
      activity("topic-1-post", "topic-1", "post_debate"),
      activity("topic-2-pre", "topic-2", "pre_debate"),
      activity("topic-2-post", "topic-2", "post_debate"),
    ];
    const options = Object.fromEntries(
      activities.map((item) => [
        item.id,
        [
          {
            id: `${item.id}-yes`,
            activity_id: item.id,
            label: "Yes",
            sort_order: 0,
            scale_value: null,
          },
          {
            id: `${item.id}-no`,
            activity_id: item.id,
            label: "No",
            sort_order: 1,
            scale_value: null,
          },
        ],
      ]),
    );
    const votes = {
      "topic-1-pre": [
        { option_id: "topic-1-pre-yes", device_id: "device-1" },
      ],
      "topic-1-post": [
        { option_id: "topic-1-post-no", device_id: "device-1" },
      ],
      "topic-2-pre": [
        { option_id: "topic-2-pre-no", device_id: "device-1" },
      ],
      "topic-2-post": [
        { option_id: "topic-2-post-no", device_id: "device-1" },
      ],
    };

    const swing = buildSwingSummary(activities, options, votes, "topic-2");

    expect(swing).toMatchObject({
      preActivityId: "topic-2-pre",
      postActivityId: "topic-2-post",
      matchedVotes: 1,
      changedVotes: 0,
    });
  });
});
