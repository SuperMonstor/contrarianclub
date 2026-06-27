import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";
import { NewEventForm, type EventFormValues } from "@/components/new-event-form";
import { currentAdminPath } from "@/lib/admin-routes";
import { requireAdminUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import type { ActivitySummary, EventSummary } from "@/lib/types";

export const dynamic = "force-dynamic";

type ActivityEditRow = ActivitySummary;
type ActivityBaseEditRow = Omit<
  ActivitySummary,
  "scale_left_label" | "scale_center_label" | "scale_right_label"
>;

type PollOptionEditRow = {
  label: string;
  sort_order: number;
  scale_value: number | null;
};

type ScaleLabels = {
  leftLabel: string;
  centerLabel: string;
  rightLabel: string;
};

async function getEditableEvent(code: string) {
  const supabase = createServiceClient();
  const normalizedCode = code.trim().toUpperCase();

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, code, title, status, created_at")
    .eq("code", normalizedCode)
    .maybeSingle<EventSummary>();

  if (eventError) throw eventError;
  if (!event) return null;

  const activities = await getEditableActivities(supabase, event.id);
  const preActivity = activities.find(
    (activity) => activity.phase === "pre_debate",
  );
  const postActivity = activities.find(
    (activity) => activity.phase === "post_debate",
  );

  if (!preActivity || !postActivity) {
    throw new Error("This event is missing its pre/post debate activities.");
  }

  const { data: options, error: optionsError } = await supabase
    .from("poll_options")
    .select("label, sort_order, scale_value")
    .eq("activity_id", preActivity.id)
    .order("sort_order", { ascending: true })
    .returns<PollOptionEditRow[]>();

  if (optionsError) throw optionsError;

  const derivedScaleLabels = deriveScaleLabels(options ?? []);
  const scaleLeftLabel =
    preActivity.scale_left_label ?? derivedScaleLabels.leftLabel;
  const scaleCenterLabel =
    preActivity.scale_center_label ?? derivedScaleLabels.centerLabel;
  const scaleRightLabel =
    preActivity.scale_right_label ?? derivedScaleLabels.rightLabel;
  const formValues: EventFormValues = {
    title: event.title,
    eventFormat: preActivity.type,
    options:
      preActivity.type === "scale"
        ? [scaleRightLabel, scaleLeftLabel, scaleCenterLabel]
        : (options ?? []).map((option) => option.label),
    scaleLeftLabel,
    scaleCenterLabel,
    scaleRightLabel,
    prePrompt: preActivity.prompt,
    postPrompt: postActivity.prompt,
  };

  return { event, formValues };
}

function deriveScaleLabels(options: PollOptionEditRow[]): ScaleLabels {
  const sortedOptions = [...options].sort(
    (first, second) => first.sort_order - second.sort_order,
  );

  return {
    leftLabel: getScaleLabel(sortedOptions, -2, 1, "Opposition"),
    centerLabel: getScaleLabel(sortedOptions, 0, 3, "Too close to call"),
    rightLabel: getScaleLabel(sortedOptions, 2, 5, "Proposition"),
  };
}

function getScaleLabel(
  options: PollOptionEditRow[],
  scaleValue: number,
  sortOrder: number,
  fallback: string,
) {
  const option =
    options.find((candidate) => candidate.scale_value === scaleValue) ??
    options.find((candidate) => candidate.sort_order === sortOrder);

  if (!option?.label) return fallback;

  return option.label
    .replace(/^Absolutely sure:\s*/i, "")
    .replace(/^Agree with\s+/i, "")
    .replace(/^Leaning towards\s+/i, "")
    .replace(/^Strongly\s+/i, "")
    .replace(/^Lean\s+/i, "")
    .trim();
}

async function getEditableActivities(
  supabase: ReturnType<typeof createServiceClient>,
  eventId: string,
) {
  const withLabels = await supabase
    .from("activities")
    .select(
      "id, event_id, type, phase, prompt, status, results_visibility, created_at, scale_left_label, scale_center_label, scale_right_label",
    )
    .eq("event_id", eventId)
    .in("phase", ["pre_debate", "post_debate"])
    .order("created_at", { ascending: true })
    .returns<ActivityEditRow[]>();

  if (!withLabels.error) {
    return withLabels.data ?? [];
  }

  if (withLabels.error.code !== "42703") {
    throw withLabels.error;
  }

  const withoutLabels = await supabase
    .from("activities")
    .select(
      "id, event_id, type, phase, prompt, status, results_visibility, created_at",
    )
    .eq("event_id", eventId)
    .in("phase", ["pre_debate", "post_debate"])
    .order("created_at", { ascending: true })
    .returns<ActivityBaseEditRow[]>();

  if (withoutLabels.error) throw withoutLabels.error;

  return (withoutLabels.data ?? []).map((activity) => ({
    ...activity,
    scale_center_label: null,
    scale_left_label: null,
    scale_right_label: null,
  }));
}

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  await requireAdminUser();
  const { code } = await params;
  const editableEvent = await getEditableEvent(code);
  const eventsHref = await currentAdminPath("/");

  if (!editableEvent) {
    return (
      <main className="club-shell flex min-h-screen items-center justify-center px-5">
        <div className="club-panel club-rise max-w-lg p-8 text-center">
          <p className="club-kicker">404</p>
          <h1 className="club-display club-d-title mt-3">Event not found</h1>
          <p className="mt-3 text-sm text-[color:var(--cc-muted)]">
            No event exists for code{" "}
            <span className="club-mono text-[color:var(--cc-gold)]">
              {code}
            </span>
            .
          </p>
        </div>
      </main>
    );
  }

  const eventHref = await currentAdminPath(
    `/events/${editableEvent.event.code}`,
  );

  return (
    <main className="club-shell min-h-screen px-5 py-6">
      <section className="club-rise mx-auto grid min-h-[calc(100vh-48px)] w-full max-w-6xl gap-5 lg:grid-cols-[1fr_460px]">
        <div className="club-panel flex flex-col justify-between p-7 lg:p-10">
          <div>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={eventHref}
                className="club-link inline-flex items-center gap-2 text-sm font-medium"
              >
                <ArrowLeft size={16} />
                Back to event
              </Link>
              <Link
                href={eventsHref}
                className="club-link inline-flex items-center gap-2 text-sm font-medium"
              >
                All events
              </Link>
            </div>
            <div className="mt-10">
              <Logo className="w-44" />
            </div>
            <p className="club-kicker mt-8">Edit event</p>
            <h1 className="club-display club-d-hero mt-5 max-w-3xl">
              Revise the room before the vote moves.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[color:var(--cc-muted)]">
              Change the title, prompts, voting format, and option text that
              were entered when this event was created.
            </p>
          </div>

          <div className="mt-10 hidden items-center gap-3 lg:flex">
            <span className="club-rule w-12" />
            <p className="club-eyebrow">
              Event code{" "}
              <span className="club-mono text-[color:var(--cc-gold)]">
                {editableEvent.event.code}
              </span>
            </p>
          </div>
        </div>

        <aside className="club-panel p-6 lg:p-7">
          <div className="mb-6">
            <p className="club-kicker">Event setup</p>
            <h2 className="club-display club-d-title mt-3">Update live loop</h2>
          </div>

          <NewEventForm
            key={editableEvent.event.code}
            eventCode={editableEvent.event.code}
            initialValues={editableEvent.formValues}
          />
        </aside>
      </section>
    </main>
  );
}
