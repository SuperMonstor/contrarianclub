import type { PosterSpec } from "../types";

// The Contrarian Debate Club — Community Open Debate
// Voice: short declaratives, dry and a little ceremonial. No exclamation
// marks, no emoji, no growth-speak.
export const communityOpenDebate: PosterSpec = {
  id: "community-open-debate",
  template: "editorial",

  kicker: "Invite Only",
  title: "Community Open Debate",
  oneLiner:
    "An invite-only night built to get more people debating — two or three topics picked on the spot, with the floor open to everyone in the room.",

  points: [
    "More people on their feet — reps, not polish",
    "2–3 topics, decided live",
    "Open floor all night",
  ],

  details: [
    { label: "Date", value: "Sunday, 12 July" },
    { label: "Time", value: "1:00 pm onwards" },
    { label: "Entry", value: "By invitation — regulars & applied debaters" },
  ],

  closing: "Our house. Open floor.",
};
