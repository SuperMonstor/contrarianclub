import Link from "next/link";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { requeueUnknownWhatsAppDelivery } from "@/app/admin/whatsapp/actions";
import { CampaignRunner } from "@/components/whatsapp/campaign-runner";
import { MarketingHeader } from "@/components/whatsapp/marketing-header";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { requireAdminUser } from "@/lib/auth";
import { maskIndianPhone } from "@/lib/whatsapp/phone";
import {
  canRetryUnknownDelivery,
  getCampaignDetail,
} from "@/lib/whatsapp/server/campaigns";

export const dynamic = "force-dynamic";

export default async function WhatsAppCampaignPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ send?: string }>;
}) {
  await requireAdminUser();
  const { id } = await params;
  const { send } = await searchParams;
  const detail = await getCampaignDetail(id);
  if (!detail) notFound();
  const { campaign, counts, unknownDeliveries } = detail;
  const accepted = counts.sent + counts.delivered + counts.read;

  return (
    <main className="club-shell min-h-screen px-5 py-6">
      <div className="club-rise mx-auto w-full max-w-6xl">
        <MarketingHeader
          eyebrow="Campaign ledger"
          title={campaign.parameters.title}
          description={`${campaign.recipient_count.toLocaleString("en-IN")} recipients were fixed in this campaign snapshot.`}
        />

        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <CampaignStat value={accepted} label="Accepted" />
          <CampaignStat value={counts.delivered + counts.read} label="Delivered" />
          <CampaignStat value={counts.read} label="Read" />
          <CampaignStat value={counts.retryable_failed + counts.queued} label="Pending" />
          <CampaignStat value={counts.failed + counts.unknown} label="Needs attention" />
        </section>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
          <CampaignRunner campaignId={campaign.id} autoStart={send === "1"} />
          <section className="club-panel p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="club-kicker">Message</p>
                <h2 className="club-display club-d-card mt-2">Approved template</h2>
              </div>
              <span className="club-chip">{campaign.status.replace("_", " ")}</span>
            </div>
            <div className="mt-5 rounded-sm border border-[color:var(--cc-line)] bg-[#efe6d1] px-5 py-5 text-sm leading-6 text-[#201a12]">
              <p>Hi there, bookings are open for the next Contrarian Club debate.</p>
              <p className="mt-4 font-semibold">{campaign.parameters.title}</p>
              <p className="mt-4">
                {campaign.parameters.date} at {campaign.parameters.time}<br />
                {campaign.parameters.venue}
              </p>
              <p className="mt-4 break-all">
                Book your seat: {campaign.parameters.ticketUrl}
              </p>
              <p className="mt-4 text-[#655741]">
                Reply STOP to stop receiving debate announcements.
              </p>
            </div>
            <Link
              href={campaign.parameters.ticketUrl}
              target="_blank"
              rel="noreferrer"
              className="club-btn mt-4 w-full px-4 py-3"
            >
              <ExternalLink size={16} /> Open ticket link
            </Link>
          </section>
        </div>

        {unknownDeliveries.length ? (
          <section className="club-panel mt-5 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 text-[color:var(--cc-wine-bright)]" />
              <div>
                <p className="club-kicker">Unknown outcomes</p>
                <h2 className="club-display club-d-card mt-2">Review before retrying</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--cc-muted)]">
                  Meta may have accepted these messages even though the response was lost.
                  Retrying could send a duplicate announcement.
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-2">
              {unknownDeliveries.map((delivery) => (
                <article
                  className="club-panel-quiet grid gap-3 px-4 py-4 md:grid-cols-[1fr_auto] md:items-center"
                  key={delivery.id}
                >
                  <div>
                    <p className="font-semibold text-[color:var(--cc-parchment)]">
                      {delivery.recipient_name ?? "Name not provided"}
                    </p>
                    <p className="club-mono mt-1 text-xs text-[color:var(--cc-muted)]">
                      {maskIndianPhone(delivery.recipient_phone)}. Attempt {delivery.attempt_count} of 3
                    </p>
                  </div>
                  {canRetryUnknownDelivery(delivery.attempt_count) ? (
                    <form action={requeueUnknownWhatsAppDelivery} className="flex flex-wrap items-center gap-3">
                      <input type="hidden" name="deliveryId" value={delivery.id} />
                      <label className="flex items-center gap-2 text-xs text-[color:var(--cc-muted)]">
                        <input type="checkbox" name="acknowledgeDuplicateRisk" value="yes" required />
                        I accept the duplicate risk
                      </label>
                      <PendingSubmitButton className="club-btn club-btn-danger px-3 py-2 text-xs">
                        Retry message
                      </PendingSubmitButton>
                    </form>
                  ) : (
                    <span className="club-chip border-[color:var(--cc-wine-bright)]/40 text-[#f0c9c4]">
                      attempt limit reached
                    </span>
                  )}
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

function CampaignStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="club-panel p-4">
      <strong className="club-display text-3xl text-[color:var(--cc-gold-bright)]">
        {value.toLocaleString("en-IN")}
      </strong>
      <span className="club-eyebrow mt-2 block">{label}</span>
    </div>
  );
}
