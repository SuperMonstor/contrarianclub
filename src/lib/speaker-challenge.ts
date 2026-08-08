import type { ActivitySummary, SpeakerBallotChoice } from "@/lib/types";

export function summarizeSpeakerBallots(
  choices: SpeakerBallotChoice[],
): Pick<
  import("@/lib/types").ChallengeSummary,
  "nextVotes"
> {
  let nextVotes = 0;

  for (const choice of choices) {
    if (choice === "next") nextVotes += 1;
  }

  return { nextVotes };
}

export function speakerRequestThreshold(eligibleCount: number) {
  return Math.ceil(Math.max(0, eligibleCount) / 2);
}

export function requestProgress(votes: number, threshold: number) {
  if (threshold === 0) return 0;
  return Math.min(100, Math.round((votes / threshold) * 100));
}

export function getTopicResetScope<
  T extends Pick<
    ActivitySummary,
    "id" | "topic_id" | "sort_order" | "phase" | "created_at"
  >,
>(activities: T[], activityId: string): T[] {
  const currentActivity = activities.find(
    (activity) => activity.id === activityId,
  );
  if (!currentActivity?.topic_id) return [];

  const orderedActivities = activities
    .filter(
      (activity) =>
        activity.phase !== "speaker_challenge" &&
        activity.topic_id === currentActivity.topic_id,
    )
    .sort(
      (first, second) =>
        (first.sort_order ?? 0) - (second.sort_order ?? 0) ||
        first.created_at.localeCompare(second.created_at),
    );
  const currentIndex = orderedActivities.findIndex(
    (activity) => activity.id === activityId,
  );

  return currentIndex === -1 ? [] : orderedActivities.slice(currentIndex);
}
