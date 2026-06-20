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

function activityVoteKey(code: string, activityId: string) {
  return `contrarianclub:${code}:activity:${activityId}:voted`;
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

  const activityId = activity?.id;

  useEffect(() => {
    let cancelled = false;

    if (!activityId) {
      window.queueMicrotask(() => {
        if (cancelled) return;
        setSelectedOptionId("");
        setHasVoted(false);
        setMessage("");
      });

      return () => {
        cancelled = true;
      };
    }

    const storedVote = window.localStorage.getItem(
      activityVoteKey(code, activityId),
    );

    window.queueMicrotask(() => {
      if (cancelled) return;
      setSelectedOptionId("");
      setHasVoted(storedVote === "true");
      setMessage(storedVote === "true" ? "Vote submitted." : "");
    });

    return () => {
      cancelled = true;
    };
  }, [activityId, code]);

  const canVote = activity?.status === "open" && !hasVoted;
  const resultsVisible = activity?.results_visibility === "revealed";
  const waitingForVoting = activity?.status === "draft";

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
    if (!activity || !selectedOptionId || !deviceId) return;

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
      if (
        response.status === 409 &&
        body.error?.toLowerCase().includes("already voted")
      ) {
        window.localStorage.setItem(activityVoteKey(code, activity.id), "true");
        setHasVoted(true);
        setMessage("Vote submitted.");
        setIsSubmitting(false);
        await refresh();
        return;
      }

      setMessage(body.error ?? "Unable to submit vote.");
      setIsSubmitting(false);
      return;
    }

    window.localStorage.setItem(activityVoteKey(code, activity.id), "true");
    setHasVoted(true);
    setMessage("Vote submitted.");
    setIsSubmitting(false);
    await refresh();
  }

  return (
    <main className="min-h-screen bg-[#10151c] px-4 py-5 text-white">
      <section className="mx-auto flex min-h-[calc(100vh-40px)] max-w-md flex-col">
        <header className="border border-white/15 bg-white/8 p-4">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-amber-200">
            {state.event.code}
          </p>
          <h1 className="mt-3 text-2xl font-black tracking-tight">
            {state.event.title}
          </h1>
          <p className="mt-3 text-sm text-white/60">{statusText}</p>
        </header>

        <div className="mt-4 flex-1 border border-white/15 bg-[#fdfaf1] p-4 text-slate-950">
          <label className="block text-sm font-bold" htmlFor="displayName">
            Display name optional
          </label>
          <input
            id="displayName"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            className="mt-2 w-full border border-slate-950 bg-white px-3 py-3 text-base outline-none focus:bg-amber-100"
            placeholder="Name or team"
          />

          <div className="mt-6">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">
              Active question
            </p>
            <h2 className="mt-2 text-2xl font-black leading-tight">
              {activity?.prompt ?? "Waiting for the first question"}
            </h2>
          </div>

          {activity && (
            <div className="mt-5 space-y-3">
              {waitingForVoting && (
                <p className="border border-slate-950 bg-amber-100 px-4 py-4 text-sm font-bold">
                  Your voting hasn&apos;t opened yet. Please wait for the host to
                  start this vote.
                </p>
              )}
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
                        ? "border-slate-950 bg-amber-200"
                        : "border-slate-300 bg-white"
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
              className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 border border-slate-950 bg-slate-950 px-4 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="animate-spin" size={18} />}
              Submit vote
            </button>
          )}

          {message && (
            <p className="mt-4 border border-slate-950 bg-white px-3 py-3 text-sm font-bold">
              {message}
            </p>
          )}

          {resultsVisible && (
            <div className="mt-6 border-t border-slate-300 pt-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-black">Results</h3>
                <span className="font-mono text-xs uppercase tracking-[0.16em] text-slate-500">
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
