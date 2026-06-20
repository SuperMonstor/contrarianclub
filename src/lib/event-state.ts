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
};

type VoteRow = {
  option_id: string;
  device_id: string;
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

  const [
    { data: options, error: optionsError },
    { data: votes, error: votesError },
    { data: allOptions, error: allOptionsError },
    { data: allVotes, error: allVotesError },
  ] = await Promise.all([
    supabase
      .from("poll_options")
      .select("id, activity_id, label, sort_order")
      .eq("activity_id", activity.id)
      .order("sort_order", { ascending: true })
      .returns<PollOptionRow[]>(),
    supabase
      .from("votes")
      .select("option_id, device_id")
      .eq("activity_id", activity.id)
      .returns<VoteRow[]>(),
    supabase
      .from("poll_options")
      .select("id, activity_id, label, sort_order")
      .in("activity_id", (activities ?? []).map((item) => item.id))
      .order("sort_order", { ascending: true })
      .returns<PollOptionRow[]>(),
    supabase
      .from("votes")
      .select("option_id, device_id, poll_options!inner(activity_id)")
      .in("poll_options.activity_id", (activities ?? []).map((item) => item.id))
      .returns<(VoteRow & { poll_options: { activity_id: string } })[]>(),
  ]);

  if (optionsError) throw optionsError;
  if (votesError) throw votesError;
  if (allOptionsError) throw allOptionsError;
  if (allVotesError) throw allVotesError;

  const voteCounts = new Map<string, number>();
  for (const vote of votes ?? []) {
    voteCounts.set(vote.option_id, (voteCounts.get(vote.option_id) ?? 0) + 1);
  }

  const optionResults: PollOptionResult[] = (options ?? []).map((option) => ({
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
      groupOptionsByActivity(allOptions ?? []),
      groupVotesByActivity(allVotes ?? []),
    ),
    ...urls,
  };
}

function groupOptionsByActivity(options: PollOptionRow[]) {
  return options.reduce<ActivityOptions>((grouped, option) => {
    grouped[option.activity_id] = grouped[option.activity_id] ?? [];
    grouped[option.activity_id].push(option);
    return grouped;
  }, {});
}

function groupVotesByActivity(
  votes: (VoteRow & { poll_options: { activity_id: string } })[],
) {
  return votes.reduce<ActivityVotes>((grouped, vote) => {
    const activityId = vote.poll_options.activity_id;
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
  const preByDevice = new Map(
    (votesByActivity[preActivity.id] ?? []).map((vote) => [
      vote.device_id,
      preOptionLabels.get(vote.option_id) ?? "Unknown",
    ]),
  );
  const postByDevice = new Map(
    (votesByActivity[postActivity.id] ?? []).map((vote) => [
      vote.device_id,
      postOptionLabels.get(vote.option_id) ?? "Unknown",
    ]),
  );

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

  for (const [deviceId, preLabel] of preByDevice) {
    const postLabel = postByDevice.get(deviceId);
    if (!postLabel) continue;

    matchedVotes += 1;
    if (preLabel !== postLabel) changedVotes += 1;

    const key = `${preLabel}|||${postLabel}`;
    transitionCounts.set(key, (transitionCounts.get(key) ?? 0) + 1);
  }

  return {
    preActivityId: preActivity.id,
    postActivityId: postActivity.id,
    matchedVotes,
    changedVotes,
    changedPercent:
      matchedVotes === 0 ? 0 : Math.round((changedVotes / matchedVotes) * 100),
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

function countVotesByLabel(votes: VoteRow[], optionLabels: Map<string, string>) {
  const counts = new Map<string, number>();
  for (const vote of votes) {
    const label = optionLabels.get(vote.option_id) ?? "Unknown";
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return counts;
}
