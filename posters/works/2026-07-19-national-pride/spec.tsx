import type { SlideSpec, WorkSpec } from "../../src/core/types";
import liberty from "./assets/liberty.jpg";
import wanderer from "./assets/wanderer.jpg";
import {
  ArgumentSlide,
  ArtSlide,
  ConflictSlide,
  MotionSlide,
} from "./slides";

// Instagram carousel for the 19 July debate. See copy.md for the copy
// decisions and the rejected motion wordings.
//
// This work renders its own slides (./slides.tsx) rather than using stock
// templates: it is a story, and the surface changes as the story turns.
// Painting, then a hard cut to light for the motion, then the two cases as
// mirrored graphic slides, then the conflict split down the middle, then a
// painting to close.
//
// Art, both public domain via Wikimedia Commons:
//   liberty.jpg   Delacroix, "Liberty Leading the People", 1830
//   wanderer.jpg  Friedrich, "Wanderer above the Sea of Fog", 1818

const FOR = [
  "The fastest way to improve is to learn from those doing it better.",
  "National pride encourages us to judge success by how far we've come, rather than how far we still have to go.",
  "Without comparing ourselves to the world's best, we risk celebrating progress instead of pursuing excellence.",
];

const AGAINST = [
  "Progress needs people who believe their country is worth building.",
  "National pride gives people a shared identity, a reason to contribute, and confidence that our path can succeed.",
  "Measure yourself only against richer countries and you learn cynicism, resentment, and that you'll never catch up.",
];

function argument(side: "for" | "against", points: string[]): SlideSpec[] {
  return points.map((title, index) => ({
    template: (props) => (
      <ArgumentSlide
        spec={props.spec}
        side={side}
        index={index}
        total={points.length}
      />
    ),
    kicker: side === "for" ? "The Case For" : "The Case Against",
    title,
  }));
}

const work: WorkSpec = {
  title: "National Pride Debate",
  date: "2026-07-19",
  formats: ["carousel-slide"],

  slides: [
    // 1. The hook.
    {
      template: ArtSlide,
      kicker: "Coming Up Next",
      title: "Can too much national pride hold a country back?",
      oneLiner:
        "A question that has divided economists, policymakers and patriots.",
      image: { src: liberty, position: "center 34%" },
    },

    // 2. The motion. The one bright slide in the deck.
    {
      template: MotionSlide,
      kicker: "The Motion",
      title: "National pride is a barrier to progress.",
      oneLiner: "Because it discourages international comparison.",
      closing: "Nobody thinks pride is worthless. The argument is what it costs.",
    },

    // 3 to 8. The two cases, mirrored: gold and left, then wine and right.
    ...argument("for", FOR),
    ...argument("against", AGAINST),

    // 9. The core conflict, as two surfaces meeting.
    {
      template: ConflictSlide,
      kicker: "The Core Conflict",
      title: "Where should a country's standard for progress come from?",
      columns: [
        {
          heading: "Its own journey",
          points: [
            "Respects history and context.",
            "Builds unity and commitment.",
            "Measures how far we've come.",
          ],
        },
        {
          heading: "The world's best",
          points: [
            "Sets a higher benchmark.",
            "Encourages learning.",
            "Measures how far we still have to go.",
          ],
        },
      ],
    },

    // 10. The room.
    {
      template: ArtSlide,
      kicker: "Next Debate",
      title: "National pride is a barrier to progress.",
      oneLiner: "Because it discourages international comparison.",
      details: [
        { label: "Date", value: "Sunday, 19 July" },
        { label: "Time", value: "2:00 pm onwards" },
        { label: "Tickets", value: "On Offlyn" },
        { label: "Where", value: "Underground Comedy Club, Koramangala" },
      ],
      closing: "The side that moves the most minds wins.",
      image: { src: wanderer, position: "center 40%" },
    },
  ],
};

export default work;
