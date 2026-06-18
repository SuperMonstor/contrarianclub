import Link from "next/link";
import { HostConsole } from "@/components/host-console";
import { getEventState } from "@/lib/event-state";
import { hasSupabaseServerEnv } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HostPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  if (!hasSupabaseServerEnv()) {
    return <SetupMissing />;
  }

  const state = await getEventState(code);

  if (!state) {
    return <NotFound code={code} />;
  }

  return <HostConsole code={state.event.code} initialState={state} />;
}

function SetupMissing() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f1e7] px-5">
      <div className="max-w-lg border border-slate-950 bg-white p-6 shadow-[8px_8px_0_#111827]">
        <h1 className="text-2xl font-black">Supabase is not configured</h1>
        <p className="mt-3 text-slate-700">
          Add `.env.local` from `.env.example`, run the SQL migration, then
          reload this page.
        </p>
      </div>
    </main>
  );
}

function NotFound({ code }: { code: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f1e7] px-5">
      <div className="max-w-lg border border-slate-950 bg-white p-6 shadow-[8px_8px_0_#111827]">
        <h1 className="text-2xl font-black">Event not found</h1>
        <p className="mt-3 text-slate-700">
          No event exists for code <span className="font-mono">{code}</span>.
        </p>
        <Link className="mt-5 inline-block font-bold underline" href="/">
          Create a new event
        </Link>
      </div>
    </main>
  );
}
