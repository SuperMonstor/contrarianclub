"use client";

import { Check, Loader2, SkipForward, UserPlus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  formatClock,
  useChallengeCountdown,
} from "@/components/use-challenge-countdown";
import { createBrowserClient } from "@/lib/supabase/browser";
import { requestProgress } from "@/lib/speaker-challenge";
import type { ActivitySummary, ChallengeSummary } from "@/lib/types";

type ChallengeVoteProps = {
  activity: ActivitySummary;
  challenge: ChallengeSummary;
  voteToken: string;
  refresh: () => Promise<void>;
};

type Participation = {
  round: number;
  joined: boolean;
  eligible: boolean;
  requested: boolean;
};

function challengeErrorMessage(reason: string) {
  if (reason.includes("voting_not_open_yet")) {
    return "Requests open when the protected time ends.";
  }
  if (reason.includes("speaker_paused")) {
    return "The host has paused this speaker session.";
  }
  if (reason.includes("stale_round")) {
    return "The next speaker has started. Please try again.";
  }
  if (reason.includes("not_eligible_current_round")) {
    return "Your current-speaker eligibility is still syncing.";
  }
  if (reason.includes("poll_not_open")) {
    return "The Audience Section is not open.";
  }
  if (reason.includes("event_not_active")) return "This event has ended.";
  if (reason.includes("invalid_token") || reason.includes("activity_not_found")) {
    return "Please refresh the page and try again.";
  }
  return "Something went wrong. Please try again.";
}

export function ChallengeVote({
  activity,
  challenge,
  voteToken,
  refresh,
}: ChallengeVoteProps) {
  const [participation, setParticipation] = useState<Participation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [message, setMessage] = useState("");
  const remaining = useChallengeCountdown(
    challenge.opensInSeconds,
    challenge.paused,
  );
  const activityId = activity.id;
  const round = challenge.round;
  const recoveryIdRef = useRef(0);
  const requestIdRef = useRef(0);

  const recoverParticipation = useCallback(async () => {
    if (!voteToken) return;
    const supabase = createBrowserClient();
    if (!supabase) {
      setMessage("Enrollment recovery is unavailable right now.");
      return;
    }

    const recoveryId = recoveryIdRef.current + 1;
    recoveryIdRef.current = recoveryId;
    setIsRecovering(true);
    try {
      const { data, error } = await supabase.rpc("get_speaker_participation", {
        p_token: voteToken,
        p_activity_id: activityId,
      });
      if (recoveryIdRef.current !== recoveryId) return;

      if (error) {
        setMessage(challengeErrorMessage(error.message));
        return;
      }

      const recovered = (data as Participation[] | null)?.[0] ?? null;
      setParticipation(recovered?.round === round ? recovered : null);
    } catch {
      if (recoveryIdRef.current === recoveryId) {
        setMessage("Couldn't recover your enrollment. Please try again.");
      }
    } finally {
      if (recoveryIdRef.current === recoveryId) setIsRecovering(false);
    }
  }, [activityId, round, voteToken]);

  useEffect(() => {
    let cancelled = false;
    window.queueMicrotask(() => {
      if (cancelled) return;
      setParticipation(null);
      setIsSubmitting(false);
      setMessage("");
      void recoverParticipation();
    });

    return () => {
      cancelled = true;
      recoveryIdRef.current += 1;
      requestIdRef.current += 1;
    };
  }, [recoverParticipation]);

  const protectedTime =
    activity.status === "open" && !challenge.paused && remaining > 0;
  const votingOpen =
    activity.status === "open" &&
    !challenge.paused &&
    (challenge.votingOpen ||
      (challenge.opensInSeconds > 0 && remaining === 0));

  async function joinElectorate() {
    if (!voteToken || isSubmitting) return;
    const supabase = createBrowserClient();
    if (!supabase) {
      setMessage("Enrollment is unavailable right now.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    try {
      const { error } = await supabase.rpc("join_speaker_electorate", {
        p_token: voteToken,
      });
      if (error) {
        setMessage(challengeErrorMessage(error.message));
        return;
      }

      setMessage(
        activity.status === "draft"
          ? "You are enrolled for audience speaker requests."
          : "You can now vote on the current speaker.",
      );
      await recoverParticipation();
      await refresh();
    } catch {
      setMessage("Couldn't reach the room. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function setRequest(requested: boolean) {
    if (!voteToken || isSubmitting || !votingOpen || !participation?.eligible) {
      return;
    }
    const supabase = createBrowserClient();
    if (!supabase) {
      setMessage("Requests are unavailable right now.");
      return;
    }

    const previous = participation;
    const requestId = requestIdRef.current;
    setParticipation({ ...previous, requested });
    setIsSubmitting(true);
    setMessage("");

    try {
      const { error } = await supabase.rpc("set_next_speaker_request", {
        p_token: voteToken,
        p_activity_id: activityId,
        p_expected_round: round,
        p_requested: requested,
      });

      if (requestIdRef.current !== requestId) return;

      if (error) {
        setParticipation(previous);
        setMessage(challengeErrorMessage(error.message));
        return;
      }

      setMessage(requested ? "Request recorded." : "Request withdrawn.");
      await refresh();
    } catch {
      if (requestIdRef.current === requestId) {
        setParticipation(previous);
        setMessage("Couldn't reach the room. Check your connection and try again.");
      }
    } finally {
      if (requestIdRef.current === requestId) setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-7 space-y-4">
      {!participation?.joined && (
        <button
          type="button"
          disabled={!voteToken || isSubmitting || isRecovering}
          onClick={joinElectorate}
          className="club-btn club-btn-primary w-full px-4 py-4"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
          Join audience speaker requests
        </button>
      )}

      {participation?.joined && (
        <p className="flex items-center gap-2 text-sm font-medium text-[color:var(--cc-parchment)]">
          <Check size={16} className="text-[color:var(--cc-gold-bright)]" />
          Enrolled once for this event
        </p>
      )}

      {activity.status === "draft" && (
        <p className="club-panel-quiet px-4 py-4 text-sm font-medium text-[color:var(--cc-parchment)]">
          Enroll now. Your enrollment remains active for every speaker in this
          event.
        </p>
      )}

      {activity.status === "closed" && (
        <p className="club-panel-quiet px-4 py-4 text-sm font-medium text-[color:var(--cc-parchment)]">
          The Audience Section is waiting for the host.
        </p>
      )}

      {protectedTime && (
        <div className="club-panel-quiet px-4 py-5 text-center">
          <p className="club-eyebrow">Protected speaking time</p>
          <p className="club-mono mt-2 text-5xl font-bold text-[color:var(--cc-gold-bright)]">
            {formatClock(remaining)}
          </p>
          <p className="mt-3 text-xs text-[color:var(--cc-muted)]">
            Requests unlock when the clock reaches zero.
          </p>
        </div>
      )}

      {challenge.paused && (
        <div className="club-panel-quiet px-4 py-4 text-center">
          <p className="club-eyebrow">Speaker session paused</p>
          <p className="mt-2 text-xs text-[color:var(--cc-muted)]">
            The host can resume this speaker or begin the next one.
          </p>
        </div>
      )}

      {activity.status === "open" && (
        <AudienceChallengeProgress challenge={challenge} />
      )}

      {votingOpen && participation?.eligible && (
        <button
          type="button"
          aria-pressed={participation.requested}
          disabled={isSubmitting}
          onClick={() => setRequest(!participation.requested)}
          className={`club-btn min-h-20 w-full px-4 py-4 ${
            participation.requested ? "club-btn-primary" : ""
          }`}
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={19} /> : <SkipForward size={19} />}
          {participation.requested ? "Withdraw next-speaker request" : "Request next speaker"}
        </button>
      )}

      {votingOpen && participation?.joined && !participation.eligible && (
        <p className="club-panel-quiet px-4 py-4 text-sm text-[color:var(--cc-parchment)]">
          Your current-speaker eligibility is still syncing. Please try again.
        </p>
      )}

      {isRecovering && (
        <p className="flex items-center justify-center gap-2 text-xs text-[color:var(--cc-muted)]">
          <Loader2 className="animate-spin" size={14} />
          Recovering enrollment
        </p>
      )}

      {message && (
        <p className="club-panel-quiet px-3.5 py-3 text-sm font-medium text-[color:var(--cc-parchment)]">
          {message}
        </p>
      )}
    </div>
  );
}

function AudienceChallengeProgress({
  challenge,
}: {
  challenge: ChallengeSummary;
}) {
  const progress = requestProgress(
    challenge.nextVotes,
    challenge.eligibleCount,
  );
  const fillClass = challenge.thresholdReached
    ? "bg-[color:var(--cc-wine-bright)]"
    : "bg-[color:var(--cc-gold-bright)]";

  return (
    <div className="club-panel-quiet px-4 py-4">
      <div className="club-mono flex items-center justify-between gap-4 text-sm font-bold">
        <span className="text-[color:var(--cc-parchment)]">
          {challenge.nextVotes} voted
        </span>
        <span className="text-[color:var(--cc-muted)]">
          {challenge.eligibleCount} joined
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Next-speaker vote progress"
        aria-valuemin={0}
        aria-valuemax={Math.max(1, challenge.eligibleCount)}
        aria-valuenow={challenge.nextVotes}
        className="mt-3 h-3 overflow-hidden rounded-sm border border-[color:var(--cc-line)] bg-[color:var(--cc-ivory)]/[0.05]"
      >
        <div
          className={`h-full transition-[width,background-color] duration-500 ${fillClass}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function ChallengeProgress({
  challenge,
  large = false,
}: {
  challenge: ChallengeSummary;
  large?: boolean;
}) {
  const progress = requestProgress(
    challenge.nextVotes,
    challenge.thresholdCount,
  );

  return (
    <div className="club-panel-quiet px-4 py-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="club-label text-[0.65rem]">Next-speaker requests</p>
          <p className={`club-mono mt-1 font-bold text-[color:var(--cc-gold-bright)] ${large ? "text-5xl" : "text-3xl"}`}>
            {challenge.nextVotes} / {challenge.thresholdCount}
          </p>
        </div>
        <p className="text-right text-xs text-[color:var(--cc-muted)]">
          {challenge.eligibleCount} eligible
        </p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-sm border border-[color:var(--cc-line)] bg-[color:var(--cc-ivory)]/[0.05]">
        <div
          className="h-full bg-[color:var(--cc-gold-bright)] transition-[width] duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-3 text-xs font-semibold text-[color:var(--cc-parchment)]">
        {challenge.thresholdReached
          ? "Threshold reached"
          : challenge.eligibleCount === 0
            ? "No eligible voters in this round"
            : `${Math.max(0, challenge.thresholdCount - challenge.nextVotes)} more needed`}
      </p>
    </div>
  );
}
