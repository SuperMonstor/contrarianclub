import type { ReactNode } from "react";
import Link from "next/link";
import { QrCode, ShieldCheck } from "lucide-react";
import { EventCodeEntry } from "@/components/event-code-entry";

export default function Home() {
  return (
    <main className="brand-stage min-h-screen text-[#fff8e8]">
      <section className="mx-auto grid min-h-screen w-full max-w-6xl gap-6 px-5 py-5 lg:grid-cols-[1fr_420px]">
        <div className="brand-frame-dark flex flex-col justify-between bg-[#0b0b10]/82 p-6 lg:p-10">
          <div>
            <p className="brand-kicker text-[#c8a24a]">
              Contrarian Club Live
            </p>
            <h1 className="brand-display mt-5 max-w-4xl text-5xl leading-none sm:text-7xl">
              Enter the event code to join the room.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#d8cfbd]">
              If you scanned the event QR code, you will skip this screen and go
              straight to the live voting room.
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            <Feature icon={<QrCode size={22} />} label="QR skips the code" />
            <Feature icon={<ShieldCheck size={22} />} label="Code gates voting" />
          </div>
        </div>

        <aside className="brand-frame brand-paper p-5 text-[#08080d]">
          <div className="mb-5">
            <p className="brand-kicker text-[#7a6a42]">
              Audience entry
            </p>
            <h2 className="brand-display mt-2 text-3xl">Join an event</h2>
          </div>
          <EventCodeEntry />
          <Link
            href="/admin"
            className="mt-6 block text-center text-sm font-bold text-[#6d5c35] underline underline-offset-4"
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
    <div className="flex items-center gap-3 border border-[#c8a24a]/45 bg-[#fff8e8]/8 px-4 py-4 font-bold text-[#fff8e8]">
      {icon}
      {label}
    </div>
  );
}
