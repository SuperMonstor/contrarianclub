import { cleanScaleSideLabel, SCALE_VALUES } from "@/lib/scale";
import type {
  ActivityPhase,
  ActivityStatus,
  ActivityType,
  ResultsVisibility,
} from "@/lib/types";

export type AssetTopic = {
  id: string;
  motion: string;
  sort_order: number;
};

export type AssetActivity = {
  id: string;
  topic_id: string | null;
  phase: ActivityPhase;
  type: ActivityType;
  status: ActivityStatus;
  results_visibility: ResultsVisibility;
  scale_left_label: string | null;
  scale_right_label: string | null;
};

export type AssetOption = {
  id: string;
  activity_id: string;
  label: string;
  scale_value: number | null;
};

export type AssetVote = {
  activity_id: string;
  option_id: string;
  device_id: string;
};

type MotionBase = {
  topicId: string;
  motion: string;
  order: number;
};

export type ReadyAssetMotion = MotionBase & {
  ready: true;
  matchedVoters: number;
  fullBeforeVotes: number;
  fullAfterVotes: number;
  before: number[];
  after: number[];
  movedAgainst: number;
  movedFor: number;
  held: number;
  averageBefore: number;
  averageAfter: number;
  averageShift: number;
  leftLabel: string;
  rightLabel: string;
};

export type UnreadyAssetMotion = MotionBase & {
  ready: false;
  reason: string;
};

export type AssetMotion = ReadyAssetMotion | UnreadyAssetMotion;

const roundTwo = (value: number) => Math.round(value * 100) / 100;

export function buildDebateAssets(
  topics: AssetTopic[],
  activities: AssetActivity[],
  options: AssetOption[],
  votes: AssetVote[],
): AssetMotion[] {
  const votesByActivity = new Map<string, AssetVote[]>();
  for (const vote of votes) {
    const group = votesByActivity.get(vote.activity_id) ?? [];
    group.push(vote);
    votesByActivity.set(vote.activity_id, group);
  }

  return [...topics]
    .sort((first, second) => first.sort_order - second.sort_order)
    .map((topic) => {
      const base: MotionBase = {
        topicId: topic.id,
        motion: topic.motion,
        order: topic.sort_order + 1,
      };
      const topicActivities = activities.filter(
        (activity) => activity.topic_id === topic.id,
      );
      const beforeActivity = topicActivities.find(
        (activity) => activity.phase === "pre_debate",
      );
      const afterActivity = topicActivities.find(
        (activity) => activity.phase === "post_debate",
      );
      if (!beforeActivity || !afterActivity) {
        return {
          ...base,
          ready: false,
          reason: "This motion needs a before and after poll.",
        };
      }
      if (beforeActivity.type !== "scale" || afterActivity.type !== "scale") {
        return {
          ...base,
          ready: false,
          reason: "Vote cards require seven-point scale polls.",
        };
      }
      if (beforeActivity.status !== "closed" || afterActivity.status !== "closed") {
        return {
          ...base,
          ready: false,
          reason: "Both polls must be closed before generating assets.",
        };
      }
      if (
        beforeActivity.results_visibility !== "revealed" ||
        afterActivity.results_visibility !== "revealed"
      ) {
        return {
          ...base,
          ready: false,
          reason: "Both poll results must be revealed before generating assets.",
        };
      }

      const beforeOptions = options.filter(
        (option) => option.activity_id === beforeActivity.id,
      );
      const afterOptions = options.filter(
        (option) => option.activity_id === afterActivity.id,
      );
      const hasFullScale = (rows: AssetOption[]) =>
        rows.length === SCALE_VALUES.length &&
        SCALE_VALUES.every(
          (value) => rows.filter((row) => row.scale_value === value).length === 1,
        );
      if (!hasFullScale(beforeOptions) || !hasFullScale(afterOptions)) {
        return {
          ...base,
          ready: false,
          reason: "Both polls need one option at every scale point from -3 to +3.",
        };
      }

      const scaleByOption = new Map(
        [...beforeOptions, ...afterOptions].map((option) => [
          option.id,
          option.scale_value as number,
        ]),
      );
      const beforeVotes = votesByActivity.get(beforeActivity.id) ?? [];
      const afterVotes = votesByActivity.get(afterActivity.id) ?? [];
      if (
        [...beforeVotes, ...afterVotes].some(
          (vote) => !scaleByOption.has(vote.option_id),
        )
      ) {
        return {
          ...base,
          ready: false,
          reason: "A vote references an unknown scale option.",
        };
      }
      const beforeByDevice = new Map(
        beforeVotes.map((vote) => [
          vote.device_id,
          scaleByOption.get(vote.option_id) as number,
        ]),
      );
      const afterByDevice = new Map(
        afterVotes.map((vote) => [
          vote.device_id,
          scaleByOption.get(vote.option_id) as number,
        ]),
      );
      const matched = [...beforeByDevice.entries()].flatMap(([deviceId, value]) => {
        const afterValue = afterByDevice.get(deviceId);
        return afterValue === undefined ? [] : [[value, afterValue] as const];
      });
      if (matched.length === 0) {
        return {
          ...base,
          ready: false,
          reason: "The two rounds have no same voters to compare.",
        };
      }

      const before = Array<number>(7).fill(0);
      const after = Array<number>(7).fill(0);
      let movedAgainst = 0;
      let movedFor = 0;
      let held = 0;
      let beforeSum = 0;
      let afterSum = 0;
      for (const [beforeValue, afterValue] of matched) {
        before[beforeValue + 3] += 1;
        after[afterValue + 3] += 1;
        beforeSum += beforeValue;
        afterSum += afterValue;
        if (afterValue < beforeValue) movedAgainst += 1;
        else if (afterValue > beforeValue) movedFor += 1;
        else held += 1;
      }

      const sideLabel = (value: number, fallback: string) => {
        const label = afterOptions.find(
          (option) => option.scale_value === value,
        )?.label;
        return label ? cleanScaleSideLabel(label) : fallback;
      };
      return {
        ...base,
        ready: true,
        matchedVoters: matched.length,
        fullBeforeVotes: beforeVotes.length,
        fullAfterVotes: afterVotes.length,
        before,
        after,
        movedAgainst,
        movedFor,
        held,
        averageBefore: roundTwo(beforeSum / matched.length),
        averageAfter: roundTwo(afterSum / matched.length),
        averageShift: roundTwo((afterSum - beforeSum) / matched.length),
        leftLabel: afterActivity.scale_left_label ?? sideLabel(-2, "Against the motion"),
        rightLabel: afterActivity.scale_right_label ?? sideLabel(2, "For the motion"),
      };
    });
}
