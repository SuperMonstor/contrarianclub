"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { currentAdminPath } from "@/lib/admin-routes";
import { requireAdminUser } from "@/lib/auth";
import { createServerAuthClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { buildScaleOptions } from "@/lib/scale";
import { getTopicResetScope } from "@/lib/speaker-challenge";
import type { ActivityType, ControlCommand, PresentationMode } from "@/lib/types";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CHALLENGE_PROMPT = "Current speaker";
const CHALLENGE_OPTION_LABEL = "Legacy next-speaker vote";
const CHALLENGE_BUFFER_DEFAULT = 90;
const CHALLENGE_BUFFER_MIN = 10;
const CHALLENGE_BUFFER_MAX = 600;

type EditableActivity = {
  id: string;
  event_id: string;
  topic_id: string | null;
  sort_order: number;
  phase: "pre_debate" | "post_debate" | "speaker_challenge" | "general";
};

type EditableTopic = {
  id: string;
  event_id: string;
  motion: string;
  sort_order: number;
};

type EditablePollOption = {
  id: string;
  activity_id: string;
  sort_order: number;
};

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

function cleanTopicMotions(formData: FormData) {
  return formData
    .getAll("topicMotions")
    .map((value) => String(value ?? "").trim())
    .slice(0, 2);
}

function getEventFormat(formData: FormData): ActivityType {
  return formData.get("eventFormat") === "scale" ? "scale" : "multiple_choice";
}

function getChallengeSettings(formData: FormData) {
  const enabled = formData.get("enableChallenge") === "on";
  const parsedBuffer = Number.parseInt(
    String(formData.get("challengeBufferSeconds") ?? ""),
    10,
  );
  const bufferSeconds = Number.isFinite(parsedBuffer)
    ? Math.min(CHALLENGE_BUFFER_MAX, Math.max(CHALLENGE_BUFFER_MIN, parsedBuffer))
    : CHALLENGE_BUFFER_DEFAULT;

  return { enabled, bufferSeconds };
}

// Inserting the challenge activity is the first statement that needs the 011
// schema, so translate its failure into an actionable message.
function withChallengeMigrationHint(error: { code?: string; message?: string }) {
  if (error.code === "42703" || error.code === "23514" || error.code === "42P01") {
    return new Error(
      "The Audience Section requires Supabase migrations 011 and 012.",
    );
  }

  return error;
}

async function insertChallengeActivity(
  supabase: ReturnType<typeof createServiceClient>,
  eventId: string,
  topicId: string,
  bufferSeconds: number,
) {
  const { data: activity, error: activityError } = await supabase
    .from("activities")
    .insert({
      event_id: eventId,
      topic_id: topicId,
      sort_order: 1,
      phase: "speaker_challenge",
      type: "multiple_choice",
      prompt: CHALLENGE_PROMPT,
      status: "draft",
      results_visibility: "hidden",
      challenge_buffer_seconds: bufferSeconds,
    })
    .select("id")
    .single<{ id: string }>();

  if (activityError) throw withChallengeMigrationHint(activityError);

  const { error: optionError } = await supabase.from("poll_options").insert({
    activity_id: activity.id,
    label: CHALLENGE_OPTION_LABEL,
    sort_order: 0,
  });

  if (optionError) throw optionError;

  return activity;
}

function getScaleLabels(formData: FormData) {
  return {
    centerLabel:
      String(formData.get("scaleCenterLabel") ?? "").trim() ||
      "Too close to call",
    leftLabel:
      String(formData.get("scaleLeftLabel") ?? "").trim() || "Opposition",
    rightLabel:
      String(formData.get("scaleRightLabel") ?? "").trim() || "Proposition",
  };
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
    .select("event_id, topic_id, sort_order, phase")
    .eq("id", activityId)
    .eq("event_id", event.id)
    .single<EditableActivity>();

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
    .select("id, topic_id, sort_order, phase, created_at")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true })
    .returns<
      {
        id: string;
        topic_id: string | null;
        sort_order: number;
        phase: EditableActivity["phase"];
        created_at: string;
      }[]
    >();

  if (error) throw error;

  // The speaker challenge sits outside the pre → post flow: its rounds are
  // append-only history, so it never joins the cascading reset.
  const currentActivity = activities.find((activity) => activity.id === activityId);
  if (!currentActivity || !currentActivity.topic_id) {
    throw new Error("Activity does not belong to a debate topic.");
  }

  const resetScope = getTopicResetScope(activities, activityId);
  if (resetScope.length === 0) {
    throw new Error("Activity does not belong to this event.");
  }

  return resetScope.map((activity) => activity.id);
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

async function getDebateActivities(
  supabase: ReturnType<typeof createServiceClient>,
  eventId: string,
) {
  const { data: activities, error } = await supabase
    .from("activities")
    .select("id, event_id, topic_id, sort_order, phase")
    .eq("event_id", eventId)
    .in("phase", ["pre_debate", "post_debate"])
    .returns<EditableActivity[]>();

  if (error) throw error;

  return activities ?? [];
}

async function syncChallengeActivities(
  supabase: ReturnType<typeof createServiceClient>,
  eventId: string,
  challenge: { enabled: boolean; bufferSeconds: number },
  topics: EditableTopic[],
  debateActivities: EditableActivity[],
) {
  const { data: existingChallenges, error } = await supabase
    .from("activities")
    .select("id, event_id, topic_id, sort_order, phase")
    .eq("event_id", eventId)
    .eq("phase", "speaker_challenge")
    .returns<EditableActivity[]>();

  if (error) throw error;

  if (challenge.enabled) {
    for (const topic of topics) {
      const existing = (existingChallenges ?? []).find(
        (activity) => activity.topic_id === topic.id,
      );
      if (!existing) {
        await insertChallengeActivity(
          supabase,
          eventId,
          topic.id,
          challenge.bufferSeconds,
        );
        continue;
      }

      const { error: updateError } = await supabase
        .from("activities")
        .update({ challenge_buffer_seconds: challenge.bufferSeconds })
        .eq("id", existing.id);

      if (updateError) throw withChallengeMigrationHint(updateError);
    }
    return;
  }

  if (!existingChallenges?.length) return;

  // Disabling removes the activity (options, votes, and joins cascade). If the
  // presenter was parked on it, hand the stage back to the pre-debate poll
  // first so the audience doesn't land on a deleted activity.
  const preActivity = debateActivities.find(
    (activity) => activity.phase === "pre_debate",
  );

  const { data: presentation, error: presentationError } = await supabase
    .from("presentation_state")
    .select("active_activity_id")
    .eq("event_id", eventId)
    .maybeSingle<{ active_activity_id: string | null }>();

  if (presentationError) throw presentationError;

  if (
    existingChallenges.some(
      (activity) => activity.id === presentation?.active_activity_id,
    ) &&
    preActivity
  ) {
    const { error: repointError } = await supabase
      .from("presentation_state")
      .update({
        active_activity_id: preActivity.id,
        mode: "join",
        updated_at: new Date().toISOString(),
      })
      .eq("event_id", eventId);

    if (repointError) throw repointError;
  }

  const { error: deleteError } = await supabase
    .from("activities")
    .delete()
    .in(
      "id",
      existingChallenges.map((activity) => activity.id),
    );

  if (deleteError) throw deleteError;
}

async function syncPollOptions(
  supabase: ReturnType<typeof createServiceClient>,
  activityId: string,
  eventOptions: { label: string; scale_value: number | null }[],
  eventFormat: ActivityType,
) {
  const { data: existingOptions, error } = await supabase
    .from("poll_options")
    .select("id, activity_id, sort_order")
    .eq("activity_id", activityId)
    .order("sort_order", { ascending: true })
    .returns<EditablePollOption[]>();

  if (error) throw error;

  const reusableOptions = existingOptions.slice(0, eventOptions.length);
  const extraOptionIds = existingOptions
    .slice(eventOptions.length)
    .map((option) => option.id);

  for (const [sort_order, option] of eventOptions.entries()) {
    const existingOption = reusableOptions[sort_order];

    if (!existingOption) continue;

    const update =
      eventFormat === "scale"
        ? {
            label: option.label,
            sort_order,
            scale_value: option.scale_value,
          }
        : {
            label: option.label,
            sort_order,
          };

    const { error: updateError } = await supabase
      .from("poll_options")
      .update(update)
      .eq("id", existingOption.id);

    if (updateError) throw updateError;
  }

  const rowsToInsert = eventOptions
    .slice(reusableOptions.length)
    .map((option, index) => ({
      activity_id: activityId,
      label: option.label,
      sort_order: reusableOptions.length + index,
      scale_value: option.scale_value,
    }));

  if (rowsToInsert.length > 0) {
    await insertPollOptions(supabase, rowsToInsert, eventFormat);
  }

  if (extraOptionIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("poll_options")
      .delete()
      .in("id", extraOptionIds);

    if (deleteError) throw deleteError;
  }
}

async function assertScaleSchemaReady(
  supabase: ReturnType<typeof createServiceClient>,
) {
  const [{ error: optionError }, { error: activityError }] = await Promise.all([
    supabase.from("poll_options").select("scale_value").limit(1),
    supabase
      .from("activities")
      .select("scale_left_label, scale_center_label, scale_right_label")
      .limit(1),
  ]);

  const error = optionError ?? activityError;
  if (!error) return;

  if (error.code === "42703") {
    throw new Error(
      "Scale events require Supabase migrations 005_scale_poll_format.sql and 007_scale_activity_labels.sql.",
    );
  }

  throw error;
}

async function ensureTopics(
  supabase: ReturnType<typeof createServiceClient>,
  eventId: string,
  motions: string[],
) {
  const { data: existingTopics, error } = await supabase
    .from("debate_topics")
    .select("id, event_id, motion, sort_order")
    .eq("event_id", eventId)
    .order("sort_order", { ascending: true })
    .returns<EditableTopic[]>();

  if (error) throw error;

  const topics = [...(existingTopics ?? [])];
  for (let sortOrder = 0; sortOrder < motions.length; sortOrder += 1) {
    const existing = topics.find((topic) => topic.sort_order === sortOrder);
    if (existing) {
      const { error: updateError } = await supabase
        .from("debate_topics")
        .update({ motion: motions[sortOrder] })
        .eq("id", existing.id);
      if (updateError) throw updateError;
      existing.motion = motions[sortOrder];
      continue;
    }

    const { data: inserted, error: insertError } = await supabase
      .from("debate_topics")
      .insert({ event_id: eventId, motion: motions[sortOrder], sort_order: sortOrder })
      .select("id, event_id, motion, sort_order")
      .single<EditableTopic>();
    if (insertError) throw insertError;
    topics.push(inserted);
  }

  return topics
    .filter((topic) => topic.sort_order < motions.length)
    .sort((first, second) => first.sort_order - second.sort_order);
}

async function ensureTopicPollActivities(
  supabase: ReturnType<typeof createServiceClient>,
  eventId: string,
  topics: EditableTopic[],
  eventFormat: ActivityType,
  prePrompt: string,
  postPrompt: string,
  scaleLabels: ReturnType<typeof getScaleLabels>,
) {
  const existingActivities = await getDebateActivities(supabase, eventId);
  const activities = [...existingActivities];

  for (const topic of topics) {
    for (const phase of ["pre_debate", "post_debate"] as const) {
      const existing = activities.find(
        (activity) => activity.topic_id === topic.id && activity.phase === phase,
      );
      const prompt = phase === "pre_debate" ? prePrompt : postPrompt;
      const sortOrder = phase === "pre_debate" ? 0 : 2;
      const values = {
        event_id: eventId,
        topic_id: topic.id,
        sort_order: sortOrder,
        phase,
        prompt,
        type: eventFormat,
        status: "draft",
        results_visibility: "hidden",
        ...(eventFormat === "scale"
          ? {
              scale_center_label: scaleLabels.centerLabel,
              scale_left_label: scaleLabels.leftLabel,
              scale_right_label: scaleLabels.rightLabel,
            }
          : {}),
      };

      if (!existing) {
        const { data: inserted, error: insertError } = await supabase
          .from("activities")
          .insert(values)
          .select("id, event_id, topic_id, sort_order, phase")
          .single<EditableActivity>();
        if (insertError) throw insertError;
        activities.push(inserted);
        continue;
      }

      const { error: updateError } = await supabase
        .from("activities")
        .update({
          prompt,
          sort_order: sortOrder,
          type: eventFormat,
          ...(eventFormat === "scale"
            ? {
                scale_center_label: scaleLabels.centerLabel,
                scale_left_label: scaleLabels.leftLabel,
                scale_right_label: scaleLabels.rightLabel,
              }
            : {}),
        })
        .eq("id", existing.id);
      if (updateError) throw updateError;
    }
  }

  return activities.filter(
    (activity) =>
      activity.topic_id !== null &&
      topics.some((topic) => topic.id === activity.topic_id),
  );
}

export async function createEvent(formData: FormData) {
  await requireAdminUser();

  const supabase = createServiceClient();
  const title = String(formData.get("title") ?? "").trim();
  const topicMotions = cleanTopicMotions(formData);
  const prePrompt = String(formData.get("prePrompt") ?? "").trim();
  const postPrompt = String(formData.get("postPrompt") ?? "").trim();
  const eventFormat = getEventFormat(formData);
  const options = cleanOptions(formData);
  const scaleLabels = getScaleLabels(formData);
  const challenge = getChallengeSettings(formData);

  if (
    !title ||
    topicMotions.length !== 2 ||
    topicMotions.some((motion) => !motion) ||
    !prePrompt ||
    !postPrompt ||
    (eventFormat === "multiple_choice" && options.length < 2)
  ) {
    throw new Error(
      "Title, two topic motions, pre/post prompts, and at least two options are required.",
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

  const topics = await ensureTopics(supabase, event.id, topicMotions);
  const activities = await ensureTopicPollActivities(
    supabase,
    event.id,
    topics,
    eventFormat,
    prePrompt,
    postPrompt,
    scaleLabels,
  );

  const preActivity = activities.find(
    (activity) =>
      activity.topic_id === topics[0]?.id && activity.phase === "pre_debate",
  );
  if (!preActivity) {
    throw new Error("Could not create the pre-debate activity.");
  }

  const eventOptions =
    eventFormat === "scale"
      ? buildScaleOptions(scaleLabels)
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

  if (challenge.enabled) {
    await syncChallengeActivities(supabase, event.id, challenge, topics, activities);
  }

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

export async function updateEvent(code: string, formData: FormData) {
  await requireAdminUser();

  const normalizedCode = code.trim().toUpperCase();
  const supabase = createServiceClient();
  const title = String(formData.get("title") ?? "").trim();
  const topicMotions = cleanTopicMotions(formData);
  const prePrompt = String(formData.get("prePrompt") ?? "").trim();
  const postPrompt = String(formData.get("postPrompt") ?? "").trim();
  const eventFormat = getEventFormat(formData);
  const options = cleanOptions(formData);
  const scaleLabels = getScaleLabels(formData);
  const challenge = getChallengeSettings(formData);

  if (
    !title ||
    topicMotions.length !== 2 ||
    topicMotions.some((motion) => !motion) ||
    !prePrompt ||
    !postPrompt ||
    (eventFormat === "multiple_choice" && options.length < 2)
  ) {
    throw new Error(
      "Title, two topic motions, pre/post prompts, and at least two options are required.",
    );
  }

  if (eventFormat === "scale") {
    await assertScaleSchemaReady(supabase);
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, code")
    .eq("code", normalizedCode)
    .single<{ id: string; code: string }>();

  if (eventError) throw eventError;

  const { error: updateEventError } = await supabase
    .from("events")
    .update({ title })
    .eq("id", event.id);

  if (updateEventError) throw updateEventError;

  const topics = await ensureTopics(supabase, event.id, topicMotions);
  const debateActivities = await ensureTopicPollActivities(
    supabase,
    event.id,
    topics,
    eventFormat,
    prePrompt,
    postPrompt,
    scaleLabels,
  );

  const eventOptions =
    eventFormat === "scale"
      ? buildScaleOptions(scaleLabels)
      : options.map((label) => ({ label, scale_value: null }));

  for (const activity of debateActivities) {
    await syncPollOptions(supabase, activity.id, eventOptions, eventFormat);
  }

  await syncChallengeActivities(
    supabase,
    event.id,
    challenge,
    topics,
    debateActivities,
  );

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/admin/events/${event.code}`);
  revalidatePath(`/admin/events/${event.code}/edit`);
  revalidatePath(`/host/${event.code}`);
  revalidatePath(`/join/${event.code}`);
  revalidatePath(`/present/${event.code}`);
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

  // Challenge rounds are append-only history; there is nothing to reset.
  if (command === "reset" && activity.phase === "speaker_challenge") {
    throw new Error("Use the Audience Section rehearsal reset instead.");
  }

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

async function runSpeakerAdminCommand(
  code: string,
  activityId: string,
  rpc:
    | "admin_start_speaker"
    | "admin_pause_speaker"
    | "admin_resume_speaker"
    | "admin_advance_speaker"
    | "admin_reset_speaker",
) {
  await requireAdminUser();

  const supabase = createServiceClient();
  const activity = await getActivityForEvent(supabase, code, activityId);

  if (activity.phase !== "speaker_challenge") {
    throw new Error("Only the Audience Section has speaker sessions.");
  }

  const { error } = await supabase.rpc(rpc, { p_activity_id: activityId });
  if (error) throw withChallengeMigrationHint(error);

  revalidatePath(`/host/${code}`);
  revalidatePath(`/admin/events/${code}`);
  revalidatePath(`/join/${code}`);
  revalidatePath(`/present/${code}`);
}

export async function startChallengeSpeaker(code: string, activityId: string) {
  return runSpeakerAdminCommand(code, activityId, "admin_start_speaker");
}

export async function pauseChallengeSpeaker(code: string, activityId: string) {
  return runSpeakerAdminCommand(code, activityId, "admin_pause_speaker");
}

export async function resumeChallengeSpeaker(code: string, activityId: string) {
  return runSpeakerAdminCommand(code, activityId, "admin_resume_speaker");
}

export async function advanceChallengeRound(code: string, activityId: string) {
  return runSpeakerAdminCommand(code, activityId, "admin_advance_speaker");
}

export async function resetChallenge(code: string, activityId: string) {
  return runSpeakerAdminCommand(code, activityId, "admin_reset_speaker");
}

export async function setActiveActivity(code: string, activityId: string) {
  await requireAdminUser();

  const supabase = createServiceClient();
  const activity = await getActivityForEvent(supabase, code, activityId);

  const { error: stateError } = await supabase.rpc("admin_switch_section", {
    p_event_id: activity.event_id,
    p_activity_id: activityId,
  });

  if (stateError) throw stateError;

  revalidatePath(`/admin/events/${code}`);
  revalidatePath(`/join/${code}`);
  revalidatePath(`/present/${code}`);
}

export async function setPresenterMode(
  code: string,
  activityId: string,
  mode: PresentationMode,
) {
  await requireAdminUser();

  const supabase = createServiceClient();
  const activity = await getActivityForEvent(supabase, code, activityId);

  const { error: stateError } = await supabase
    .from("presentation_state")
    .upsert({
      event_id: activity.event_id,
      active_activity_id: activityId,
      mode,
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
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id")
    .eq("code", code.trim().toUpperCase())
    .single();

  if (eventError) throw eventError;

  const { error } = await supabase.rpc("admin_set_event_status", {
    p_event_id: event.id,
    p_status: status,
  });

  if (error) throw withChallengeMigrationHint(error);

  revalidatePath("/admin");
  revalidatePath(`/admin/events/${code}`);
  revalidatePath(`/join/${code}`);
  revalidatePath(`/present/${code}`);
}

export async function updateDefaultEvent(formData: FormData) {
  await requireAdminUser();

  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const shouldDefault = formData.get("isDefault") === "true";

  if (!code) {
    throw new Error("Event code is required.");
  }

  const supabase = createServiceClient();

  const { error: clearError } = await supabase
    .from("events")
    .update({ is_default: false })
    .eq("is_default", true);

  if (clearError) {
    if (clearError.code === "42703") {
      throw new Error(
        "Default events require Supabase migration 006_default_event.sql.",
      );
    }

    throw clearError;
  }

  if (shouldDefault) {
    const { error: setError } = await supabase
      .from("events")
      .update({ is_default: true })
      .eq("code", code);

    if (setError) throw setError;
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/admin/events/${code}`);
}

export async function signOutAdmin() {
  const supabase = await createServerAuthClient();
  await supabase.auth.signOut();
  redirect(await currentAdminPath("/login"));
}
