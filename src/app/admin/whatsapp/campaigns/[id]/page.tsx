import Link from "next/link";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { requeueUnknownWhatsAppDelivery } from "@/app/admin/whatsapp/actions";
import { CampaignRunner } from "@/components/whatsapp/campaign-runner";
import { MarketingHeader } from "@/components/whatsapp/marketing-header";
import {
  AnnouncementPreview,
  WelcomePreview,
} from "@/components/whatsapp/message-preview";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { requireAdminUser } from "@/lib/auth";
import { maskIndianPhone } from "@/lib/whatsapp/phone";
import { campaignLabel } from "@/lib/whatsapp/template";
import type { AnnouncementParameters } from "@/lib/whatsapp/types";
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
          title={campaignLabel(campaign.kind, campaign.parameters)}
          description={`${campaign.recipient_count.toLocaleString("en-IN")} recipients were fixed in this campaign snapshot.`}
        />

        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <CampaignStat value={accepted} label="Accepted" />
          <CampaignStat value={counts.delivered + counts.read} label="Delivered" />
          <CampaignStat value={counts.read} label="Read" />
          <CampaignStat value={counts.retryable_failed + counts.queued + counts.sending} label="Pending" />
          <CampaignStat value={counts.failed + counts.unknown} label="Needs attention" />
        </section>
        {counts.skipped ? (
          <p className="mt-3 text-sm text-[color:var(--cc-muted)]">
            {counts.skipped.toLocaleString("en-IN")} skipped because the subscriber opted out before
            their message was sent.
          </p>
        ) : null}

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
            <div className="mt-5">
              <CampaignMessage kind={campaign.kind} parameters={campaign.parameters} />
            </div>
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

function CampaignMessage({
  kind,
  parameters,
}: {
  kind: "announcement" | "welcome";
  parameters: Record<string, unknown>;
}) {
  if (kind === "welcome") {
    const imageUrl = parameters.headerImageUrl;
    return <WelcomePreview imageUrl={typeof imageUrl === "string" ? imageUrl : null} />;
  }
  // Campaigns sent before the current template listed the motions in the text.
  if (Array.isArray(parameters.motions) || typeof parameters.price !== "string") {
    return (
      <p className="text-sm text-[color:var(--cc-muted)]">
        This campaign used an earlier template.
      </p>
    );
  }
  const announcement = parameters as AnnouncementParameters;
  return (
    <>
      <AnnouncementPreview
        debateNumber={announcement.debateNumber}
        inviteOnly={announcement.inviteOnly}
        price={announcement.price}
        location={announcement.location}
        time={announcement.time}
        posterUrl={announcement.posterUrl}
      />
      <Link
        href={announcement.detailsUrl}
        target="_blank"
        rel="noreferrer"
        className="club-btn mt-4 w-full px-4 py-3"
      >
        <ExternalLink size={16} /> Open details link
      </Link>
    </>
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
