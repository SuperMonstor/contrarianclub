import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";
import { NewEventForm } from "@/components/new-event-form";
import { currentAdminPath } from "@/lib/admin-routes";
import { requireAdminUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  await requireAdminUser();
  const eventsHref = await currentAdminPath("/");

  return (
    <main className="club-shell min-h-screen px-5 py-6">
      <section className="club-rise mx-auto grid min-h-[calc(100vh-48px)] w-full max-w-6xl gap-5 lg:grid-cols-[1fr_460px]">
        <div className="club-panel flex flex-col justify-between p-7 lg:p-10">
          <div>
            <Link href={eventsHref} className="club-link inline-flex items-center gap-2 text-sm font-medium">
              <ArrowLeft size={16} />
              Back to events
            </Link>
            <div className="mt-10">
              <Logo className="w-44" />
            </div>
            <p className="club-kicker mt-8">New event</p>
            <h1 className="club-display mt-5 max-w-3xl text-5xl leading-[1.04] sm:text-6xl">
              Set the motion before the house arrives.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[color:var(--cc-muted)]">
              This mints a preserved event record with one starter poll. More
              activities can layer on under this event later.
            </p>
          </div>

          <div className="mt-10 hidden items-center gap-3 lg:flex">
            <span className="club-rule w-12" />
            <p className="club-eyebrow">Pre-debate &middot; Debate &middot; Post-debate</p>
          </div>
        </div>

        <aside className="club-panel p-6 lg:p-7">
          <div className="mb-6">
            <p className="club-kicker">Event setup</p>
            <h2 className="club-display mt-3 text-3xl">Start the live loop</h2>
          </div>

          <NewEventForm />
        </aside>
      </section>
    </main>
  );
}
