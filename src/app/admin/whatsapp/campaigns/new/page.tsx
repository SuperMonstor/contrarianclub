import { CampaignForm } from "@/components/whatsapp/campaign-form";
import { MarketingHeader } from "@/components/whatsapp/marketing-header";
import { requireAdminUser } from "@/lib/auth";
import { getDebateOptions } from "@/lib/whatsapp/server/debates";
import { getActiveWhatsAppSubscriberCount } from "@/lib/whatsapp/server/subscribers";

export const dynamic = "force-dynamic";

export default async function NewWhatsAppCampaignPage() {
  await requireAdminUser();
  const [activeSubscriberCount, debates] = await Promise.all([
    getActiveWhatsAppSubscriberCount(),
    getDebateOptions(),
  ]);
  return (
    <main className="club-shell min-h-screen px-5 py-6">
      <div className="club-rise mx-auto w-full max-w-6xl">
        <MarketingHeader
          eyebrow="New dispatch"
          title="Announce a debate"
          description="Pick the debate to fill in its number, add the rest and a poster that shows the motions, review the message, then send it to the entire active list."
        />
        <div className="mt-6">
          <CampaignForm activeSubscriberCount={activeSubscriberCount} debates={debates} />
        </div>
      </div>
    </main>
  );
}
