import { HostConsole } from "@/components/host-console";
import { requireAdminUser } from "@/lib/auth";
import { getEventState } from "@/lib/event-state";

export const dynamic = "force-dynamic";

export default async function AdminEventPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  await requireAdminUser();
  const { code } = await params;
  const state = await getEventState(code);

  if (!state) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f1e7] px-5">
        <div className="max-w-lg border border-slate-950 bg-white p-6 shadow-[8px_8px_0_#111827]">
          <h1 className="text-2xl font-black">Event not found</h1>
          <p className="mt-3 text-slate-700">
            No event exists for code <span className="font-mono">{code}</span>.
          </p>
        </div>
      </main>
    );
  }

  return <HostConsole code={state.event.code} initialState={state} />;
}
