import { describe, expect, it } from "vitest";
import { buildDebateAssets } from "@/lib/debate-assets";

const topics = [{ id: "topic-1", motion: "A motion", sort_order: 0 }];
const activities = [
  {
    id: "before",
    topic_id: "topic-1",
    phase: "pre_debate" as const,
    type: "scale" as const,
    status: "closed" as const,
    results_visibility: "revealed" as const,
    scale_left_label: "Against the motion",
    scale_right_label: "For the motion",
  },
  {
    id: "after",
    topic_id: "topic-1",
    phase: "post_debate" as const,
    type: "scale" as const,
    status: "closed" as const,
    results_visibility: "revealed" as const,
    scale_left_label: "Against the motion",
    scale_right_label: "For the motion",
  },
];
const options = activities.flatMap((activity) =>
  [-3, -2, -1, 0, 1, 2, 3].map((scaleValue) => ({
    id: `${activity.id}-${scaleValue}`,
    activity_id: activity.id,
    label: String(scaleValue),
    scale_value: scaleValue,
  })),
);

function vote(activityId: string, deviceId: string, value: number) {
  return {
    activity_id: activityId,
    device_id: deviceId,
    option_id: `${activityId}-${value}`,
  };
}

describe("debate asset aggregation", () => {
  it("uses only matched voters for both distributions and the swing", () => {
    const motions = buildDebateAssets(topics, activities, options, [
      vote("before", "a", -3),
      vote("before", "b", 0),
      vote("before", "c", 2),
      vote("before", "d", 3),
      vote("before", "only-before", 1),
      vote("after", "a", -1),
      vote("after", "b", -2),
      vote("after", "c", 2),
      vote("after", "d", -3),
      vote("after", "only-after", -3),
    ]);

    expect(motions).toHaveLength(1);
    expect(motions[0]).toMatchObject({
      ready: true,
      matchedVoters: 4,
      before: [1, 0, 0, 1, 0, 1, 1],
      after: [1, 1, 1, 0, 0, 1, 0],
      movedAgainst: 2,
      movedFor: 1,
      held: 1,
      averageBefore: 0.5,
      averageAfter: -1,
      averageShift: -1.5,
      fullBeforeVotes: 5,
      fullAfterVotes: 5,
    });
  });

  it("rounds the shift from raw totals to two decimals", () => {
    const motions = buildDebateAssets(topics, activities, options, [
      vote("before", "a", 0),
      vote("before", "b", 0),
      vote("before", "c", 0),
      vote("after", "a", -1),
      vote("after", "b", 0),
      vote("after", "c", 0),
    ]);

    expect(motions[0]).toMatchObject({
      matchedVoters: 3,
      movedAgainst: 1,
      held: 2,
      averageBefore: 0,
      averageAfter: -0.33,
      averageShift: -0.33,
    });
  });

  it("identifies an unready poll and blocks a zero-match pair", () => {
    const unrevealed = activities.map((activity) =>
      activity.id === "after"
        ? { ...activity, results_visibility: "hidden" as const }
        : activity,
    );
    expect(buildDebateAssets(topics, unrevealed, options, [])).toMatchObject([
      { ready: false, reason: expect.stringMatching(/revealed/i) },
    ]);
    expect(
      buildDebateAssets(topics, activities, options, [
        vote("before", "a", 1),
        vote("after", "b", -1),
      ]),
    ).toMatchObject([
      { ready: false, reason: expect.stringMatching(/same voters/i) },
    ]);
  });

  it("keeps topics separate even when one device votes on both motions", () => {
    const secondTopic = { id: "topic-2", motion: "Another motion", sort_order: 1 };
    const secondActivities = activities.map((activity) => ({
      ...activity,
      id: `${activity.id}-two`,
      topic_id: secondTopic.id,
    }));
    const secondOptions = options.map((option) => ({
      ...option,
      id: `${option.id}-two`,
      activity_id: `${option.activity_id}-two`,
    }));
    const motions = buildDebateAssets(
      [secondTopic, ...topics],
      [...activities, ...secondActivities],
      [...options, ...secondOptions],
      [
        vote("before", "a", -3),
        vote("after", "a", 3),
        {
          activity_id: "before-two",
          device_id: "a",
          option_id: "before--2-two",
        },
        {
          activity_id: "after-two",
          device_id: "a",
          option_id: "after--1-two",
        },
      ],
    );

    expect(motions.map((motion) => motion.motion)).toEqual([
      "A motion",
      "Another motion",
    ]);
    expect(motions).toMatchObject([
      { ready: true, before: [1, 0, 0, 0, 0, 0, 0], movedFor: 1 },
      { ready: true, before: [0, 1, 0, 0, 0, 0, 0], movedFor: 1 },
    ]);
  });
});
