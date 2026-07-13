import type { WorkSpec } from "../../src/core/types";

// The Contrarian Debate Club, Community Open Debate. The typographic invite:
// no image, all copy, meant to be read.
//
// Voice: short declaratives, dry and a little ceremonial. No exclamation
// marks, no emoji, no growth-speak.
const work: WorkSpec = {
  title: "Community Open Debate",
  date: "2026-07-12",

  slides: [
    {
      template: "editorial",

      kicker: "Invite Only",
      title: "Community Open Debate",
      oneLiner:
        "An invite-only night built to get more people debating. Two or three topics picked on the spot, with the floor open to everyone in the room.",

      points: [
        "More people on their feet. Reps, not polish",
        "Two or three topics, decided live",
        "Open floor all night",
      ],

      details: [
        { label: "Date", value: "Sunday, 12 July" },
        { label: "Time", value: "1:00 pm onwards" },
        { label: "Entry", value: "By invitation: regulars & applied debaters" },
      ],

      closing: "Our house. Open floor.",
    },
  ],
};

export default work;
