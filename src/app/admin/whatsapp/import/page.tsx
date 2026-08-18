import { ImportWorkbookForm } from "@/components/whatsapp/import-workbook-form";
import { MarketingHeader } from "@/components/whatsapp/marketing-header";
import { requireAdminUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function WhatsAppImportPage() {
  await requireAdminUser();
  return (
    <main className="club-shell min-h-screen px-5 py-6">
      <div className="club-rise mx-auto w-full max-w-5xl">
        <MarketingHeader
          eyebrow="List maintenance"
          title="Import subscribers"
          description="Add the latest debate guest list. Phone numbers are deduplicated automatically, and the newest Yes or No preference wins."
        />
        <div className="mt-6">
          <ImportWorkbookForm />
        </div>
      </div>
    </main>
  );
}
