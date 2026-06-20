import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NewEventForm } from "@/components/new-event-form";
import { currentAdminPath } from "@/lib/admin-routes";
import { requireAdminUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  await requireAdminUser();
  const eventsHref = await currentAdminPath("/");

  return (
    <main className="salon-page min-h-screen px-5 py-5 text-[#08080d]">
      <section className="mx-auto grid min-h-[calc(100vh-40px)] w-full max-w-6xl gap-6 lg:grid-cols-[1fr_440px]">
        <div className="salon-panel flex flex-col justify-between p-6 lg:p-10">
          <div>
            <Link
              href={eventsHref}
              className="inline-flex items-center gap-2 text-sm font-bold underline underline-offset-4"
            >
              <ArrowLeft size={16} />
              Back to events
            </Link>
            <p className="brand-kicker mt-8 text-[#7a6a42]">
              New event
            </p>
            <h1 className="brand-display mt-5 max-w-4xl text-5xl leading-none sm:text-7xl">
              Create the room before showtime.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#4d5561]">
              This creates a preserved event record with one starter poll. More
              activities can layer on under this event later.
            </p>
          </div>
        </div>

        <aside className="salon-panel p-5">
          <div className="mb-5">
            <p className="brand-kicker text-[#7a6a42]">
              Event setup
            </p>
            <h2 className="brand-display mt-2 text-3xl">Start the live loop</h2>
          </div>

          <NewEventForm />
        </aside>
      </section>
    </main>
  );
}
