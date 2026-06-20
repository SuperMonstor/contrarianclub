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
    <main className="salon-stage grid min-h-screen place-items-center px-5 text-[#fff8e8]">
      <div className="salon-panel-dark max-w-sm p-5">
        <h1 className="brand-display text-3xl">Room unavailable</h1>
        <p className="mt-3 text-[#d8cfbd]">Supabase is not configured yet.</p>
      </div>
    </main>
  );
}

function MissingEvent({ code }: { code: string }) {
  return (
    <main className="salon-stage grid min-h-screen place-items-center px-5 text-[#fff8e8]">
      <div className="salon-panel-dark max-w-sm p-5">
        <h1 className="brand-display text-3xl">Room not found</h1>
        <p className="mt-3 text-[#d8cfbd]">
          Check the event code <span className="font-mono">{code}</span>.
        </p>
      </div>
    </main>
  );
}
