import "server-only";
import { createServiceClient } from "@/lib/supabase/server";
import { MAX_MOTIONS } from "@/lib/whatsapp/template";

export type DebateOption = {
  id: string;
  code: string;
  title: string;
  debateNumber: string | null;
  motions: string[];
};

// Debate records have no number column, so the number is read from titles
// such as "Debate #12" or "Contrarian Debate 12" when one is present.
export function debateNumberFromTitle(title: string): string | null {
  const match = title.match(/#\s*0*([1-9][0-9]{0,3})\b/) ??
    title.match(/\bdebate\s+0*([1-9][0-9]{0,3})\b/i);
  return match ? match[1] : null;
}

export async function getDebateOptions(limit = 20): Promise<DebateOption[]> {
  const supabase = createServiceClient();
  const { data: events, error } = await supabase
    .from("events")
    .select("id, code, title")
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<{ id: string; code: string; title: string }[]>();
  if (error) throw error;
  if (!events?.length) return [];

  const { data: topics, error: topicsError } = await supabase
    .from("debate_topics")
    .select("event_id, motion, sort_order")
    .in("event_id", events.map((event) => event.id))
    .order("sort_order", { ascending: true })
    .returns<{ event_id: string; motion: string; sort_order: number }[]>();
  if (topicsError) throw topicsError;

  return events.map((event) => ({
    id: event.id,
    code: event.code,
    title: event.title,
    debateNumber: debateNumberFromTitle(event.title),
    motions: (topics ?? [])
      .filter((topic) => topic.event_id === event.id)
      .map((topic) => topic.motion)
      .slice(0, MAX_MOTIONS),
  }));
}
