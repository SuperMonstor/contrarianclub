"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2 } from "lucide-react";
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
    <main className="brand-stage min-h-screen px-4 py-5 text-[#fff8e8]">
      <section className="mx-auto flex min-h-[calc(100vh-40px)] max-w-md flex-col">
        <header className="brand-frame-dark bg-[#08080d]/75 p-4">
          <p className="brand-kicker text-[#f0d36a]">
            {state.event.code}
          </p>
          <h1 className="brand-display mt-3 text-3xl leading-tight">
            {state.event.title}
          </h1>
          <p className="mt-3 text-sm text-[#d8cfbd]">{statusText}</p>
        </header>

        <div className="brand-frame mt-4 flex-1 bg-[#fff9ed] p-4 text-[#08080d]">
          <label className="block text-sm font-bold" htmlFor="displayName">
            Display name optional
          </label>
          <input
            id="displayName"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            className="brand-input mt-2 w-full px-3 py-3 text-base"
            placeholder="Name or team"
          />

          <div className="mt-6">
            <p className="brand-kicker text-[#7a6a42]">
              Active question
            </p>
            <h2 className="brand-display mt-2 text-3xl leading-tight">
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
                    className={`flex w-full items-center justify-between border px-4 py-4 text-left font-bold transition ${
                      selected
                        ? "border-[#08080d] bg-[#f0d36a]"
                        : "border-[#b9aa89] bg-white"
                    } disabled:opacity-70`}
                  >
                    <span>{option.label}</span>
                    {selected && <Check size={18} />}
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
              className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 border border-[#08080d] bg-[#08080d] px-4 py-3 font-black text-[#fff8e8] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="animate-spin" size={18} />}
              Submit vote
            </button>
          )}

          {message && (
            <p className="mt-4 border border-[#08080d] bg-white px-3 py-3 text-sm font-bold">
              {message}
            </p>
          )}

          {resultsVisible && (
            <div className="mt-6 border-t border-[#cbbd9b] pt-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="brand-display text-2xl">Results</h3>
                <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#7a6a42]">
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
