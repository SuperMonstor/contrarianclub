import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { createEvent } from "@/app/actions";
import { requireAdminUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  await requireAdminUser();

  return (
    <main className="min-h-screen bg-[#f6f1e7] px-5 py-5 text-slate-950">
      <section className="mx-auto grid min-h-[calc(100vh-40px)] w-full max-w-6xl gap-6 lg:grid-cols-[1fr_440px]">
        <div className="flex flex-col justify-between border border-slate-950 bg-[#fdfaf1] p-6 shadow-[8px_8px_0_#111827] lg:p-10">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-sm font-bold underline underline-offset-4"
            >
              <ArrowLeft size={16} />
              Back to events
            </Link>
            <p className="mt-8 font-mono text-xs uppercase tracking-[0.24em] text-slate-500">
              New event
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-black leading-none tracking-tight sm:text-7xl">
              Create the room before showtime.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
              This creates a preserved event record with one starter poll. More
              activities can layer on under this event later.
            </p>
          </div>
        </div>

        <aside className="border border-slate-950 bg-white p-5 shadow-[8px_8px_0_#111827]">
          <div className="mb-5">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">
              Event setup
            </p>
            <h2 className="mt-2 text-2xl font-black">Start the live loop</h2>
          </div>

          <form action={createEvent} className="space-y-4">
            <div>
              <label className="text-sm font-bold" htmlFor="title">
                Event title
              </label>
              <input
                id="title"
                name="title"
                required
                defaultValue="Contrarian Club Debate"
                className="mt-2 w-full border border-slate-950 bg-[#fdfaf1] px-3 py-3 outline-none focus:bg-amber-100"
              />
            </div>

            <div>
              <label className="text-sm font-bold" htmlFor="prompt">
                First poll question
              </label>
              <textarea
                id="prompt"
                name="prompt"
                required
                rows={3}
                defaultValue="Which side made the stronger opening case?"
                className="mt-2 w-full resize-none border border-slate-950 bg-[#fdfaf1] px-3 py-3 outline-none focus:bg-amber-100"
              />
            </div>

            <div>
              <label className="text-sm font-bold" htmlFor="options">
                Options one per line
              </label>
              <textarea
                id="options"
                name="options"
                required
                rows={5}
                defaultValue={"Proposition\nOpposition\nToo close to call"}
                className="mt-2 w-full resize-none border border-slate-950 bg-[#fdfaf1] px-3 py-3 outline-none focus:bg-amber-100"
              />
            </div>

            <button
              type="submit"
              className="flex min-h-12 w-full items-center justify-center gap-2 border border-slate-950 bg-slate-950 px-4 py-3 font-black text-white transition hover:-translate-y-0.5"
            >
              Create event
              <ArrowRight size={18} />
            </button>
          </form>
        </aside>
      </section>
    </main>
  );
}
