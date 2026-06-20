"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Logo } from "@/components/logo";
import { ResultBars } from "@/components/result-bars";
import { useLiveEventState } from "@/components/use-live-event-state";
import type { EventState } from "@/lib/types";

type AudienceJoinProps = {
  code: string;
  initialState: EventState;
};

function makeDeviceId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `device-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function AudienceJoin({ code, initialState }: AudienceJoinProps) {
  const { state, refresh } = useLiveEventState(code, initialState);
  const [deviceId, setDeviceId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [selectedOptionId, setSelectedOptionId] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const storageKey = `contrarianclub:${code}:device`;
    const existing = window.localStorage.getItem(storageKey);
    const nextDeviceId = existing ?? makeDeviceId();

    window.localStorage.setItem(storageKey, nextDeviceId);
    window.queueMicrotask(() => setDeviceId(nextDeviceId));
  }, [code]);

  const activity = state.activity;
  const canVote = activity?.status === "open" && !hasVoted;
  const resultsVisible = activity?.results_visibility === "revealed";

  const statusText = useMemo(() => {
    if (!activity) return "Waiting for the host";
    if (activity.status === "draft") return "The poll has not opened yet";
    if (activity.status === "closed" && !resultsVisible) {
      return "Voting is closed. Results are hidden.";
    }
    if (hasVoted && !resultsVisible) return "Vote received";
    if (resultsVisible) return "Results are live";
    return "Voting is open";
  }, [activity, hasVoted, resultsVisible]);

  async function submitVote() {
    if (!selectedOptionId || !deviceId) return;

    setIsSubmitting(true);
    setMessage("");

    const response = await fetch(`/api/events/${code}/vote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        deviceId,
        displayName,
        optionId: selectedOptionId,
      }),
    });

    const body = (await response.json()) as { error?: string };

    if (!response.ok) {
      setMessage(body.error ?? "Unable to submit vote.");
      setIsSubmitting(false);
      return;
    }

    setHasVoted(true);
    setMessage("Vote submitted.");
    setIsSubmitting(false);
    await refresh();
  }

  return (
    <main className="club-shell min-h-screen px-4 py-5">
      <section className="club-rise mx-auto flex min-h-[calc(100vh-40px)] max-w-md flex-col">
        <header className="club-panel p-5">
          <div className="flex items-center justify-between gap-3">
            <Logo className="w-36" />
            <span className="club-chip club-mono">{state.event.code}</span>
          </div>
          <h1 className="club-display mt-4 text-3xl leading-tight">
            {state.event.title}
          </h1>
          <p className="mt-3 flex items-center gap-2 text-sm text-[color:var(--cc-muted)]">
            <span className="club-rule w-6" />
            {statusText}
          </p>
        </header>

        <div className="club-panel mt-4 flex-1 p-5">
          <label className="club-label" htmlFor="displayName">
            Display name optional
          </label>
          <input
            id="displayName"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            className="club-input mt-2 px-3.5 py-3 text-base"
            placeholder="Name or team"
          />

          <div className="mt-6">
            <p className="club-kicker">Active question</p>
            <h2 className="club-display mt-2 text-3xl leading-tight">
              {activity?.prompt ?? "Waiting for the first question"}
            </h2>
          </div>

          {activity && (
            <div className="mt-5 space-y-3">
              {state.options.map((option) => {
                const selected = selectedOptionId === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={!canVote}
                    onClick={() => setSelectedOptionId(option.id)}
                    className={`flex w-full items-center justify-between px-4 py-4 text-left font-semibold transition disabled:opacity-60 ${
                      selected
                        ? "club-panel-gold text-[color:var(--cc-ivory)]"
                        : "club-tile text-[color:var(--cc-parchment)] hover:border-[color:var(--cc-line-strong)]"
                    }`}
                  >
                    <span>{option.label}</span>
                    {selected && (
                      <Check size={18} className="text-[color:var(--cc-gold-bright)]" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {canVote && (
            <button
              type="button"
              disabled={!selectedOptionId || isSubmitting}
              onClick={submitVote}
              className="club-btn club-btn-primary mt-5 w-full px-4 py-3"
            >
              {isSubmitting && <Loader2 className="animate-spin" size={18} />}
              Submit vote
            </button>
          )}

          {message && (
            <p className="club-panel-quiet mt-4 px-3.5 py-3 text-sm font-medium text-[color:var(--cc-parchment)]">
              {message}
            </p>
          )}

          {resultsVisible && (
            <div className="mt-6 border-t border-[color:var(--cc-line)] pt-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="club-display text-2xl">Results</h3>
                <span className="club-mono text-xs uppercase tracking-[0.16em] text-[color:var(--cc-muted)]">
                  {state.totalVotes} votes
                </span>
              </div>
              <ResultBars options={state.options} totalVotes={state.totalVotes} />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
