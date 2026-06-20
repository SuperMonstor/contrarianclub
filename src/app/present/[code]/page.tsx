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
    <main className="brand-stage grid min-h-screen place-items-center px-8 text-[#fff8e8]">
      <div className="brand-frame-dark bg-[#08080d]/75 p-8">
        <h1 className="brand-display text-6xl">Supabase missing</h1>
        <p className="mt-4 text-[#d8cfbd]">Configure env vars before showtime.</p>
      </div>
    </main>
  );
}

function MissingEvent({ code }: { code: string }) {
  return (
    <main className="brand-stage grid min-h-screen place-items-center px-8 text-[#fff8e8]">
      <div className="brand-frame-dark bg-[#08080d]/75 p-8">
        <h1 className="brand-display text-6xl">Event not found</h1>
        <p className="mt-4 text-[#d8cfbd]">
          No live room exists for <span className="font-mono">{code}</span>.
        </p>
      </div>
    </main>
  );
}
