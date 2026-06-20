"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/auth";
import { createServerAuthClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { ControlCommand, PresentationMode } from "@/lib/types";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function makeEventCode(length = 6) {
  return Array.from({ length }, () =>
    CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)],
  ).join("");
}

function cleanOptionLines(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 8);
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

export async function createEvent(formData: FormData) {
  await requireAdminUser();

  const supabase = createServiceClient();
  const title = String(formData.get("title") ?? "").trim();
  const prompt = String(formData.get("prompt") ?? "").trim();
  const options = cleanOptionLines(formData.get("options"));

  if (!title || !prompt || options.length < 2) {
    throw new Error("Title, prompt, and at least two options are required.");
  }

  const code = await createUniqueCode();

  const { data: event, error: eventError } = await supabase
    .from("events")
    .insert({ code, title })
    .select("id, code")
    .single();

  if (eventError) throw eventError;

  const { data: activity, error: activityError } = await supabase
    .from("activities")
    .insert({
      event_id: event.id,
      prompt,
      type: "multiple_choice",
      status: "draft",
      results_visibility: "hidden",
    })
    .select("id")
    .single();

  if (activityError) throw activityError;

  const { error: optionsError } = await supabase.from("poll_options").insert(
    options.map((label, sort_order) => ({
      activity_id: activity.id,
      label,
      sort_order,
    })),
  );

  if (optionsError) throw optionsError;

  const { error: stateError } = await supabase
    .from("presentation_state")
    .insert({
      event_id: event.id,
      active_activity_id: activity.id,
      mode: "join",
    });

  if (stateError) throw stateError;

  revalidatePath("/");
  redirect(`/admin/events/${event.code}`);
}

export async function controlActivity(
  code: string,
  activityId: string,
  command: ControlCommand,
) {
  await requireAdminUser();

  const supabase = createServiceClient();

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

  if (Object.keys(activityUpdate).length > 0) {
    const { error: activityError } = await supabase
      .from("activities")
      .update(activityUpdate)
      .eq("id", activityId);

    if (activityError) throw activityError;
  }

  if (command === "reset") {
    const { error: votesError } = await supabase
      .from("votes")
      .delete()
      .eq("activity_id", activityId);

    if (votesError) throw votesError;
  }

  const { data: activity, error: lookupError } = await supabase
    .from("activities")
    .select("event_id")
    .eq("id", activityId)
    .single<{ event_id: string }>();

  if (lookupError) throw lookupError;

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
  redirect("/admin/login");
}
