"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Megaphone, UserPlus } from "lucide-react";
import {
  formatClock,
  useChallengeCountdown,
} from "@/components/use-challenge-countdown";
import { createBrowserClient } from "@/lib/supabase/browser";
import type { ActivitySummary, ChallengeSummary } from "@/lib/types";

type ChallengeVoteProps = {
  code: string;
  activity: ActivitySummary;
  challenge: ChallengeSummary;
  nextSpeakerOptionId: string | null;
  voteToken: string;
  refresh: () => Promise<void>;
};

// Per-round keys: advancing the round changes the key, so every phone unlocks
// for the new round without any inference from vote totals.
function challengeKey(code: string, activityId: string, round: number, act: string) {
  return `contrarianclub:${code}:activity:${activityId}:round:${round}:${act}`;
}

function readStored(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStored(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Best-effort cache only; the value already lives in component state.
  }
}

function challengeErrorMessage(reason: string) {
  if (reason.includes("join_window_closed")) {
    return "The join window for this round has closed. You can join the next round.";
  }
  if (reason.includes("voting_not_open_yet")) {
    return "Voting hasn't opened yet. Try again in a moment.";
  }
  if (reason.includes("not_joined")) {
    return "Only people who joined this round can vote. You can join the next round.";
  }
  if (reason.includes("poll_not_open")) return "The challenge is not open.";
  if (reason.includes("event_not_active")) return "This event has ended.";
  if (reason.includes("invalid_token") || reason.includes("activity_not_found")) {
    return "Please refresh the page and try again.";
  }
  return "Something went wrong. Please try again.";
}

export function ChallengeVote({
  code,
  activity,
  challenge,
  nextSpeakerOptionId,
  voteToken,
  refresh,
}: ChallengeVoteProps) {
  const [hasJoined, setHasJoined] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const remaining = useChallengeCountdown(challenge.opensInSeconds);

  const activityId = activity.id;
  const round = challenge.round;

  // Restore this round's joined/voted flags; a round change resets both.
  useEffect(() => {
    let cancelled = false;
    const joined = readStored(challengeKey(code, activityId, round, "joined"));
    const voted = readStored(challengeKey(code, activityId, round, "voted"));

    window.queueMicrotask(() => {
      if (cancelled) return;
      setHasJoined(joined === "true");
      setHasVoted(voted === "true");
      setMessage("");
    });

    return () => {
      cancelled = true;
    };
  }, [code, activityId, round]);

  const isDraft = activity.status === "draft";
  const isClosed = activity.status === "closed";
  // Flip to the vote phase on the local tick for responsiveness (the safety
  // poll can lag a few seconds); the server still rejects anything early.
  const joinPhase = challenge.joinWindowOpen && remaining > 0;
  const votePhase =
    challenge.votingOpen || (challenge.joinWindowOpen && remaining === 0);

  async function joinRound() {
    if (!voteToken || isSubmitting) return;

    const supabase = createBrowserClient();
    if (!supabase) {
      setMessage("Joining is unavailable right now.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const { error } = await supabase.rpc("join_challenge_round", {
        p_token: voteToken,
        p_activity_id: activityId,
      });

      if (error && !error.message.includes("already_joined")) {
        setMessage(challengeErrorMessage(error.message));
        return;
      }

      writeStored(challengeKey(code, activityId, round, "joined"), "true");
      setHasJoined(true);
      await refresh();
    } catch {
      setMessage("Couldn't reach the room. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function voteNextSpeaker() {
    if (!voteToken || !nextSpeakerOptionId || isSubmitting) return;

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
        p_activity_id: activityId,
        p_option_id: nextSpeakerOptionId,
        p_display_name: null,
      });

      if (error && !error.message.includes("already_voted")) {
        setMessage(challengeErrorMessage(error.message));
        return;
      }

      writeStored(challengeKey(code, activityId, round, "voted"), "true");
      setHasVoted(true);
      await refresh();
    } catch {
      setMessage("Couldn't reach the room. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-7 space-y-4">
      {isDraft && (
        <p className="club-panel-quiet px-4 py-4 text-sm font-medium text-[color:var(--cc-parchment)]">
          The speaker challenge hasn&apos;t started yet. Please wait for the
          host.
        </p>
      )}

      {isClosed && (
        <p className="club-panel-quiet px-4 py-4 text-sm font-medium text-[color:var(--cc-parchment)]">
          The speaker challenge is closed.
        </p>
      )}

      {challenge.speakerOut && !isDraft && (
        <div className="club-panel-gold px-4 py-4 text-center">
          <p className="club-eyebrow">The room has spoken</p>
          <p className="club-display club-d-card mt-1 text-[color:var(--cc-ivory)]">
            Next speaker
          </p>
        </div>
      )}

      {joinPhase && (
        <div className="space-y-3">
          <div className="club-panel-quiet px-4 py-4 text-center">
            <p className="club-eyebrow">Voting opens in</p>
            <p className="club-mono mt-1 text-4xl font-bold text-[color:var(--cc-gold-bright)]">
              {formatClock(remaining)}
            </p>
            <p className="mt-2 text-xs text-[color:var(--cc-muted)]">
              {challenge.joiners} in this round so far
            </p>
          </div>
          {hasJoined ? (
            <p className="club-panel-quiet flex items-center gap-2 px-4 py-4 text-sm font-medium text-[color:var(--cc-parchment)]">
              <Check size={18} className="text-[color:var(--cc-gold-bright)]" />
              You&apos;re in this round. Voting opens when the clock runs out.
            </p>
          ) : (
            <button
              type="button"
              disabled={!voteToken || isSubmitting}
              onClick={joinRound}
              className="club-btn club-btn-primary w-full px-4 py-4"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <UserPlus size={18} />
              )}
              Join this round&apos;s vote
            </button>
          )}
        </div>
      )}

      {votePhase && !challenge.speakerOut && (
        <div className="space-y-3">
          <ChallengeMeter challenge={challenge} />
          {hasJoined ? (
            hasVoted ? (
              <p className="club-panel-quiet flex items-center gap-2 px-4 py-4 text-sm font-medium text-[color:var(--cc-parchment)]">
                <Check size={18} className="text-[color:var(--cc-gold-bright)]" />
                Vote received. Doing nothing keeps the current speaker.
              </p>
            ) : (
              <>
                <button
                  type="button"
                  disabled={!voteToken || isSubmitting || !nextSpeakerOptionId}
                  onClick={voteNextSpeaker}
                  className="club-btn club-btn-primary w-full px-4 py-4"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Megaphone size={18} />
                  )}
                  Get the next speaker in
                </button>
                <p className="text-center text-xs text-[color:var(--cc-muted)]">
                  Or do nothing to keep the current speaker.
                </p>
              </>
            )
          ) : (
            <p className="club-panel-quiet px-4 py-4 text-sm font-medium text-[color:var(--cc-parchment)]">
              You didn&apos;t join this round, so you&apos;re sitting it out.
              You can join when the next round opens.
            </p>
          )}
        </div>
      )}

      {message && (
        <p className="club-panel-quiet px-3.5 py-3 text-sm font-medium text-[color:var(--cc-parchment)]">
          {message}
        </p>
      )}
    </div>
  );
}

// Live threshold meter for the voting phase. Counts ride the ~5s safety poll,
// so the bar steps rather than glides; the width transition smooths it. The
// meter always renders — below minimum turnout it still fills, with a note
// that the round cannot produce a verdict yet.
function ChallengeMeter({ challenge }: { challenge: ChallengeSummary }) {
  const progress = Math.min(
    100,
    Math.round((challenge.nextVotes / challenge.votesNeeded) * 100),
  );

  return (
    <div className="club-panel-quiet px-4 py-3">
      <div className="mb-2 flex items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-[color:var(--cc-parchment)]">
          {challenge.nextVotes} of {challenge.votesNeeded} to change
        </span>
        <span className="text-[color:var(--cc-muted)]">
          {challenge.joiners} in this round
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-sm border border-[color:var(--cc-line)] bg-[color:var(--cc-ivory)]/[0.06]">
        <div
          className="h-full rounded-[3px] bg-[color:var(--cc-gold-bright)] transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-[color:var(--cc-muted)]">
        A majority of this round&apos;s joiners brings in the next speaker.
        {!challenge.turnoutMet &&
          ` At least ${challenge.minTurnout} must join for the round to count — ${challenge.joiners} so far.`}
      </p>
    </div>
  );
}
