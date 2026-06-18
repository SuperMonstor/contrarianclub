import type { ReactNode } from "react";
import { ArrowRight, Monitor, QrCode, ShieldCheck } from "lucide-react";
import { createEvent } from "@/app/actions";
import { hasSupabaseServerEnv } from "@/lib/supabase/server";

export default function Home() {
  const configured = hasSupabaseServerEnv();

  return (
    <main className="min-h-screen bg-[#f6f1e7] text-slate-950">
      <section className="mx-auto grid min-h-screen w-full max-w-7xl gap-6 px-5 py-5 lg:grid-cols-[1fr_440px]">
        <div className="flex flex-col justify-between border border-slate-950 bg-[#fdfaf1] p-6 shadow-[8px_8px_0_#111827] lg:p-10">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-slate-500">
              Phase 1 live slice
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-black leading-none tracking-tight sm:text-7xl">
              A Menti-style room built for debate night.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
              Create one event, launch one multiple-choice poll, let the room
              join by QR code, and control whether results stay hidden or go live
              on the presenter screen.
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <Feature icon={<QrCode size={22} />} label="QR join" />
            <Feature icon={<Monitor size={22} />} label="Projector view" />
            <Feature icon={<ShieldCheck size={22} />} label="Vote constraint" />
          </div>
        </div>

        <aside className="border border-slate-950 bg-white p-5 shadow-[8px_8px_0_#111827]">
          <div className="mb-5">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">
              Create event
            </p>
            <h2 className="mt-2 text-2xl font-black">Start the live loop</h2>
          </div>

          {!configured && (
            <div className="mb-5 border border-amber-500 bg-amber-100 px-4 py-3 text-sm font-bold text-amber-950">
              Supabase env vars are missing. Add `.env.local` from
              `.env.example` before creating an event.
            </div>
          )}

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
              disabled={!configured}
              className="flex min-h-12 w-full items-center justify-center gap-2 border border-slate-950 bg-slate-950 px-4 py-3 font-black text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Create host room
              <ArrowRight size={18} />
            </button>
          </form>
        </aside>
      </section>
    </main>
  );
}

function Feature({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 border border-slate-950 bg-white px-4 py-4 font-bold">
      {icon}
      {label}
    </div>
  );
}
