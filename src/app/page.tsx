import { EventCodeEntry } from "@/components/event-code-entry";
import { Logo } from "@/components/logo";

export default function Home() {
  return (
    <main className="club-shell grid min-h-screen place-items-center px-5 py-10">
      <section className="club-panel club-rise w-full max-w-lg p-8 sm:p-10">
        <div className="flex flex-col items-center text-center">
          <Logo className="w-60 sm:w-72" />
          <div className="club-rule my-7 w-full" />
          <p className="club-kicker">Live Salon</p>
          <h1 className="club-display mt-4 text-4xl leading-[1.06]">
            Enter the event code to join the room.
          </h1>
          <p className="mt-4 max-w-sm text-[15px] leading-7 text-[color:var(--cc-muted)]">
            Scanned the event QR code? You&rsquo;ll skip this screen and go
            straight to the live voting floor.
          </p>
        </div>
        <div className="mt-8">
          <EventCodeEntry />
        </div>
      </section>
    </main>
  );
}
