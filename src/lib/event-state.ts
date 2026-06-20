import { unstable_noStore as noStore } from "next/cache";
import { buildEventUrls } from "@/lib/site";
import { createServiceClient } from "@/lib/supabase/server";
import type {
  ActivitySummary,
  DebateSwingSummary,
  EventState,
  EventSummary,
  PollOptionResult,
  PresentationMode,
} from "@/lib/types";

type PollOptionRow = {
  id: string;
  activity_id: string;
  label: string;
  sort_order: number;
  scale_value: number | null;
};

type PollOptionBaseRow = Omit<PollOptionRow, "scale_value">;

type VoteRow = {
  option_id: string;
  device_id: string;
};

type ActivityVoteRow = VoteRow & {
  activity_id: string;
};

type ActivityOptions = Record<string, PollOptionRow[]>;
type ActivityVotes = Record<string, VoteRow[]>;

export async function getEventState(code: string): Promise<EventState | null> {
  noStore();

  const supabase = createServiceClient();
  const normalizedCode = code.trim().toUpperCase();

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, code, title, status, created_at")
    .eq("code", normalizedCode)
    .maybeSingle<EventSummary>();

  if (eventError) {
    throw eventError;
  }

  if (!event) {
    return null;
  }

  const { data: activities, error: activityError } = await supabase
    .from("activities")
    .select(
      "id, event_id, type, phase, prompt, status, results_visibility, created_at",
    )
    .eq("event_id", event.id)
    .order("created_at", { ascending: true })
    .returns<ActivitySummary[]>();

  if (activityError) {
    throw activityError;
  }

  const urls = buildEventUrls(event.code);

  const [
    { count: participantCount, error: participantsError },
    { data: presentationState, error: presentationError },
  ] = await Promise.all([
    supabase
      .from("participants")
      .select("id", { count: "exact", head: true })
      .eq("event_id", event.id),
    supabase
      .from("presentation_state")
      .select("active_activity_id, mode")
      .eq("event_id", event.id)
      .maybeSingle<{ active_activity_id: string | null; mode: PresentationMode }>(),
  ]);

  if (participantsError) throw participantsError;
  if (presentationError) throw presentationError;

  const activity =
    activities?.find(
      (candidate) => candidate.id === presentationState?.active_activity_id,
    ) ??
    activities?.[0] ??
    null;

  if (!activity) {
    return {
      event,
      activities: [],
      activity: null,
      mode: "join",
      options: [],
      totalVotes: 0,
      participantCount: participantCount ?? 0,
      swing: null,
      ...urls,
    };
  }

  const activityIds = (activities ?? []).map((item) => item.id);

  const [
    options,
    { data: votes, error: votesError },
    allOptions,
    { data: allVotes, error: allVotesError },
  ] = await Promise.all([
    getPollOptionsForActivity(supabase, activity.id),
    supabase
      .from("votes")
      .select("option_id, device_id")
      .eq("activity_id", activity.id)
      .returns<VoteRow[]>(),
    getPollOptionsForActivities(supabase, activityIds),
    supabase
      .from("votes")
      .select("activity_id, option_id, device_id")
      .in("activity_id", activityIds)
      .returns<ActivityVoteRow[]>(),
  ]);

  if (votesError) throw votesError;
  if (allVotesError) throw allVotesError;

  const voteCounts = new Map<string, number>();
  for (const vote of votes ?? []) {
    voteCounts.set(vote.option_id, (voteCounts.get(vote.option_id) ?? 0) + 1);
  }

  const optionResults: PollOptionResult[] = options.map((option) => ({
    ...option,
    votes: voteCounts.get(option.id) ?? 0,
  }));

  return {
    event,
    activities: activities ?? [],
    activity,
    mode: presentationState?.mode ?? "join",
    options: optionResults,
    totalVotes: votes?.length ?? 0,
    participantCount: participantCount ?? 0,
    swing: buildSwingSummary(
      activities ?? [],
      groupOptionsByActivity(allOptions),
      groupVotesByActivity(allVotes ?? []),
    ),
    ...urls,
  };
}

async function getPollOptionsForActivity(
  supabase: ReturnType<typeof createServiceClient>,
  activityId: string,
) {
  return getPollOptions(supabase, { activityId });
}

async function getPollOptionsForActivities(
  supabase: ReturnType<typeof createServiceClient>,
  activityIds: string[],
) {
  if (activityIds.length === 0) return [];
  return getPollOptions(supabase, { activityIds });
}

async function getPollOptions(
  supabase: ReturnType<typeof createServiceClient>,
  filter: { activityId: string } | { activityIds: string[] },
): Promise<PollOptionRow[]> {
  const queryWithScale = supabase
    .from("poll_options")
    .select("id, activity_id, label, sort_order, scale_value")
    .order("sort_order", { ascending: true });
  const withScale =
    "activityId" in filter
      ? await queryWithScale.eq("activity_id", filter.activityId)
      : await queryWithScale.in("activity_id", filter.activityIds);

  if (!withScale.error) {
    return (withScale.data ?? []) as PollOptionRow[];
  }

  if (withScale.error.code !== "42703") {
    throw withScale.error;
  }

  const queryWithoutScale = supabase
    .from("poll_options")
    .select("id, activity_id, label, sort_order")
    .order("sort_order", { ascending: true });
  const withoutScale =
    "activityId" in filter
      ? await queryWithoutScale.eq("activity_id", filter.activityId)
      : await queryWithoutScale.in("activity_id", filter.activityIds);

  if (withoutScale.error) throw withoutScale.error;

  return ((withoutScale.data ?? []) as PollOptionBaseRow[]).map((option) => ({
    ...option,
    scale_value: null,
  }));
}

function groupOptionsByActivity(options: PollOptionRow[]) {
  return options.reduce<ActivityOptions>((grouped, option) => {
    grouped[option.activity_id] = grouped[option.activity_id] ?? [];
    grouped[option.activity_id].push(option);
    return grouped;
  }, {});
}

function groupVotesByActivity(votes: ActivityVoteRow[]) {
  return votes.reduce<ActivityVotes>((grouped, vote) => {
    const activityId = vote.activity_id;
    grouped[activityId] = grouped[activityId] ?? [];
    grouped[activityId].push({
      option_id: vote.option_id,
      device_id: vote.device_id,
    });
    return grouped;
  }, {});
}

function buildSwingSummary(
  activities: ActivitySummary[],
  optionsByActivity: ActivityOptions,
  votesByActivity: ActivityVotes,
): DebateSwingSummary | null {
  const preActivity = activities.find((activity) => activity.phase === "pre_debate");
  const postActivity = activities.find(
    (activity) => activity.phase === "post_debate",
  );

  if (!preActivity || !postActivity) {
    return null;
  }

  const preOptions = optionsByActivity[preActivity.id] ?? [];
  const postOptions = optionsByActivity[postActivity.id] ?? [];
  const preOptionLabels = new Map(preOptions.map((option) => [option.id, option.label]));
  const postOptionLabels = new Map(
    postOptions.map((option) => [option.id, option.label]),
  );
  const preOptionValues = new Map(
    preOptions.map((option) => [option.id, option.scale_value]),
  );
  const postOptionValues = new Map(
    postOptions.map((option) => [option.id, option.scale_value]),
  );
  const preByDevice = new Map(
    (votesByActivity[preActivity.id] ?? []).map((vote) => [
      vote.device_id,
      {
        label: preOptionLabels.get(vote.option_id) ?? "Unknown",
        scaleValue: preOptionValues.get(vote.option_id) ?? null,
      },
    ]),
  );
  const postByDevice = new Map(
    (votesByActivity[postActivity.id] ?? []).map((vote) => [
      vote.device_id,
      {
        label: postOptionLabels.get(vote.option_id) ?? "Unknown",
        scaleValue: postOptionValues.get(vote.option_id) ?? null,
      },
    ]),
  );

  const format =
    preActivity.type === "scale" && postActivity.type === "scale"
      ? "scale"
      : "multiple_choice";
  const labels = Array.from(
    new Set([...preOptions, ...postOptions].map((option) => option.label)),
  );
  const preTotals = countVotesByLabel(votesByActivity[preActivity.id] ?? [], preOptionLabels);
  const postTotals = countVotesByLabel(
    votesByActivity[postActivity.id] ?? [],
    postOptionLabels,
  );
  const transitionCounts = new Map<string, number>();
  let matchedVotes = 0;
  let changedVotes = 0;
  let crossedVotes = 0;
  let preScaleTotal = 0;
  let postScaleTotal = 0;
  let scaleMatchedVotes = 0;
  let movedTowardLeft = 0;
  let movedTowardRight = 0;
  let unchangedVotes = 0;

  for (const [deviceId, preVote] of preByDevice) {
    const postVote = postByDevice.get(deviceId);
    if (!postVote) continue;

    matchedVotes += 1;
    if (preVote.label !== postVote.label) changedVotes += 1;

    if (
      format === "scale" &&
      preVote.scaleValue !== null &&
      postVote.scaleValue !== null
    ) {
      preScaleTotal += preVote.scaleValue;
      postScaleTotal += postVote.scaleValue;
      scaleMatchedVotes += 1;

      const movement = postVote.scaleValue - preVote.scaleValue;
      if (movement > 0) {
        movedTowardRight += 1;
      } else if (movement < 0) {
        movedTowardLeft += 1;
      } else {
        unchangedVotes += 1;
      }

      if (preVote.scaleValue * postVote.scaleValue < 0) {
        crossedVotes += 1;
      }
    }

    const key = `${preVote.label}|||${postVote.label}`;
    transitionCounts.set(key, (transitionCounts.get(key) ?? 0) + 1);
  }

  const averagePre =
    scaleMatchedVotes === 0 ? null : roundScaleAverage(preScaleTotal / scaleMatchedVotes);
  const averagePost =
    scaleMatchedVotes === 0 ? null : roundScaleAverage(postScaleTotal / scaleMatchedVotes);
  const netSwing =
    averagePre === null || averagePost === null
      ? null
      : roundScaleAverage(averagePost - averagePre);
  const scaleLeftLabel =
    format === "scale" ? getScaleSideLabel(postOptions, -2, "Opposition") : null;
  const scaleRightLabel =
    format === "scale" ? getScaleSideLabel(postOptions, 2, "Proposition") : null;
  const swingWinnerLabel =
    netSwing === null || netSwing === 0
      ? null
      : netSwing > 0
        ? scaleRightLabel
        : scaleLeftLabel;
  const finalLeaderLabel =
    averagePost === null || averagePost === 0
      ? null
      : averagePost > 0
        ? scaleRightLabel
        : scaleLeftLabel;

  return {
    format,
    preActivityId: preActivity.id,
    postActivityId: postActivity.id,
    matchedVotes,
    changedVotes,
    changedPercent:
      matchedVotes === 0 ? 0 : Math.round((changedVotes / matchedVotes) * 100),
    crossedVotes,
    crossedPercent:
      scaleMatchedVotes === 0 ? 0 : Math.round((crossedVotes / scaleMatchedVotes) * 100),
    movedTowardLeft,
    movedTowardRight,
    unchangedVotes,
    averagePre,
    averagePost,
    netSwing,
    scaleLeftLabel,
    scaleRightLabel,
    swingWinnerLabel,
    finalLeaderLabel,
    optionTotals: labels.map((label) => ({
      label,
      preVotes: preTotals.get(label) ?? 0,
      postVotes: postTotals.get(label) ?? 0,
      delta: (postTotals.get(label) ?? 0) - (preTotals.get(label) ?? 0),
    })),
    transitions: Array.from(transitionCounts.entries()).map(([key, count]) => {
      const [from, to] = key.split("|||");
      return { from, to, count };
    }),
  };
}

function roundScaleAverage(value: number) {
  return Math.round(value * 10) / 10;
}

function getScaleSideLabel(
  options: PollOptionRow[],
  scaleValue: number,
  fallback: string,
) {
  return (
    options.find((option) => option.scale_value === scaleValue)?.label ?? fallback
  );
}

function countVotesByLabel(votes: VoteRow[], optionLabels: Map<string, string>) {
  const counts = new Map<string, number>();
  for (const vote of votes) {
    const label = optionLabels.get(vote.option_id) ?? "Unknown";
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return counts;
}
