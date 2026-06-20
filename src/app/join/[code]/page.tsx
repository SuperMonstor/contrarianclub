import { AudienceJoin } from "@/components/audience-join";
import { getEventState } from "@/lib/event-state";
import { hasSupabaseServerEnv } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function JoinPage({
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

  return <AudienceJoin code={state.event.code} initialState={state} />;
}

function MissingSetup() {
  return (
    <main className="club-shell grid min-h-screen place-items-center px-5">
      <div className="club-panel club-rise max-w-sm p-6 text-center">
        <h1 className="club-display text-3xl">Room unavailable</h1>
        <p className="mt-3 text-sm text-[color:var(--cc-muted)]">
          Supabase is not configured yet.
        </p>
      </div>
    </main>
  );
}

function MissingEvent({ code }: { code: string }) {
  return (
    <main className="club-shell grid min-h-screen place-items-center px-5">
      <div className="club-panel club-rise max-w-sm p-6 text-center">
        <h1 className="club-display text-3xl">Room not found</h1>
        <p className="mt-3 text-sm text-[color:var(--cc-muted)]">
          Check the event code{" "}
          <span className="club-mono text-[color:var(--cc-gold)]">{code}</span>.
        </p>
      </div>
    </main>
  );
}
