import { PresenterDisplay } from "@/components/presenter-display";
import { getEventState } from "@/lib/event-state";
import { hasSupabaseServerEnv } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PresentPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  if (!hasSupabaseServerEnv()) {
    return <MissingSetup />;
  }

  const state = await getEventState(code);

  if (!state) {
    return <MissingEvent code={code} />;
  }

  return <PresenterDisplay code={state.event.code} initialState={state} />;
}

function MissingSetup() {
  return (
    <main className="club-shell grid min-h-screen place-items-center px-8">
      <div className="club-panel club-rise p-10 text-center">
        <h1 className="club-display text-6xl">Supabase missing</h1>
        <p className="mt-4 text-[color:var(--cc-muted)]">
          Configure env vars before showtime.
        </p>
      </div>
    </main>
  );
}

function MissingEvent({ code }: { code: string }) {
  return (
    <main className="club-shell grid min-h-screen place-items-center px-8">
      <div className="club-panel club-rise p-10 text-center">
        <h1 className="club-display text-6xl">Event not found</h1>
        <p className="mt-4 text-[color:var(--cc-muted)]">
          No live room exists for{" "}
          <span className="club-mono text-[color:var(--cc-gold)]">{code}</span>.
        </p>
      </div>
    </main>
  );
}
