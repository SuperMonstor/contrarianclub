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
    <main className="grid min-h-screen place-items-center bg-[#10151c] px-5 text-white">
      <div className="max-w-sm border border-white/20 bg-white/10 p-5">
        <h1 className="text-2xl font-black">Room unavailable</h1>
        <p className="mt-3 text-white/65">Supabase is not configured yet.</p>
      </div>
    </main>
  );
}

function MissingEvent({ code }: { code: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#10151c] px-5 text-white">
      <div className="max-w-sm border border-white/20 bg-white/10 p-5">
        <h1 className="text-2xl font-black">Room not found</h1>
        <p className="mt-3 text-white/65">
          Check the event code <span className="font-mono">{code}</span>.
        </p>
      </div>
    </main>
  );
}
