import type { WorkSpec } from "../../src/core/types";
import liberty from "./assets/liberty.jpg";
import wanderer from "./assets/wanderer.jpg";

// Instagram carousel for the 19 July debate. See copy.md in this folder for
// the copy decisions and the rejected motion wordings.
//
// The arc: image bookends, typographic interior. Delacroix opens (the
// canonical national-pride painting), Friedrich closes (one figure deciding
// what to measure himself against, which is the motion).
//
// Art, both public domain via Wikimedia Commons:
//   liberty.jpg   Delacroix, "Liberty Leading the People", 1830
//   wanderer.jpg  Friedrich, "Wanderer above the Sea of Fog", 1818
const work: WorkSpec = {
  title: "National Pride Debate",
  date: "2026-07-19",
  formats: ["carousel-slide"],

  slides: [
    // 1. The hook. The question carries the slide; the sub-line widens it.
    {
      template: "statement",
      kicker: "Coming Up Next",
      title: "Can too much national pride become a country's biggest weakness?",
      oneLiner:
        "A question that has divided economists, policymakers and patriots.",
      image: { src: liberty, treatment: "full" },
    },

    // 2. The motion, broken across two weights: the accusation first, the
    // mechanism second. The closing kills the strawman before either side
    // can reach for it.
    {
      template: "editorial",
      kicker: "The Motion",
      title: "National pride is a barrier to progress.",
      oneLiner: "Because it discourages international comparison.",
      closing: "Nobody thinks pride is worthless. The argument is what it costs.",
    },

    // 3. For the motion.
    {
      template: "editorial",
      kicker: "For the Motion",
      title: "Look outward.",
      points: [
        "The fastest way to improve is to study whoever is doing it better.",
        "Pride measures how far we have come. Excellence measures how far we have left to go.",
        "Celebrate the distance travelled and you stop running.",
      ],
    },

    // 4. Against the motion.
    {
      template: "editorial",
      kicker: "Against the Motion",
      title: "Look inward.",
      points: [
        "Nobody builds a country they are ashamed of.",
        "Pride is what makes people stay, contribute, and believe the thing can work.",
        "Measure yourself only against the rich and you learn resentment, not ambition.",
      ],
    },

    // 5. The core conflict, the debate laid out as a choice.
    {
      template: "versus",
      kicker: "The Core Conflict",
      title: "Where should the standard come from?",
      columns: [
        {
          heading: "Its own journey",
          points: [
            "Respects history and context.",
            "Builds unity and commitment.",
            "Measures how far we have come.",
          ],
        },
        {
          heading: "The world's best",
          points: [
            "Sets a higher benchmark.",
            "Forces learning.",
            "Measures how far we still have to go.",
          ],
        },
      ],
    },

    // 6. The room. Claim huge, mechanism under it, then the details and the
    // line that sells the format.
    {
      template: "statement",
      kicker: "Next Debate",
      title: "National pride is a barrier to progress",
      oneLiner: "Because it discourages international comparison.",
      details: [
        { label: "Date", value: "Sunday, 19 July" },
        { label: "Time", value: "2:00 pm onwards" },
        { label: "Tickets", value: "On Offlyn" },
        { label: "Where", value: "Underground Comedy Club, Koramangala" },
      ],
      closing: "The side that moves the most minds wins.",
      image: { src: wanderer, treatment: "full" },
    },
  ],
};

export default work;
