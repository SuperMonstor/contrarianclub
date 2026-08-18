import Link from "next/link";
import { ArrowUpRight, FileUp, Megaphone, Users } from "lucide-react";
import { MarketingHeader } from "@/components/whatsapp/marketing-header";
import { adminPath, currentHostname } from "@/lib/admin-routes";
import { requireAdminUser } from "@/lib/auth";
import { getWhatsAppOverview } from "@/lib/whatsapp/server/subscribers";

export const dynamic = "force-dynamic";

export default async function WhatsAppMarketingPage() {
  await requireAdminUser();
  const hostname = await currentHostname();
  const overview = await getWhatsAppOverview();

  return (
    <main className="club-shell min-h-screen px-5 py-6">
      <div className="club-rise mx-auto w-full max-w-6xl">
        <MarketingHeader />
        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat value={overview.activeCount} label="Active recipients" />
          <Stat value={overview.inactiveCount} label="Opted out" />
          <Stat value={overview.recentCampaigns.length} label="Recent campaigns" />
          <Link
            href={adminPath("/whatsapp/campaigns/new", hostname)}
            className="club-panel-gold flex min-h-32 flex-col justify-between p-5 transition hover:-translate-y-0.5"
          >
            <Megaphone className="text-[color:var(--cc-gold)]" />
            <span className="flex items-center justify-between font-semibold">
              Announce a debate <ArrowUpRight size={17} />
            </span>
          </Link>
        </section>

        <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.4fr]">
          <section className="club-panel p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="club-kicker">Latest intake</p>
                <h2 className="club-display club-d-card mt-2">Subscriber import</h2>
              </div>
              <FileUp className="text-[color:var(--cc-gold)]" />
            </div>
            {overview.latestImport ? (
              <div className="mt-5">
                <p className="truncate font-medium text-[color:var(--cc-parchment)]">
                  {overview.latestImport.file_name}
                </p>
                <p className="mt-1 text-xs text-[color:var(--cc-muted)]">
                  {new Date(overview.latestImport.created_at).toLocaleString("en-IN")}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <Metric value={overview.latestImport.added_count} label="added" />
                  <Metric value={overview.latestImport.updated_count} label="updated" />
                  <Metric value={overview.latestImport.deactivated_count} label="deactivated" />
                  <Metric value={overview.latestImport.invalid_count} label="invalid" />
                </div>
              </div>
            ) : (
              <p className="mt-5 text-sm leading-6 text-[color:var(--cc-muted)]">
                No workbook has been imported yet. Start with the latest debate guest list.
              </p>
            )}
            <Link
              href={adminPath("/whatsapp/import", hostname)}
              className="club-btn mt-5 w-full px-4 py-3"
            >
              Import Excel
            </Link>
          </section>

          <section className="club-panel p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="club-kicker">Dispatch ledger</p>
                <h2 className="club-display club-d-card mt-2">Recent campaigns</h2>
              </div>
              <Link
                href={adminPath("/whatsapp/subscribers", hostname)}
                className="club-btn px-3 py-2 text-xs"
              >
                <Users size={15} /> Subscriber list
              </Link>
            </div>
            <div className="mt-5 grid gap-2">
              {overview.recentCampaigns.length ? overview.recentCampaigns.map((campaign) => (
                <Link
                  href={adminPath(`/whatsapp/campaigns/${campaign.id}`, hostname)}
                  key={campaign.id}
                  className="club-panel-quiet grid gap-2 px-4 py-3 transition hover:border-[color:var(--cc-line-strong)] sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[color:var(--cc-parchment)]">
                      {campaign.parameters.title ?? "Untitled debate"}
                    </p>
                    <p className="mt-1 text-xs text-[color:var(--cc-muted)]">
                      {campaign.recipient_count} recipients
                    </p>
                  </div>
                  <span className="club-chip">{campaign.status.replace("_", " ")}</span>
                </Link>
              )) : (
                <p className="py-8 text-center text-sm text-[color:var(--cc-muted)]">
                  No campaigns have been created yet.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="club-panel p-5">
      <strong className="club-display text-4xl text-[color:var(--cc-gold-bright)]">
        {value.toLocaleString("en-IN")}
      </strong>
      <span className="club-eyebrow mt-3 block">{label}</span>
    </div>
  );
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div className="club-tile px-3 py-3">
      <strong className="text-[color:var(--cc-gold-bright)]">{value}</strong>
      <span className="ml-2 text-xs text-[color:var(--cc-muted)]">{label}</span>
    </div>
  );
}
