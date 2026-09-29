import { requireAdminUser } from "@/lib/auth";
import {
  buildDebateAssets,
  type AssetActivity,
  type AssetMotion,
  type AssetOption,
  type AssetTopic,
  type AssetVote,
} from "@/lib/debate-assets";
import { createServiceClient } from "@/lib/supabase/server";
import type { EventSummary } from "@/lib/types";

export type DebateAssetSet = {
  event: Pick<EventSummary, "code" | "title" | "status">;
  readAt: string;
  motions: AssetMotion[];
};

export async function getDebateAssets(code: string): Promise<DebateAssetSet | null> {
  await requireAdminUser();
  const supabase = createServiceClient();
  const normalizedCode = code.trim().toUpperCase();
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, code, title, status")
    .eq("code", normalizedCode)
    .maybeSingle<Pick<EventSummary, "id" | "code" | "title" | "status">>();

  if (eventError) throw eventError;
  if (!event) return null;

  const [topicsResult, activitiesResult] = await Promise.all([
    supabase
      .from("debate_topics")
      .select("id, motion, sort_order")
      .eq("event_id", event.id)
      .order("sort_order", { ascending: true })
      .returns<AssetTopic[]>(),
    supabase
      .from("activities")
      .select(
        "id, topic_id, phase, type, status, results_visibility, scale_left_label, scale_right_label",
      )
      .eq("event_id", event.id)
      .in("phase", ["pre_debate", "post_debate"])
      .returns<AssetActivity[]>(),
  ]);
  if (topicsResult.error) throw topicsResult.error;
  if (activitiesResult.error) throw activitiesResult.error;

  const activities = activitiesResult.data ?? [];
  const activityIds = activities.map((activity) => activity.id);
  let options: AssetOption[] = [];
  let votes: AssetVote[] = [];
  if (activityIds.length > 0) {
    const [optionsResult, voteRows] = await Promise.all([
      supabase
        .from("poll_options")
        .select("id, activity_id, label, scale_value")
        .in("activity_id", activityIds)
        .returns<AssetOption[]>(),
      getVotesForActivities(supabase, activityIds),
    ]);
    if (optionsResult.error) throw optionsResult.error;
    options = optionsResult.data ?? [];
    votes = voteRows;
  }

  return {
    event: { code: event.code, title: event.title, status: event.status },
    readAt: new Date().toISOString(),
    motions: buildDebateAssets(
      topicsResult.data ?? [],
      activities,
      options,
      votes,
    ),
  };
}

async function getVotesForActivities(
  supabase: ReturnType<typeof createServiceClient>,
  activityIds: string[],
) {
  const pageSize = 1000;
  const votes: AssetVote[] = [];
  for (let first = 0; ; first += pageSize) {
    const { data, error } = await supabase
      .from("votes")
      .select("activity_id, option_id, device_id")
      .in("activity_id", activityIds)
      .order("id", { ascending: true })
      .range(first, first + pageSize - 1)
      .returns<AssetVote[]>();
    if (error) throw error;
    const page = data ?? [];
    votes.push(...page);
    if (page.length < pageSize) break;
  }
  return votes;
}
