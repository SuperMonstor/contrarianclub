import Link from "next/link";
import { Logo } from "@/components/logo";

export default function PrivacyPage() {
  return (
    <main className="club-shell min-h-screen px-5 py-8">
      <article className="club-rise club-panel mx-auto max-w-3xl p-6 sm:p-10">
        <Logo className="w-44" />
        <p className="club-kicker mt-8">Privacy notice</p>
        <h1 className="club-display club-d-hero mt-3">Debate announcements</h1>
        <div className="mt-7 grid gap-6 text-sm leading-7 text-[color:var(--cc-parchment)]">
          <section>
            <h2 className="club-display club-d-item">What we keep</h2>
            <p className="mt-2 text-[color:var(--cc-muted)]">
              Contrarian Club keeps the name, Indian mobile number, and latest
              notification preference supplied through debate registration or
              confirmed directly with the club.
            </p>
          </section>
          <section>
            <h2 className="club-display club-d-item">Why we use it</h2>
            <p className="mt-2 text-[color:var(--cc-muted)]">
              We use this information to send WhatsApp announcements about new
              Contrarian Club debates, ticket availability, and closely related
              event updates. We do not connect this list to live audience votes.
            </p>
          </section>
          <section>
            <h2 className="club-display club-d-item">Your choice</h2>
            <p className="mt-2 text-[color:var(--cc-muted)]">
              Reply STOP, UNSUBSCRIBE, or REMOVE ME to any club WhatsApp message
              to stop future announcements. You can also contact the organizers
              through the contact method on your booking confirmation to request
              access, correction, or deletion.
            </p>
          </section>
          <section>
            <h2 className="club-display club-d-item">Service provider</h2>
            <p className="mt-2 text-[color:var(--cc-muted)]">
              Messages are delivered through Meta&apos;s WhatsApp Business Platform.
              Delivery and read status may be returned to Contrarian Club.
            </p>
          </section>
        </div>
        <Link href="/" className="club-btn mt-8 px-5 py-3">Return to the club</Link>
      </article>
    </main>
  );
}
