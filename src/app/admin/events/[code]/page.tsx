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
      <main className="grid min-h-screen place-items-center bg-[#f3ead8] px-5">
        <div className="brand-frame brand-paper max-w-lg p-6">
          <h1 className="brand-display text-3xl">Event not found</h1>
          <p className="mt-3 text-[#4d5561]">
            No event exists for code <span className="font-mono">{code}</span>.
          </p>
        </div>
      </main>
    );
  }

  return <HostConsole code={state.event.code} initialState={state} />;
}
