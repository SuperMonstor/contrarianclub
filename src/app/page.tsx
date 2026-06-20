import type { ReactNode } from "react";
import Link from "next/link";
import { QrCode, ShieldCheck } from "lucide-react";
import { BrandLockup } from "@/components/brand-lockup";
import { EventCodeEntry } from "@/components/event-code-entry";

export default function Home() {
  return (
    <main className="club-shell min-h-screen">
      <section className="club-rise mx-auto grid min-h-screen w-full max-w-6xl gap-5 px-5 py-6 lg:grid-cols-[1fr_420px]">
        <div className="club-panel flex flex-col justify-between p-7 lg:p-12">
          <div>
            <BrandLockup size="lg" />
            <div className="mt-8 flex items-center gap-3">
              <p className="club-kicker">Live Salon</p>
              <span className="club-rule w-16" />
            </div>
            <h1 className="club-display mt-6 max-w-4xl text-5xl leading-[1.02] sm:text-6xl">
              Enter the event code to join the room.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[color:var(--cc-muted)]">
              Scanned the event QR code? You will skip this screen and go
              straight to the live voting floor.
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            <Feature icon={<QrCode size={20} />} label="QR skips the code" />
            <Feature icon={<ShieldCheck size={20} />} label="Code gates voting" />
          </div>
        </div>

        <aside className="club-panel flex flex-col p-6 lg:p-7">
          <div className="mb-6">
            <p className="club-kicker">Audience entry</p>
            <h2 className="club-display mt-3 text-3xl">Join an event</h2>
          </div>
          <EventCodeEntry />
          <Link
            href="/admin"
            className="club-link mt-auto block pt-6 text-center text-sm font-medium underline underline-offset-4"
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
    <div className="club-tile flex items-center gap-3 px-4 py-4 font-medium text-[color:var(--cc-ivory)]">
      <span className="text-[color:var(--cc-gold)]">{icon}</span>
      {label}
    </div>
  );
}
