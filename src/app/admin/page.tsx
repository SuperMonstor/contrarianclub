import Link from "next/link";
import {
  ArrowUpRight,
  CalendarPlus,
  LogOut,
  Monitor,
  Radio,
  Star,
  StarOff,
} from "lucide-react";
import { signOutAdmin, updateDefaultEvent } from "@/app/actions";
import { Logo } from "@/components/logo";
import { adminPath, currentHostname } from "@/lib/admin-routes";
import { requireAdminUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import type { EventSummary } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getAdminEvents(supabase: ReturnType<typeof createServiceClient>) {
  const withDefault = await supabase
    .from("events")
    .select("id, code, title, status, created_at, is_default")
    .order("created_at", { ascending: false })
    .returns<EventSummary[]>();

  if (!withDefault.error) {
    return {
      events: withDefault.data ?? [],
      supportsDefaultEvents: true,
    };
  }

  if (withDefault.error.code !== "42703") {
    throw withDefault.error;
  }

  const withoutDefault = await supabase
    .from("events")
    .select("id, code, title, status, created_at")
    .order("created_at", { ascending: false })
    .returns<EventSummary[]>();

  if (withoutDefault.error) throw withoutDefault.error;

  return {
    events: withoutDefault.data ?? [],
    supportsDefaultEvents: false,
  };
}

export default async function AdminEventsPage() {
  const user = await requireAdminUser();
  const hostname = await currentHostname();
  const supabase = createServiceClient();
  const { events: list, supportsDefaultEvents } = await getAdminEvents(supabase);

  return (
    <main className="club-shell min-h-screen px-5 py-6">
      <section className="club-rise mx-auto w-full max-w-6xl">
        <header className="club-panel flex flex-wrap items-end justify-between gap-6 p-6 sm:p-8">
          <div>
            <Logo className="w-44" />
            <div className="mt-5 flex items-center gap-3">
              <p className="club-kicker">The Ledger</p>
              <span className="club-rule w-16" />
            </div>
            <h1 className="club-display mt-3 text-5xl">Events</h1>
            <p className="mt-3 text-sm text-[color:var(--cc-muted)]">
              Signed in as <span className="text-[color:var(--cc-parchment)]">{user.email}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href={adminPath("/events/new", hostname)}
              className="club-btn club-btn-primary px-4 py-3"
            >
              <CalendarPlus size={18} />
              New event
            </Link>
            <form action={signOutAdmin}>
              <button type="submit" className="club-btn px-4 py-3">
                <LogOut size={18} />
                Sign out
              </button>
            </form>
          </div>
        </header>

        <div className="mt-5 flex items-center justify-between px-1">
          <p className="club-eyebrow">
            {list.length} {list.length === 1 ? "event" : "events"} on record
          </p>
        </div>
        {!supportsDefaultEvents && (
          <div className="club-panel-quiet mt-3 px-4 py-3 text-sm text-[color:var(--cc-parchment)]">
            Default event controls require migration{" "}
            <span className="club-mono text-[color:var(--cc-gold-bright)]">
              006_default_event.sql
            </span>
            .
          </div>
        )}

        <div className="mt-3 grid gap-3.5">
          {list.length === 0 ? (
            <div className="club-panel p-8 text-center">
              <h2 className="club-display text-3xl">No events yet</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[color:var(--cc-muted)]">
                Create the first event to mint a room code, QR link, and
                presenter view.
              </p>
              <Link
                href={adminPath("/events/new", hostname)}
                className="club-btn club-btn-primary mt-6 inline-flex px-5 py-3"
              >
                <CalendarPlus size={18} />
                Create the first event
              </Link>
            </div>
          ) : (
            list.map((event) => (
              <article
                key={event.id}
                className="club-panel group grid gap-4 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[color:var(--cc-line-strong)] md:grid-cols-[1fr_auto] md:items-center"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={adminPath(`/events/${event.code}`, hostname)}
                      className="min-w-0"
                    >
                      <h2 className="club-display truncate text-2xl transition hover:text-[color:var(--cc-gold-bright)] sm:text-3xl">
                        {event.title}
                      </h2>
                    </Link>
                    <StatusBadge status={event.status} />
                    {event.is_default && (
                      <span className="club-chip border-[color:var(--cc-gold)]/50 bg-[color:var(--cc-gold)]/15 text-[color:var(--cc-gold-bright)]">
                        <Star size={13} fill="currentColor" />
                        default
                      </span>
                    )}
                  </div>
                  <p className="club-mono mt-2 text-sm uppercase tracking-[0.22em] text-[color:var(--cc-gold)]">
                    {event.code}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-[color:var(--cc-muted)]">
                  {supportsDefaultEvents ? (
                    <form action={updateDefaultEvent}>
                      <input type="hidden" name="code" value={event.code} />
                      <input
                        type="hidden"
                        name="isDefault"
                        value={event.is_default ? "false" : "true"}
                      />
                      <button
                        type="submit"
                        className={`club-btn min-h-10 px-3 py-2 text-xs ${
                          event.is_default
                            ? "border-[color:var(--cc-line)] text-[color:var(--cc-muted)]"
                            : "club-btn-primary"
                        }`}
                      >
                        {event.is_default ? <StarOff size={15} /> : <Star size={15} />}
                        {event.is_default ? "Unmark default" : "Make default"}
                      </button>
                    </form>
                  ) : null}
                  <Link
                    href={adminPath(`/events/${event.code}`, hostname)}
                    className="club-btn min-h-10 px-3 py-2 text-xs"
                  >
                    <Radio size={16} className="text-[color:var(--cc-gold)]" />
                    Manage
                  </Link>
                  <Link
                    href={`/present/${event.code}`}
                    target="_blank"
                    className="club-btn min-h-10 px-3 py-2 text-xs"
                  >
                    <Monitor size={16} className="text-[color:var(--cc-gold)]" />
                    Present
                  </Link>
                  <ArrowUpRight
                    size={18}
                    className="text-[color:var(--cc-faint)] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[color:var(--cc-gold)]"
                  />
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

function StatusBadge({ status }: { status: EventSummary["status"] }) {
  if (status === "live") {
    return <span className="club-chip club-chip-live club-chip-dot">live</span>;
  }
  const tone = {
    draft: "",
    ended: "border-[color:var(--cc-gold)]/40 bg-[color:var(--cc-gold)]/12 text-[color:var(--cc-gold-bright)]",
    archived: "opacity-70",
  }[status];

  return <span className={`club-chip ${tone}`}>{status}</span>;
}
