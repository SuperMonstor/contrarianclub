import { redirect } from "next/navigation";
import { EventCodeEntry } from "@/components/event-code-entry";
import { Logo } from "@/components/logo";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getDefaultEventCode() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("events")
    .select("code")
    .eq("is_default", true)
    .maybeSingle<{ code: string }>();

  if (!error) return data?.code ?? null;

  if (error.code === "42703") {
    return null;
  }

  throw error;
}

export default async function Home() {
  const defaultCode = await getDefaultEventCode();

  if (defaultCode) {
    redirect(`/join/${defaultCode}`);
  }

  return (
    <main className="club-shell flex min-h-screen items-center justify-center px-5 py-10">
      <section className="club-panel club-rise w-full min-w-0 max-w-lg p-8 sm:p-10">
        <div className="flex flex-col items-center text-center">
          <Logo variant="center" className="w-56 sm:w-64" />
          <div className="club-rule my-7 w-full" />
          <p className="club-kicker">Live Salon</p>
          <h1 className="club-display club-d-title mt-4">
            Enter the event code to join the room.
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-7 text-[color:var(--cc-muted)]">
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
