import { HostConsole } from "@/components/host-console";
import { currentAdminPath } from "@/lib/admin-routes";
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
  const editHref = await currentAdminPath(
    `/events/${state?.event.code ?? code}/edit`,
  );

  if (!state) {
    return (
      <main className="club-shell flex min-h-screen items-center justify-center px-5">
        <div className="club-panel club-rise max-w-lg p-8 text-center">
          <p className="club-kicker">404</p>
          <h1 className="club-display club-d-title mt-3">Event not found</h1>
          <p className="mt-3 text-sm text-[color:var(--cc-muted)]">
            No event exists for code{" "}
            <span className="club-mono text-[color:var(--cc-gold)]">{code}</span>.
          </p>
        </div>
      </main>
    );
  }

  return (
    <HostConsole
      code={state.event.code}
      editHref={editHref}
      initialState={state}
    />
  );
}
