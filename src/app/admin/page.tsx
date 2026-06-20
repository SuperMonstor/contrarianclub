import Link from "next/link";
import { CalendarPlus, LogOut, Monitor, Radio } from "lucide-react";
import { signOutAdmin } from "@/app/actions";
import { adminPath, currentHostname } from "@/lib/admin-routes";
import { requireAdminUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import type { EventSummary } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const user = await requireAdminUser();
  const hostname = await currentHostname();
  const supabase = createServiceClient();
  const { data: events, error } = await supabase
    .from("events")
    .select("id, code, title, status, created_at")
    .order("created_at", { ascending: false })
    .returns<EventSummary[]>();

  if (error) throw error;

  return (
    <main className="min-h-screen bg-[#f3ead8] px-5 py-5 text-[#08080d]">
      <section className="mx-auto w-full max-w-6xl">
        <header className="brand-frame brand-paper flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <p className="brand-kicker text-[#7a6a42]">
              Admin events
            </p>
            <h1 className="brand-display mt-2 text-5xl">Events</h1>
            <p className="mt-2 text-sm text-[#4d5561]">{user.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={adminPath("/events/new", hostname)}
              className="flex min-h-11 items-center gap-2 border border-[#08080d] bg-[#08080d] px-4 py-3 font-bold text-[#fff8e8]"
            >
              <CalendarPlus size={18} />
              New event
            </Link>
            <form action={signOutAdmin}>
              <button
                type="submit"
                className="flex min-h-11 items-center gap-2 border border-[#08080d] bg-[#fff9ed] px-4 py-3 font-bold"
              >
                <LogOut size={18} />
                Sign out
              </button>
            </form>
          </div>
        </header>

        <div className="mt-6 grid gap-4">
          {(events ?? []).length === 0 ? (
            <div className="brand-frame bg-[#fff9ed] p-6">
              <h2 className="brand-display text-3xl">No events yet</h2>
              <p className="mt-2 text-[#4d5561]">
                Create the first event to get a room code, QR link, and presenter
                view.
              </p>
            </div>
          ) : (
            events?.map((event) => (
              <Link
                href={adminPath(`/events/${event.code}`, hostname)}
                key={event.id}
                className="grid gap-4 border border-[#08080d] bg-[#fff9ed] p-5 shadow-[0_16px_36px_rgba(8,8,13,0.12)] transition hover:-translate-y-0.5 md:grid-cols-[1fr_auto]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="brand-display text-3xl">{event.title}</h2>
                    <StatusBadge status={event.status} />
                  </div>
                  <p className="mt-2 font-mono text-sm uppercase tracking-[0.16em] text-[#7a6a42]">
                    {event.code}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm font-bold text-[#4d5561]">
                  <span className="flex items-center gap-2">
                    <Radio size={16} />
                    Manage
                  </span>
                  <span className="flex items-center gap-2">
                    <Monitor size={16} />
                    Present
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

function StatusBadge({ status }: { status: EventSummary["status"] }) {
  const tone = {
    draft: "bg-[#f3ead8] text-[#4d5561]",
    live: "bg-[#f0d36a] text-[#08080d]",
    ended: "bg-[#c8a24a] text-[#08080d]",
    archived: "bg-[#1e2a35] text-[#fff8e8]",
  }[status];

  return (
    <span
      className={`border border-[#08080d] px-2 py-1 font-mono text-xs uppercase tracking-[0.16em] ${tone}`}
    >
      {status}
    </span>
  );
}
