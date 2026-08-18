"use client";

import { AlertTriangle, LoaderCircle, Play, RotateCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { BatchResult } from "@/lib/whatsapp/server/campaigns";

type Totals = Pick<BatchResult, "sent" | "retryable" | "failed" | "unknown">;

const emptyTotals: Totals = { sent: 0, retryable: 0, failed: 0, unknown: 0 };

function delay(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export function CampaignRunner({
  campaignId,
  autoStart = false,
}: {
  campaignId: string;
  autoStart?: boolean;
}) {
  const runningRef = useRef(false);
  const startedRef = useRef(false);
  const [running, setRunning] = useState(false);
  const [complete, setComplete] = useState(false);
  const [needsReview, setNeedsReview] = useState(false);
  const [totals, setTotals] = useState<Totals>(emptyTotals);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    setRunning(true);
    setComplete(false);
    setNeedsReview(false);
    setError(null);

    try {
      let continueSending = true;
      while (continueSending) {
        const response = await fetch(
          `/api/admin/whatsapp/campaigns/${campaignId}/send-batch`,
          { method: "POST" },
        );
        const body: unknown = await response.json();
        if (!response.ok) {
          const message =
            body && typeof body === "object" && "error" in body && typeof body.error === "string"
              ? body.error
              : "Campaign sending failed.";
          throw new Error(message);
        }
        const batch = body as BatchResult;
        setTotals((current) => ({
          sent: current.sent + batch.sent,
          retryable: current.retryable + batch.retryable,
          failed: current.failed + batch.failed,
          unknown: current.unknown + batch.unknown,
        }));

        if (batch.unknown > 0) {
          setNeedsReview(true);
          continueSending = false;
        } else if (!batch.hasMore || batch.claimed === 0) {
          setComplete(true);
          continueSending = false;
        } else if (batch.retryAfterMs > 0) {
          await delay(batch.retryAfterMs);
        }
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Campaign sending failed.");
    } finally {
      runningRef.current = false;
      setRunning(false);
    }
  }, [campaignId]);

  useEffect(() => {
    if (autoStart && !startedRef.current) {
      startedRef.current = true;
      void run();
    }
  }, [autoStart, run]);

  return (
    <section className="club-panel-gold p-5 sm:p-6" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="club-kicker">Delivery runner</p>
          <h2 className="club-display club-d-card mt-2">
            {running
              ? "Sending in controlled batches"
              : complete
                ? "Campaign queue complete"
                : needsReview
                  ? "Sending paused for review"
                  : "Ready to send"}
          </h2>
        </div>
        <button
          type="button"
          className="club-btn club-btn-primary px-4 py-3"
          disabled={running}
          onClick={() => void run()}
        >
          {running ? (
            <LoaderCircle className="animate-spin" size={18} />
          ) : needsReview || error ? (
            <RotateCw size={18} />
          ) : (
            <Play size={18} />
          )}
          {needsReview || error ? "Resume sending" : "Start sending"}
        </button>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <RunnerStat value={totals.sent} label="accepted by Meta" />
        <RunnerStat value={totals.retryable} label="waiting to retry" />
        <RunnerStat value={totals.failed} label="failed" />
        <RunnerStat value={totals.unknown} label="uncertain outcomes" />
      </div>
      {needsReview ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-[#f0c9c4]">
          <AlertTriangle size={17} />
          {totals.unknown} {totals.unknown === 1 ? "outcome needs" : "outcomes need"} review
        </p>
      ) : null}
      {error ? <p className="mt-4 text-sm text-[#f0c9c4]">{error}</p> : null}
    </section>
  );
}

function RunnerStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="club-tile px-3 py-4">
      <strong className="club-display text-2xl text-[color:var(--cc-gold-bright)]">
        {value}
      </strong>
      <span className="mt-1 block text-xs text-[color:var(--cc-muted)]">
        {value} {label}
      </span>
    </div>
  );
}
