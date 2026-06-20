import type { ReactNode } from "react";
import Link from "next/link";
import { QrCode, ShieldCheck } from "lucide-react";
import { EventCodeEntry } from "@/components/event-code-entry";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f6f1e7] text-slate-950">
      <section className="mx-auto grid min-h-screen w-full max-w-6xl gap-6 px-5 py-5 lg:grid-cols-[1fr_420px]">
        <div className="flex flex-col justify-between border border-slate-950 bg-[#fdfaf1] p-6 shadow-[8px_8px_0_#111827] lg:p-10">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-slate-500">
              Contrarian Club Live
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-black leading-none tracking-tight sm:text-7xl">
              Enter the event code to join the room.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
              If you scanned the event QR code, you will skip this screen and go
              straight to the live voting room.
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            <Feature icon={<QrCode size={22} />} label="QR skips the code" />
            <Feature icon={<ShieldCheck size={22} />} label="Code gates voting" />
          </div>
        </div>

        <aside className="border border-slate-950 bg-white p-5 shadow-[8px_8px_0_#111827]">
          <div className="mb-5">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">
              Audience entry
            </p>
            <h2 className="mt-2 text-2xl font-black">Join an event</h2>
          </div>
          <EventCodeEntry />
          <Link
            href="/admin"
            className="mt-6 block text-center text-sm font-bold text-slate-500 underline underline-offset-4"
          >
            Admin sign in
          </Link>
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
