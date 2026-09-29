"use client";

import { Download, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AssetCard, type AssetStage } from "./asset-card";
import type { ReadyAssetMotion } from "@/lib/debate-assets";
import type { DebateAssetSet } from "@/lib/debate-assets-server";

const STAGES: AssetStage[] = ["before", "after", "swing"];

function cardName(code: string, motion: ReadyAssetMotion, stage: AssetStage) {
  return `${code}-motion-${String(motion.order).padStart(2, "0")}-${stage}.png`;
}

function CardPreview({
  motion,
  stage,
  onElement,
}: {
  motion: ReadyAssetMotion;
  stage: AssetStage;
  onElement: (element: HTMLDivElement | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / 1600);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative aspect-video w-full overflow-hidden border border-[color:var(--cc-line-strong)] bg-[#0b0907]"
    >
      <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
        <AssetCard motion={motion} stage={stage} elementRef={onElement} />
      </div>
    </div>
  );
}

export function AssetExporter({ assets }: { assets: DebateAssetSet }) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const cards = useRef<Record<string, HTMLDivElement | null>>({});
  const readyMotions = assets.motions.filter(
    (motion): motion is ReadyAssetMotion => motion.ready,
  );
  const canExport =
    assets.motions.length > 0 && readyMotions.length === assets.motions.length;
  const cardCount = readyMotions.length * STAGES.length;

  async function downloadAssets() {
    if (!canExport || busy) return;
    setBusy(true);
    setProgress(0);
    setError("");
    try {
      if (document.fonts) await document.fonts.ready;
      const [{ toBlob }, { default: JSZip }] = await Promise.all([
        import("html-to-image"),
        import("jszip"),
      ]);
      const zip = new JSZip();
      let count = 0;
      for (const motion of readyMotions) {
        for (const stage of STAGES) {
          const name = cardName(assets.event.code, motion, stage);
          const element = cards.current[name];
          if (!element) throw new Error(`The ${stage} card is not ready to capture.`);
          const logo = element.querySelector("img");
          if (logo && !logo.complete && typeof logo.decode === "function") {
            await logo.decode();
          }
          const blob = await toBlob(element, {
            width: 1600,
            height: 900,
            pixelRatio: 2,
            backgroundColor: "#0b0907",
            preferredFontFormat: "woff2",
          });
          if (!blob) throw new Error(`Could not render ${name}.`);
          zip.file(name, blob);
          count += 1;
          setProgress(count);
        }
      }
      const archive = await zip.generateAsync({ type: "blob", compression: "STORE" });
      const url = URL.createObjectURL(archive);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${assets.event.code}-debate-assets.zip`;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not generate the assets.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-7" aria-labelledby="asset-previews">
      <div className="club-panel-gold flex flex-wrap items-center justify-between gap-5 p-5 sm:p-6">
        <div>
          <p className="club-kicker">Export desk</p>
          <h2 id="asset-previews" className="club-display club-d-card mt-2">
            Before. After. The swing.
          </h2>
          <p className="mt-2 text-sm text-[color:var(--cc-muted)]">
            {cardCount} PNG cards at 3200 × 1800, packed into one ZIP.
          </p>
        </div>
        <button
          type="button"
          className="club-btn club-btn-primary px-5 py-3"
          disabled={!canExport || busy}
          onClick={downloadAssets}
        >
          {busy ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
          {busy ? `Generating ${progress} of ${cardCount}` : `Generate and download ${cardCount} PNGs`}
        </button>
        {!canExport && (
          <p className="w-full text-sm text-[#f0c9c4]">
            Finish every motion before exporting the full debate.
          </p>
        )}
        {error && <p role="alert" className="w-full text-sm text-[#f0c9c4]">{error}</p>}
      </div>

      {readyMotions.map((motion) => (
        <div key={motion.topicId} className="mt-8">
          <div className="mb-4 flex items-end gap-4 px-1">
            <span className="club-display text-5xl text-[color:var(--cc-gold)]">
              {String(motion.order).padStart(2, "0")}
            </span>
            <div>
              <p className="club-kicker">Motion {motion.order}</p>
              <h3 className="club-display club-d-card mt-1">{motion.motion}</h3>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {STAGES.map((stage) => {
              const name = cardName(assets.event.code, motion, stage);
              return (
                <div key={name} className="club-panel p-3">
                  <CardPreview
                    motion={motion}
                    stage={stage}
                    onElement={(element) => { cards.current[name] = element; }}
                  />
                  <p className="club-eyebrow px-1 pt-3">{stage === "swing" ? "The swing" : `${stage} the debate`}</p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
