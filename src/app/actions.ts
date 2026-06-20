"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { currentAdminPath } from "@/lib/admin-routes";
import { requireAdminUser } from "@/lib/auth";
import { createServerAuthClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { ActivityType, ControlCommand, PresentationMode } from "@/lib/types";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const PHASE_ORDER = {
  pre_debate: 0,
  post_debate: 1,
  general: 2,
} as const;

function makeEventCode(length = 6) {
  return Array.from({ length }, () =>
    CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)],
  ).join("");
}

function cleanOptions(formData: FormData) {
  return formData
    .getAll("options")
    .flatMap((value) => String(value ?? "").split("\n"))
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function getEventFormat(formData: FormData): ActivityType {
  return formData.get("eventFormat") === "scale" ? "scale" : "multiple_choice";
}

function buildScaleOptions(formData: FormData) {
  const leftLabel =
    String(formData.get("scaleLeftLabel") ?? "").trim() || "Opposition";
  const rightLabel =
    String(formData.get("scaleRightLabel") ?? "").trim() || "Proposition";
  const centerLabel =
    String(formData.get("scaleCenterLabel") ?? "").trim() || "Too close to call";

  return [
    { label: `Absolutely sure: ${leftLabel}`, scale_value: -3 },
    { label: `Agree with ${leftLabel}`, scale_value: -2 },
    { label: `Leaning towards ${leftLabel}`, scale_value: -1 },
    { label: centerLabel, scale_value: 0 },
    { label: `Leaning towards ${rightLabel}`, scale_value: 1 },
    { label: `Agree with ${rightLabel}`, scale_value: 2 },
    { label: `Absolutely sure: ${rightLabel}`, scale_value: 3 },
  ];
}

async function createUniqueCode() {
  const supabase = createServiceClient();

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = makeEventCode();
    const { data, error } = await supabase
      .from("events")
      .select("id")
      .eq("code", code)
      .maybeSingle();

    if (error) throw error;
    if (!data) return code;
  }

  throw new Error("Could not generate a unique event code.");
}

async function getActivityForEvent(
  supabase: ReturnType<typeof createServiceClient>,
  code: string,
  activityId: string,
) {
  const normalizedCode = code.trim().toUpperCase();
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id")
    .eq("code", normalizedCode)
    .single<{ id: string }>();

  if (eventError) throw eventError;

  const { data: activity, error: activityError } = await supabase
    .from("activities")
    .select("event_id")
    .eq("id", activityId)
    .eq("event_id", event.id)
    .single<{ event_id: string }>();

  if (activityError) throw activityError;

  return activity;
}

async function getResetActivityIds(
  supabase: ReturnType<typeof createServiceClient>,
  eventId: string,
  activityId: string,
) {
  const { data: activities, error } = await supabase
    .from("activities")
    .select("id, phase, created_at")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true })
    .returns<
      { id: string; phase: keyof typeof PHASE_ORDER; created_at: string }[]
    >();

  if (error) throw error;

  const orderedActivities = [...activities].sort(
    (first, second) =>
      PHASE_ORDER[first.phase] - PHASE_ORDER[second.phase] ||
      first.created_at.localeCompare(second.created_at),
  );

  const currentIndex = orderedActivities.findIndex(
    (activity) => activity.id === activityId,
  );
  if (currentIndex === -1) {
    throw new Error("Activity does not belong to this event.");
  }

  return orderedActivities.slice(currentIndex).map((activity) => activity.id);
}

async function deleteOrphanParticipants(
  supabase: ReturnType<typeof createServiceClient>,
  eventId: string,
) {
  const { data: participants, error: participantsError } = await supabase
    .from("participants")
    .select("id")
    .eq("event_id", eventId)
    .returns<{ id: string }[]>();

  if (participantsError) throw participantsError;

  const participantIds = participants.map((participant) => participant.id);
  if (participantIds.length === 0) return;

  const { data: remainingVotes, error: votesError } = await supabase
    .from("votes")
    .select("participant_id")
    .in("participant_id", participantIds)
    .returns<{ participant_id: string | null }[]>();

  if (votesError) throw votesError;

  const retainedParticipantIds = new Set(
    remainingVotes
      .map((vote) => vote.participant_id)
      .filter((participantId): participantId is string => Boolean(participantId)),
  );
  const orphanParticipantIds = participantIds.filter(
    (participantId) => !retainedParticipantIds.has(participantId),
  );

  if (orphanParticipantIds.length === 0) return;

  const { error: deleteError } = await supabase
    .from("participants")
    .delete()
    .in("id", orphanParticipantIds);

  if (deleteError) throw deleteError;
}

async function insertPollOptions(
  supabase: ReturnType<typeof createServiceClient>,
  rows: {
    activity_id: string;
    label: string;
    sort_order: number;
    scale_value: number | null;
  }[],
  eventFormat: ActivityType,
) {
  const { error } = await supabase.from("poll_options").insert(rows);

  if (!error) return;

  if (error.code !== "42703") throw error;

  if (eventFormat === "scale") {
    throw new Error(
      "Scale events require Supabase migration 005_scale_poll_format.sql.",
    );
  }

  const { error: fallbackError } = await supabase.from("poll_options").insert(
    rows.map(({ activity_id, label, sort_order }) => ({
      activity_id,
      label,
      sort_order,
    })),
  );

  if (fallbackError) throw fallbackError;
}

async function assertScaleSchemaReady(
  supabase: ReturnType<typeof createServiceClient>,
) {
  const { error } = await supabase
    .from("poll_options")
    .select("scale_value")
    .limit(1);

  if (!error) return;

  if (error.code === "42703") {
    throw new Error(
      "Scale events require Supabase migration 005_scale_poll_format.sql.",
    );
  }

  throw error;
}

export async function createEvent(formData: FormData) {
  await requireAdminUser();

  const supabase = createServiceClient();
  const title = String(formData.get("title") ?? "").trim();
  const prePrompt = String(formData.get("prePrompt") ?? "").trim();
  const postPrompt = String(formData.get("postPrompt") ?? "").trim();
  const eventFormat = getEventFormat(formData);
  const options = cleanOptions(formData);

  if (
    !title ||
    !prePrompt ||
    !postPrompt ||
    (eventFormat === "multiple_choice" && options.length < 2)
  ) {
    throw new Error(
      "Title, pre/post prompts, and at least two options are required.",
    );
  }

  if (eventFormat === "scale") {
    await assertScaleSchemaReady(supabase);
  }

  const code = await createUniqueCode();

  const { data: event, error: eventError } = await supabase
    .from("events")
    .insert({ code, title })
    .select("id, code")
    .single();

  if (eventError) throw eventError;

  const { data: activities, error: activityError } = await supabase
    .from("activities")
    .insert([
      {
        event_id: event.id,
        prompt: prePrompt,
        phase: "pre_debate",
        type: eventFormat,
        status: "draft",
        results_visibility: "hidden",
      },
      {
        event_id: event.id,
        prompt: postPrompt,
        phase: "post_debate",
        type: eventFormat,
        status: "draft",
        results_visibility: "hidden",
      },
    ])
    .select("id, phase")
    .returns<{ id: string; phase: "pre_debate" | "post_debate" }[]>();

  if (activityError) throw activityError;

  const preActivity = activities.find((activity) => activity.phase === "pre_debate");
  if (!preActivity) {
    throw new Error("Could not create the pre-debate activity.");
  }

  const eventOptions =
    eventFormat === "scale"
      ? buildScaleOptions(formData)
      : options.map((label) => ({ label, scale_value: null }));

  await insertPollOptions(
    supabase,
    activities.flatMap((activity) =>
      eventOptions.map((option, sort_order) => ({
        activity_id: activity.id,
        label: option.label,
        sort_order,
        scale_value: option.scale_value,
      })),
    ),
    eventFormat,
  );

  const { error: stateError } = await supabase
    .from("presentation_state")
    .insert({
      event_id: event.id,
      active_activity_id: preActivity.id,
      mode: "join",
    });

  if (stateError) throw stateError;

  revalidatePath("/");
  redirect(await currentAdminPath(`/events/${event.code}`));
}

export async function controlActivity(
  code: string,
  activityId: string,
  command: ControlCommand,
) {
  await requireAdminUser();

  const supabase = createServiceClient();
  const activity = await getActivityForEvent(supabase, code, activityId);

  const statusByCommand = {
    open: "open",
    close: "closed",
    reveal: null,
    hide: null,
    reset: "draft",
  } as const;

  const visibilityByCommand = {
    open: "hidden",
    close: null,
    reveal: "revealed",
    hide: "hidden",
    reset: "hidden",
  } as const;

  const modeByCommand: Record<ControlCommand, PresentationMode> = {
    open: "poll",
    close: "poll",
    reveal: "results",
    hide: "poll",
    reset: "join",
  };

  const activityUpdate: Record<string, string> = {};
  const nextStatus = statusByCommand[command];
  const nextVisibility = visibilityByCommand[command];

  if (nextStatus) activityUpdate.status = nextStatus;
  if (nextVisibility) activityUpdate.results_visibility = nextVisibility;

  if (Object.keys(activityUpdate).length > 0 && command !== "reset") {
    const { error: activityError } = await supabase
      .from("activities")
      .update(activityUpdate)
      .eq("id", activityId);

    if (activityError) throw activityError;
  }

  if (command === "reset") {
    const resetActivityIds = await getResetActivityIds(
      supabase,
      activity.event_id,
      activityId,
    );

    const { error: activityError } = await supabase
      .from("activities")
      .update({
        status: "draft",
        results_visibility: "hidden",
      })
      .in("id", resetActivityIds);

    if (activityError) throw activityError;

    const { error: votesError } = await supabase
      .from("votes")
      .delete()
      .in("activity_id", resetActivityIds);

    if (votesError) throw votesError;

    await deleteOrphanParticipants(supabase, activity.event_id);
  }

  const { error: stateError } = await supabase
    .from("presentation_state")
    .upsert({
      event_id: activity.event_id,
      active_activity_id: activityId,
      mode: modeByCommand[command],
      updated_at: new Date().toISOString(),
    });

  if (stateError) throw stateError;

  revalidatePath(`/host/${code}`);
  revalidatePath(`/admin/events/${code}`);
  revalidatePath(`/join/${code}`);
  revalidatePath(`/present/${code}`);
}

export async function setActiveActivity(code: string, activityId: string) {
  await requireAdminUser();

  const supabase = createServiceClient();
  const activity = await getActivityForEvent(supabase, code, activityId);

  const { error: stateError } = await supabase
    .from("presentation_state")
    .upsert({
      event_id: activity.event_id,
      active_activity_id: activityId,
      mode: "poll",
      updated_at: new Date().toISOString(),
    });

  if (stateError) throw stateError;

  revalidatePath(`/admin/events/${code}`);
  revalidatePath(`/join/${code}`);
  revalidatePath(`/present/${code}`);
}

export async function updateEventStatus(
  code: string,
  status: "draft" | "live" | "ended" | "archived",
) {
  await requireAdminUser();

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("events")
    .update({ status })
    .eq("code", code);

  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath(`/admin/events/${code}`);
  revalidatePath(`/join/${code}`);
  revalidatePath(`/present/${code}`);
}

export async function signOutAdmin() {
  const supabase = await createServerAuthClient();
  await supabase.auth.signOut();
  redirect(await currentAdminPath("/login"));
}
