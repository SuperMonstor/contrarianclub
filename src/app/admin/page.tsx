import Link from "next/link";
import { CalendarPlus, LogOut, Monitor, Radio } from "lucide-react";
import { signOutAdmin } from "@/app/actions";
import { requireAdminUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import type { EventSummary } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const user = await requireAdminUser();
  const supabase = createServiceClient();
  const { data: events, error } = await supabase
    .from("events")
    .select("id, code, title, status, created_at")
    .order("created_at", { ascending: false })
    .returns<EventSummary[]>();

  if (error) throw error;

  return (
    <main className="min-h-screen bg-[#f6f1e7] px-5 py-5 text-slate-950">
      <section className="mx-auto w-full max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border border-slate-950 bg-[#fdfaf1] p-5 shadow-[8px_8px_0_#111827]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">
              Admin events
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">Events</h1>
            <p className="mt-2 text-sm text-slate-600">{user.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="events/new"
              className="flex min-h-11 items-center gap-2 border border-slate-950 bg-slate-950 px-4 py-3 font-bold text-white"
            >
              <CalendarPlus size={18} />
              New event
            </Link>
            <form action={signOutAdmin}>
              <button
                type="submit"
                className="flex min-h-11 items-center gap-2 border border-slate-950 bg-white px-4 py-3 font-bold"
              >
                <LogOut size={18} />
                Sign out
              </button>
            </form>
          </div>
        </header>

        <div className="mt-6 grid gap-4">
          {(events ?? []).length === 0 ? (
            <div className="border border-slate-950 bg-white p-6 shadow-[8px_8px_0_#111827]">
              <h2 className="text-2xl font-black">No events yet</h2>
              <p className="mt-2 text-slate-600">
                Create the first event to get a room code, QR link, and presenter
                view.
              </p>
            </div>
          ) : (
            events?.map((event) => (
              <Link
                href={`events/${event.code}`}
                key={event.id}
                className="grid gap-4 border border-slate-950 bg-white p-5 shadow-[6px_6px_0_#111827] transition hover:-translate-y-0.5 md:grid-cols-[1fr_auto]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-black">{event.title}</h2>
                    <StatusBadge status={event.status} />
                  </div>
                  <p className="mt-2 font-mono text-sm uppercase tracking-[0.16em] text-slate-500">
                    {event.code}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm font-bold text-slate-600">
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
    draft: "bg-slate-100 text-slate-700",
    live: "bg-emerald-200 text-emerald-950",
    ended: "bg-amber-200 text-amber-950",
    archived: "bg-slate-800 text-white",
  }[status];

  return (
    <span
      className={`border border-slate-950 px-2 py-1 font-mono text-xs uppercase tracking-[0.16em] ${tone}`}
    >
      {status}
    </span>
  );
}
