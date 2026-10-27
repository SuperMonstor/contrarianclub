import { MarketingHeader } from "@/components/whatsapp/marketing-header";
import { WelcomeForm } from "@/components/whatsapp/welcome-form";
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
        <div className="mt-6">
          <WelcomeForm pendingCount={pendingCount} />
        </div>
      </div>
    </main>
  );
}
