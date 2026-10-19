import { HandHeart, ShieldCheck } from "lucide-react";
import { createWhatsAppWelcomeCampaign } from "@/app/admin/whatsapp/actions";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { MarketingHeader } from "@/components/whatsapp/marketing-header";
import { WelcomePreview } from "@/components/whatsapp/message-preview";
import { requireAdminUser } from "@/lib/auth";
import { getPendingWelcomeCount } from "@/lib/whatsapp/server/campaigns";

export const dynamic = "force-dynamic";

export default async function WhatsAppWelcomePage() {
  await requireAdminUser();
  const pendingCount = await getPendingWelcomeCount();

  return (
    <main className="club-shell min-h-screen px-5 py-6">
      <div className="club-rise mx-auto w-full max-w-6xl">
        <MarketingHeader
          eyebrow="First contact"
          title="Welcome new subscribers"
          description="Send the one-time welcome message to every active subscriber who has not received it yet, so the first message from this number explains what it is for."
        />
        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <form action={createWhatsAppWelcomeCampaign} className="club-panel self-start p-5 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="club-kicker">Welcome message</p>
                <h2 className="club-display club-d-card mt-2">Not yet welcomed</h2>
              </div>
              <span className="club-chip club-chip-live">
                {pendingCount.toLocaleString("en-IN")} recipients
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-[color:var(--cc-muted)]">
              Each subscriber gets this once. Anyone whose earlier welcome failed is
              included again. Send it soon after each import, while people still
              remember signing up.
            </p>
            {pendingCount > 0 ? (
              <>
                <label className="club-panel-quiet mt-6 flex items-start gap-3 px-4 py-4 text-sm text-[color:var(--cc-muted)]">
                  <input
                    className="mt-1"
                    type="checkbox"
                    name="acknowledgeCharges"
                    value="yes"
                    required
                    aria-label="I understand Meta messaging charges may apply"
                  />
                  <span>
                    I understand Meta messaging charges may apply. This starts
                    sending immediately.
                  </span>
                </label>
                <PendingSubmitButton className="club-btn club-btn-primary mt-5 w-full px-5 py-3">
                  <HandHeart size={18} />
                  Send welcome message
                </PendingSubmitButton>
              </>
            ) : (
              <p className="club-panel-quiet mt-6 px-4 py-4 text-sm text-[color:var(--cc-muted)]">
                Every active subscriber has been welcomed.
              </p>
            )}
          </form>

          <section className="club-panel-gold self-start p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-[color:var(--cc-gold)]" />
              <p className="club-kicker">Approved template preview</p>
            </div>
            <div className="mt-5">
              <WelcomePreview />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
