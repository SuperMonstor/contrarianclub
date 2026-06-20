import { unstable_noStore as noStore } from "next/cache";
import { buildEventUrls } from "@/lib/site";
import { createServiceClient } from "@/lib/supabase/server";
import type {
  ActivitySummary,
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
};

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
    .select("id, event_id, type, prompt, status, results_visibility, created_at")
    .eq("event_id", event.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .returns<ActivitySummary[]>();

  if (activityError) {
    throw activityError;
  }

  const activity = activities?.[0] ?? null;
  const urls = buildEventUrls(event.code);

  if (!activity) {
    return {
      event,
      activity: null,
      mode: "join",
      options: [],
      totalVotes: 0,
      participantCount: 0,
      ...urls,
    };
  }

  const [
    { data: options, error: optionsError },
    { data: votes, error: votesError },
    { count: participantCount, error: participantsError },
    { data: presentationState, error: presentationError },
  ] = await Promise.all([
    supabase
      .from("poll_options")
      .select("id, activity_id, label, sort_order")
      .eq("activity_id", activity.id)
      .order("sort_order", { ascending: true })
      .returns<PollOptionRow[]>(),
    supabase
      .from("votes")
      .select("option_id")
      .eq("activity_id", activity.id)
      .returns<VoteRow[]>(),
    supabase
      .from("participants")
      .select("id", { count: "exact", head: true })
      .eq("event_id", event.id),
    supabase
      .from("presentation_state")
      .select("mode")
      .eq("event_id", event.id)
      .maybeSingle<{ mode: PresentationMode }>(),
  ]);

  if (optionsError) throw optionsError;
  if (votesError) throw votesError;
  if (participantsError) throw participantsError;
  if (presentationError) throw presentationError;

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
    activity,
    mode: presentationState?.mode ?? "join",
    options: optionResults,
    totalVotes: votes?.length ?? 0,
    participantCount: participantCount ?? 0,
    ...urls,
  };
}
