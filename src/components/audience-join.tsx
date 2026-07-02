"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Logo } from "@/components/logo";
import { ResultBars } from "@/components/result-bars";
import { ScaleChoiceScale } from "@/components/scale-choice-scale";
import { ScaleResults } from "@/components/scale-results";
import { useLiveEventState } from "@/components/use-live-event-state";
import { createBrowserClient } from "@/lib/supabase/browser";
import type { EventState } from "@/lib/types";

type AudienceJoinProps = {
  code: string;
  initialState: EventState;
};

function activityVoteKey(code: string, activityId: string) {
  return `contrarianclub:${code}:activity:${activityId}:voted`;
}

// Maps the machine-readable reason a cast_vote failure raises onto copy for the
// voter. Unknown reasons fall through to a generic message.
function voteErrorMessage(reason: string) {
  if (reason.includes("poll_not_open")) return "This poll is not open.";
  if (reason.includes("invalid_option")) {
    return "That option is not part of this poll.";
  }
  if (reason.includes("event_not_active")) return "This event has ended.";
  if (reason.includes("invalid_token") || reason.includes("activity_not_found")) {
    return "Please refresh the page and try again.";
  }
  return "Unable to submit vote.";
}

export function AudienceJoin({ code, initialState }: AudienceJoinProps) {
  const { state, refresh } = useLiveEventState(code, initialState);
  const [voteToken, setVoteToken] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [selectedOptionId, setSelectedOptionId] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // Reuse a previously-minted token so a device keeps one identity across
  // reloads; only mint on first join. The device id lives inside the token,
  // assigned by the server.
  useEffect(() => {
    const storageKey = `contrarianclub:${code}:token`;
    const existing = window.localStorage.getItem(storageKey);

    if (existing) {
      window.queueMicrotask(() => setVoteToken(existing));
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch(`/api/events/${code}/token`, {
          method: "POST",
        });

        if (!response.ok) return;

        const body = (await response.json()) as { token?: string };
        if (!body.token || cancelled) return;

        window.localStorage.setItem(storageKey, body.token);
        setVoteToken(body.token);
      } catch {
        // Non-fatal: the submit button stays disabled until a token arrives.
      }
    })();

    return () => {
      cancelled = true;
    };
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

  useEffect(() => {
    if (!activityId || state.totalVotes !== 0) {
      return;
    }

    const key = activityVoteKey(code, activityId);
    const storedVote = window.localStorage.getItem(key);
    if (storedVote !== "true") return;

    let cancelled = false;
    window.localStorage.removeItem(key);
    window.queueMicrotask(() => {
      if (cancelled) return;
      setSelectedOptionId("");
      setHasVoted(false);
      setMessage("");
    });

    return () => {
      cancelled = true;
    };
  }, [activityId, code, state.totalVotes]);

  const canVote = activity?.status === "open" && !hasVoted;
  const resultsVisible = activity?.results_visibility === "revealed";
  const waitingForVoting = activity?.status === "draft";
  const isScale = activity?.type === "scale";

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
    if (!activity || !selectedOptionId || !voteToken) return;

    const supabase = createBrowserClient();
    if (!supabase) {
      setMessage("Voting is unavailable right now.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const { error } = await supabase.rpc("cast_vote", {
        p_token: voteToken,
        p_activity_id: activity.id,
        p_option_id: selectedOptionId,
        p_display_name: displayName || null,
      });

      if (error) {
        // A duplicate vote is a success from the voter's point of view — record
        // it locally so the UI settles into the "voted" state.
        if (error.message.includes("already_voted")) {
          window.localStorage.setItem(
            activityVoteKey(code, activity.id),
            "true",
          );
          setHasVoted(true);
          setMessage("Vote submitted.");
          await refresh();
          return;
        }

        setMessage(voteErrorMessage(error.message));
        return;
      }

      window.localStorage.setItem(activityVoteKey(code, activity.id), "true");
      setHasVoted(true);
      setMessage("Vote submitted.");
      await refresh();
    } catch {
      setMessage(
        "Couldn't reach the room. Check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="club-shell min-h-screen px-4 py-5">
      <section className="club-rise mx-auto flex w-full max-w-md flex-col">
        <header className="club-panel p-5">
          <div className="flex items-center justify-between gap-3">
            <Logo className="w-32" />
            <span className="club-chip club-mono">{state.event.code}</span>
          </div>
          <p className="club-eyebrow mt-5">Tonight&rsquo;s motion</p>
          <h1 className="club-display club-d-lead mt-1.5 text-[color:var(--cc-parchment)]">
            {state.event.title}
          </h1>
          <p className="mt-3 flex items-center gap-2 text-sm text-[color:var(--cc-muted)]">
            <span className="club-rule w-6" />
            {statusText}
          </p>
        </header>

        <div className="club-panel mt-4 p-6">
          <div>
            <p className="club-kicker">Active question</p>
            <h2 className="club-display club-d-title mt-2.5">
              {activity?.prompt ?? "Waiting for the first question"}
            </h2>
          </div>

          {activity && (
            <div className="mt-7 space-y-3">
              {waitingForVoting && (
                <p className="club-panel-quiet px-4 py-4 text-sm font-medium text-[color:var(--cc-parchment)]">
                  Your voting hasn&apos;t opened yet. Please wait for the host to
                  start this vote.
                </p>
              )}
              {isScale ? (
                <ScaleChoiceScale
                  centerLabel={activity.scale_center_label}
                  leftLabel={activity.scale_left_label}
                  options={state.options}
                  rightLabel={activity.scale_right_label}
                  selectedOptionId={selectedOptionId}
                  disabled={!canVote}
                  onSelect={setSelectedOptionId}
                />
              ) : (
                state.options.map((option) => {
                  const selected = selectedOptionId === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      disabled={!canVote}
                      aria-pressed={selected}
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
                })
              )}
            </div>
          )}

          {canVote && (
            <div className="mt-6 border-t border-[color:var(--cc-line)] pt-5">
              <label className="club-label" htmlFor="displayName">
                Display name optional
              </label>
              <input
                id="displayName"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className="club-input mt-2 px-3.5 py-2.5 text-sm"
                placeholder="Name or team"
              />
              <button
                type="button"
                disabled={!selectedOptionId || isSubmitting || !voteToken}
                onClick={submitVote}
                className="club-btn club-btn-primary mt-4 w-full px-4 py-3"
              >
                {isSubmitting && <Loader2 className="animate-spin" size={18} />}
                Submit vote
              </button>
            </div>
          )}

          {message && (
            <p className="club-panel-quiet mt-4 px-3.5 py-3 text-sm font-medium text-[color:var(--cc-parchment)]">
              {message}
            </p>
          )}

          {resultsVisible && (
            <div className="mt-6 border-t border-[color:var(--cc-line)] pt-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="club-display club-d-card">Results</h3>
                <span className="club-mono text-xs uppercase tracking-[0.16em] text-[color:var(--cc-muted)]">
                  {state.totalVotes} votes
                </span>
              </div>
              {isScale ? (
                <ScaleResults
                  leftLabel={activity?.scale_left_label}
                  options={state.options}
                  rightLabel={activity?.scale_right_label}
                  totalVotes={state.totalVotes}
                />
              ) : (
                <ResultBars options={state.options} totalVotes={state.totalVotes} />
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
