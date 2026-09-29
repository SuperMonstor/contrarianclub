import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Clock3, LockKeyhole } from "lucide-react";
import { Logo } from "@/components/logo";
import { AssetExporter } from "@/components/debate-assets/asset-exporter";
import { currentAdminPath } from "@/lib/admin-routes";
import { getDebateAssets } from "@/lib/debate-assets-server";

export const dynamic = "force-dynamic";

export default async function DebateAssetsPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const assets = await getDebateAssets(code);
  if (!assets) notFound();
  const eventsHref = await currentAdminPath("/");
  const allReady =
    assets.motions.length > 0 && assets.motions.every((motion) => motion.ready);

  return (
    <main className="club-shell min-h-screen px-5 py-6">
      <div className="club-rise mx-auto w-full max-w-6xl">
        <header className="club-panel p-6 sm:p-8">
          <Link href={eventsHref} className="club-link inline-flex items-center gap-2 text-sm font-medium">
            <ArrowLeft size={16} /> Back to events
          </Link>
          <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
            <div>
              <Logo className="w-44" />
              <p className="club-kicker mt-7">The Ledger / Image desk</p>
              <h1 className="club-display club-d-hero mt-3">Generate assets</h1>
              <p className="mt-3 text-[color:var(--cc-parchment)]">
                {assets.event.title} <span className="club-mono text-[color:var(--cc-gold)]">{assets.event.code}</span>
              </p>
            </div>
            <div className="club-panel-quiet flex items-center gap-3 px-4 py-3 text-xs text-[color:var(--cc-muted)]">
              <Clock3 size={16} />
              Vote data read {new Date(assets.readAt).toLocaleString("en-IN")}
            </div>
          </div>
        </header>

        {assets.event.status === "draft" && (
          <p className="club-panel-quiet mt-5 px-5 py-4 text-sm text-[color:var(--cc-parchment)]">
            This event is still a draft. A fresh visit may produce different figures if votes change.
          </p>
        )}

        <section className="mt-6" aria-labelledby="motion-readiness">
          <div className="mb-4 flex items-center justify-between gap-4 px-1">
            <div>
              <p className="club-kicker">The motions</p>
              <h2 id="motion-readiness" className="club-display club-d-card mt-2">
                {assets.motions.length} {assets.motions.length === 1 ? "motion" : "motions"} on record
              </h2>
            </div>
            <span className={`club-chip ${allReady ? "text-[color:var(--cc-gold-bright)]" : ""}`}>
              {allReady ? "Ready to export" : "Waiting for results"}
            </span>
          </div>
          <div className="grid gap-3">
            {assets.motions.length === 0 && (
              <p className="club-panel p-6 text-sm text-[color:var(--cc-muted)]">
                This event has no debate motions to export.
              </p>
            )}
            {assets.motions.map((motion) => (
              <article key={motion.topicId} className="club-panel flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <p className="club-eyebrow">Motion {motion.order}</p>
                  <h3 className="club-display club-d-card mt-2">{motion.motion}</h3>
                  {motion.ready ? (
                    <p className="mt-2 text-sm text-[color:var(--cc-muted)]">
                      {motion.matchedVoters} matched voters, three cards
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-[#f0c9c4]">{motion.reason}</p>
                  )}
                </div>
                {motion.ready ? (
                  <Check size={21} className="text-[color:var(--cc-gold)]" aria-label="Ready" />
                ) : (
                  <LockKeyhole size={20} className="text-[color:var(--cc-muted)]" aria-label="Unavailable" />
                )}
              </article>
            ))}
          </div>
        </section>
        <AssetExporter assets={assets} />
      </div>
    </main>
  );
}
