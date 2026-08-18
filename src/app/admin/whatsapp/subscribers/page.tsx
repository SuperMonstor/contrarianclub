import { Search } from "lucide-react";
import { MarketingHeader } from "@/components/whatsapp/marketing-header";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { setWhatsAppSubscriberActive } from "@/app/admin/whatsapp/actions";
import { requireAdminUser } from "@/lib/auth";
import { maskIndianPhone } from "@/lib/whatsapp/phone";
import { getWhatsAppSubscribers } from "@/lib/whatsapp/server/subscribers";

export const dynamic = "force-dynamic";

export default async function WhatsAppSubscribersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdminUser();
  const { q = "" } = await searchParams;
  const subscribers = await getWhatsAppSubscribers(q);

  return (
    <main className="club-shell min-h-screen px-5 py-6">
      <div className="club-rise mx-auto w-full max-w-6xl">
        <MarketingHeader
          eyebrow="Master audience"
          title="Subscribers"
          description="Every Indian mobile number appears once. Active subscribers receive the next campaign snapshot."
        />
        <form className="club-panel mt-6 flex gap-3 p-4" method="get">
          <label className="relative flex-1">
            <span className="sr-only">Search subscribers</span>
            <Search className="absolute left-3 top-3 text-[color:var(--cc-faint)]" size={18} />
            <input
              className="club-input py-2.5 pl-10 pr-3"
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search by name or phone"
            />
          </label>
          <button className="club-btn px-4 py-2" type="submit">Search</button>
        </form>

        <section className="club-panel mt-4 overflow-hidden">
          <div className="border-b border-[color:var(--cc-line)] px-5 py-4">
            <p className="club-eyebrow">Showing {subscribers.length} subscribers</p>
          </div>
          <div className="divide-y divide-[color:var(--cc-line)]">
            {subscribers.map((subscriber) => (
              <article
                key={subscriber.id}
                className="grid gap-4 px-5 py-4 md:grid-cols-[1fr_auto_auto] md:items-center"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[color:var(--cc-parchment)]">
                    {subscriber.name ?? "Name not provided"}
                  </p>
                  <p className="club-mono mt-1 text-sm text-[color:var(--cc-muted)]">
                    {maskIndianPhone(subscriber.phone_e164)}
                  </p>
                </div>
                <div className="text-xs text-[color:var(--cc-muted)]">
                  <span className={`club-chip ${subscriber.is_active ? "club-chip-live" : ""}`}>
                    {subscriber.is_active ? "active" : "opted out"}
                  </span>
                  <p className="mt-2 text-right">via {subscriber.preference_source}</p>
                </div>
                <form action={setWhatsAppSubscriberActive} className="flex items-center gap-2">
                  <input type="hidden" name="subscriberId" value={subscriber.id} />
                  <input type="hidden" name="isActive" value={subscriber.is_active ? "false" : "true"} />
                  {!subscriber.is_active ? (
                    <label className="flex items-center gap-2 text-xs text-[color:var(--cc-muted)]">
                      <input type="checkbox" name="confirmOptIn" value="yes" required />
                      New opt-in confirmed
                    </label>
                  ) : null}
                  <PendingSubmitButton
                    className={`club-btn px-3 py-2 text-xs ${subscriber.is_active ? "club-btn-danger" : "club-btn-primary"}`}
                  >
                    {subscriber.is_active ? "Deactivate" : "Reactivate"}
                  </PendingSubmitButton>
                </form>
              </article>
            ))}
            {subscribers.length === 0 ? (
              <p className="px-5 py-12 text-center text-sm text-[color:var(--cc-muted)]">
                No subscribers matched this search.
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
