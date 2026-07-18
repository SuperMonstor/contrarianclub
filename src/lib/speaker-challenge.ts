import type { ChallengeLeader, SpeakerBallotChoice } from "@/lib/types";

export function summarizeSpeakerBallots(
  choices: SpeakerBallotChoice[],
): Pick<
  import("@/lib/types").ChallengeSummary,
  "keepVotes" | "nextVotes" | "totalBallots" | "leader"
> {
  let keepVotes = 0;
  let nextVotes = 0;

  for (const choice of choices) {
    if (choice === "keep") keepVotes += 1;
    if (choice === "next") nextVotes += 1;
  }

  const totalBallots = keepVotes + nextVotes;
  let leader: ChallengeLeader = "none";

  if (totalBallots > 0) {
    if (keepVotes > nextVotes) leader = "keep";
    else if (nextVotes > keepVotes) leader = "next";
    else leader = "tie";
  }

  return { keepVotes, nextVotes, totalBallots, leader };
}

export function ballotPercent(votes: number, totalBallots: number) {
  if (totalBallots === 0) return 0;
  return Math.round((votes / totalBallots) * 100);
}
