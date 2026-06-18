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
    <main className="grid min-h-screen place-items-center bg-[#10151c] px-8 text-white">
      <div className="border border-white/20 bg-white/10 p-8">
        <h1 className="text-5xl font-black">Supabase missing</h1>
        <p className="mt-4 text-white/65">Configure env vars before showtime.</p>
      </div>
    </main>
  );
}

function MissingEvent({ code }: { code: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#10151c] px-8 text-white">
      <div className="border border-white/20 bg-white/10 p-8">
        <h1 className="text-5xl font-black">Event not found</h1>
        <p className="mt-4 text-white/65">
          No live room exists for <span className="font-mono">{code}</span>.
        </p>
      </div>
    </main>
  );
}
