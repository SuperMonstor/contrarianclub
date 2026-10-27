"use client";

import { HandHeart, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { createWhatsAppWelcomeCampaign } from "@/app/admin/whatsapp/actions";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { WelcomePreview } from "@/components/whatsapp/message-preview";
import { PosterUploadField } from "@/components/whatsapp/poster-upload-field";

export function WelcomeForm({ pendingCount }: { pendingCount: number }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [chargesAccepted, setChargesAccepted] = useState(false);

  return (
    <form action={createWhatsAppWelcomeCampaign} className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
      <section className="club-panel self-start p-5 sm:p-7">
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
          Each subscriber gets this once, greeted by first name. Anyone whose earlier
          welcome failed is included again. Send it soon after each import, while
          people still remember signing up.
        </p>
        {pendingCount > 0 ? (
          <>
            <div className="mt-6">
              <PosterUploadField label="Image" name="headerImageUrl" onUploaded={setImageUrl} />
            </div>
            <label className="club-panel-quiet mt-6 flex items-start gap-3 px-4 py-4 text-sm text-[color:var(--cc-muted)]">
              <input
                className="mt-1"
                type="checkbox"
                name="acknowledgeCharges"
                value="yes"
                checked={chargesAccepted}
                onChange={(event) => setChargesAccepted(event.target.checked)}
                aria-label="I understand Meta messaging charges may apply"
              />
              <span>
                I understand Meta messaging charges may apply. This starts sending
                immediately.
              </span>
            </label>
            {imageUrl && chargesAccepted ? (
              <PendingSubmitButton className="club-btn club-btn-primary mt-5 w-full px-5 py-3">
                <HandHeart size={18} />
                Send welcome message
              </PendingSubmitButton>
            ) : (
              <button type="button" disabled className="club-btn club-btn-primary mt-5 w-full px-5 py-3">
                <HandHeart size={18} />
                Send welcome message
              </button>
            )}
          </>
        ) : (
          <p className="club-panel-quiet mt-6 px-4 py-4 text-sm text-[color:var(--cc-muted)]">
            Every active subscriber has been welcomed.
          </p>
        )}
      </section>

      <section className="club-panel-gold self-start p-5 sm:p-7">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-[color:var(--cc-gold)]" />
          <p className="club-kicker">Approved template preview</p>
        </div>
        <div className="mt-5">
          <WelcomePreview imageUrl={imageUrl} />
        </div>
      </section>
    </form>
  );
}
