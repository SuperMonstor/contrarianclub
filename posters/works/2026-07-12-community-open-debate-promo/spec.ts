import type { WorkSpec } from "../../src/core/types";
import hero from "./assets/hero-assembly.jpg";

// Image-forward promo for the Community Open Debate. Full-bleed statement
// layout over a treated painting of the Roman senate mid-debate (Maccari,
// "Cicero Denounces Catiline", public domain).
const work: WorkSpec = {
  title: "Community Open Debate, promo",
  date: "2026-07-12",

  slides: [
    {
      template: "statement",

      kicker: "Invite Only",
      title: "Community Open Debate",
      oneLiner:
        "Two or three topics, picked on the spot. The floor open to everyone in the room.",

      details: [
        { label: "Date", value: "Sunday, 12 July" },
        { label: "Time", value: "1:00 pm onwards" },
      ],

      closing: "Our house. Open floor.",

      image: { src: hero, treatment: "full" },
    },
  ],
};

export default work;
