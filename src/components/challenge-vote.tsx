"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Check, Loader2, Mic2, SkipForward } from "lucide-react";
import {
  formatClock,
  useChallengeCountdown,
} from "@/components/use-challenge-countdown";
import { createBrowserClient } from "@/lib/supabase/browser";
import { ballotPercent } from "@/lib/speaker-challenge";
import type {
  ActivitySummary,
  ChallengeSummary,
  SpeakerBallotChoice,
} from "@/lib/types";

type ChallengeVoteProps = {
  activity: ActivitySummary;
  challenge: ChallengeSummary;
  voteToken: string;
  refresh: () => Promise<void>;
};

function challengeErrorMessage(reason: string) {
  if (reason.includes("voting_not_open_yet")) {
    return "Voting opens when the protected time ends.";
  }
  if (reason.includes("speaker_paused")) {
    return "The host has paused this speaker session.";
  }
  if (reason.includes("stale_round")) {
    return "The next speaker has started. Choose again for the new speaker.";
  }
  if (reason.includes("poll_not_open")) {
    return "The Audience Section is not open.";
  }
  if (reason.includes("event_not_active")) return "This event has ended.";
  if (reason.includes("invalid_token") || reason.includes("activity_not_found")) {
    return "Please refresh the page and try again.";
  }
  return "Something went wrong. Your previous choice is still recorded.";
}

export function ChallengeVote({
  activity,
  challenge,
  voteToken,
  refresh,
}: ChallengeVoteProps) {
  const [selectedChoice, setSelectedChoice] =
    useState<SpeakerBallotChoice | null>(null);
  const [confirmedChoice, setConfirmedChoice] =
    useState<SpeakerBallotChoice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [message, setMessage] = useState("");
  const remaining = useChallengeCountdown(challenge.opensInSeconds);
  const activityId = activity.id;
  const round = challenge.round;

  useEffect(() => {
    let cancelled = false;

    window.queueMicrotask(() => {
      if (cancelled) return;
      setSelectedChoice(null);
      setConfirmedChoice(null);
      setMessage("");
    });

    if (!voteToken) {
      return () => {
        cancelled = true;
      };
    }

    const supabase = createBrowserClient();
    if (!supabase) {
      return () => {
        cancelled = true;
      };
    }

    window.queueMicrotask(() => {
      if (!cancelled) setIsRecovering(true);
    });

    void (async () => {
      try {
        const { data, error } = await supabase.rpc("get_speaker_ballot", {
          p_token: voteToken,
          p_activity_id: activityId,
        });
        if (cancelled) return;
        if (error) {
          setMessage(challengeErrorMessage(error.message));
          return;
        }

        const recovered = (data as
          | { round: number; choice: SpeakerBallotChoice | null }[]
          | null)?.[0];
        const choice = recovered?.round === round ? recovered.choice : null;
        setSelectedChoice(choice);
        setConfirmedChoice(choice);
      } catch {
        if (!cancelled) {
          setMessage("Couldn't recover your choice. You can choose again.");
        }
      } finally {
        if (!cancelled) setIsRecovering(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activityId, round, voteToken]);

  const protectedTime =
    activity.status === "open" && !challenge.paused && remaining > 0;
  const votingOpen =
    activity.status === "open" &&
    !challenge.paused &&
    (challenge.votingOpen ||
      (challenge.opensInSeconds > 0 && remaining === 0));
  const ballotVisible =
    votingOpen ||
    (activity.status === "open" && challenge.paused && remaining === 0);

  async function setBallot(choice: SpeakerBallotChoice) {
    if (!voteToken || isSubmitting || !votingOpen) return;

    const supabase = createBrowserClient();
    if (!supabase) {
      setMessage("Voting is unavailable right now.");
      return;
    }

    const previousChoice = confirmedChoice;
    setSelectedChoice(choice);
    setIsSubmitting(true);
    setMessage("");

    try {
      const { error } = await supabase.rpc("set_speaker_ballot", {
        p_token: voteToken,
        p_activity_id: activityId,
        p_expected_round: round,
        p_choice: choice,
      });

      if (error) {
        setSelectedChoice(previousChoice);
        setMessage(challengeErrorMessage(error.message));
        return;
      }

      setConfirmedChoice(choice);
      setMessage(
        choice === "keep"
          ? "Confirmed: Keep speaking."
          : "Confirmed: Next speaker.",
      );
      await refresh();
    } catch {
      setSelectedChoice(previousChoice);
      setMessage("Couldn't reach the room. Your previous choice is still recorded.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-7 space-y-4">
      {activity.status === "draft" && (
        <p className="club-panel-quiet px-4 py-4 text-sm font-medium text-[color:var(--cc-parchment)]">
          The Audience Section has not started. Please wait for the host.
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
            The ballot unlocks when the clock reaches zero.
          </p>
        </div>
      )}

      {challenge.paused && (
        <div className="club-panel-quiet px-4 py-4 text-center">
          <p className="club-eyebrow">Speaker session paused</p>
          {remaining > 0 && (
            <p className="club-mono mt-2 text-3xl font-bold text-[color:var(--cc-gold-bright)]">
              {formatClock(remaining)} protected time remains
            </p>
          )}
          <p className="mt-2 text-xs text-[color:var(--cc-muted)]">
            The host can resume this speaker or begin the next one.
          </p>
        </div>
      )}

      {ballotVisible && <ChallengeSplit challenge={challenge} />}

      {votingOpen && (
        <div className="grid grid-cols-2 gap-3">
          <BallotButton
            label="Keep speaking"
            icon={<Mic2 size={19} />}
            selected={selectedChoice === "keep"}
            confirmed={confirmedChoice === "keep"}
            disabled={!voteToken || isSubmitting || isRecovering}
            onClick={() => setBallot("keep")}
          />
          <BallotButton
            label="Next speaker"
            icon={<SkipForward size={19} />}
            selected={selectedChoice === "next"}
            confirmed={confirmedChoice === "next"}
            disabled={!voteToken || isSubmitting || isRecovering}
            onClick={() => setBallot("next")}
          />
        </div>
      )}

      {isRecovering && (
        <p className="flex items-center justify-center gap-2 text-xs text-[color:var(--cc-muted)]">
          <Loader2 className="animate-spin" size={14} />
          Recovering your choice
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

function BallotButton({
  label,
  icon,
  selected,
  confirmed,
  disabled,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  selected: boolean;
  confirmed: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={`club-btn min-h-24 flex-col px-3 py-4 text-center ${
        selected ? "club-btn-primary" : ""
      }`}
    >
      <span className="flex items-center gap-2">
        {icon}
        {confirmed && <Check size={16} />}
      </span>
      <span>{label}</span>
    </button>
  );
}

export function ChallengeSplit({
  challenge,
  large = false,
}: {
  challenge: ChallengeSummary;
  large?: boolean;
}) {
  const keepPercent = ballotPercent(challenge.keepVotes, challenge.totalBallots);
  const nextPercent = ballotPercent(challenge.nextVotes, challenge.totalBallots);

  return (
    <div className="club-panel-quiet px-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="club-label text-[0.65rem]">Keep speaking</p>
          <p className={`club-mono mt-1 font-bold text-[color:var(--cc-parchment)] ${large ? "text-5xl" : "text-3xl"}`}>
            {challenge.keepVotes}
          </p>
          <p className="mt-1 text-xs text-[color:var(--cc-muted)]">{keepPercent}%</p>
        </div>
        <div className="text-right">
          <p className="club-label text-[0.65rem]">Next speaker</p>
          <p className={`club-mono mt-1 font-bold text-[color:var(--cc-gold-bright)] ${large ? "text-5xl" : "text-3xl"}`}>
            {challenge.nextVotes}
          </p>
          <p className="mt-1 text-xs text-[color:var(--cc-muted)]">{nextPercent}%</p>
        </div>
      </div>
      <div className="mt-3 flex h-2 overflow-hidden rounded-sm border border-[color:var(--cc-line)] bg-[color:var(--cc-ivory)]/[0.05]">
        <div
          className="bg-[color:var(--cc-parchment)] transition-[width] duration-500"
          style={{ width: `${keepPercent}%` }}
        />
        <div
          className="bg-[color:var(--cc-gold-bright)] transition-[width] duration-500"
          style={{ width: `${nextPercent}%` }}
        />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[color:var(--cc-muted)]">
        <span>{challenge.totalBallots} total ballots</span>
        <span className="font-semibold text-[color:var(--cc-parchment)]">
          {leaderLabel(challenge.leader)}
        </span>
      </div>
    </div>
  );
}

function leaderLabel(leader: ChallengeSummary["leader"]) {
  if (leader === "keep") return "Keep speaking leads";
  if (leader === "next") return "Next speaker leads";
  if (leader === "tie") return "The ballot is tied";
  return "No leader yet";
}
