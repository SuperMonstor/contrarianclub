import type { WorkSpec } from "../../src/core/types";
import liberty from "./assets/liberty.jpg";
import babel from "./assets/babel.jpg";
import anatomy from "./assets/anatomy.jpg";
import cockaigne from "./assets/cockaigne.jpg";
import banquet from "./assets/banquet.jpg";
import work_ from "./assets/work.jpg";
import harvesters from "./assets/harvesters.jpg";
import sorrow from "./assets/sorrow.jpg";
import syndics from "./assets/syndics.jpg";
import wanderer from "./assets/wanderer.jpg";

// Instagram carousel for the 19 July debate. See copy.md for the copy
// decisions and the rejected motion wordings.
//
// The interior reads as one argument spoken aloud, not a deck of bullets:
// each slide is a sentence that hands off to the next, and each painting is
// chosen for the sentence it sits under rather than for period flavour.
//
//   1  liberty     Delacroix      pride at its most seductive
//   2  babel       Bruegel        the monument to pride that never finished
//   3  anatomy     Rembrandt      students crowding in to learn from a master
//   4  cockaigne   Bruegel        men lying stuffed and idle, done running
//   5  banquet     Hals           officers toasting themselves
//   6  work        Ford Madox Brown  people building the thing they believe in
//   7  harvesters  Bruegel        a country fed by its own hands
//   8  sorrow      Van Gogh       what measuring yourself against the rich does
//   9  syndics     Rembrandt      the table where it gets decided
//   10 wanderer    Friedrich      one figure choosing what to measure himself against
//
// All public domain, via Wikimedia Commons.
const work: WorkSpec = {
  title: "National Pride Debate",
  date: "2026-07-19",
  formats: ["carousel-slide"],

  slides: [
    // 1. The hook.
    {
      template: "statement",
      kicker: "Coming Up Next",
      title: "Can too much national pride hold a country back?",
      oneLiner:
        "A question that has divided economists, policymakers and patriots.",
      image: { src: liberty, treatment: "full" },
    },

    // 2. The motion, over the tower that pride never finished.
    {
      template: "statement",
      kicker: "The Motion",
      title: "National pride is a barrier to progress",
      oneLiner: "Because it discourages international comparison.",
      closing: "Nobody thinks pride is worthless. The argument is what it costs.",
      image: { src: babel, treatment: "full", position: "center 42%" },
    },

    // 3 to 5. The case for, one sentence handing off to the next.
    {
      template: "panel",
      kicker: "The Case For",
      title:
        "Start here. The fastest way to get better at anything is to study whoever is already doing it better.",
      image: { src: anatomy, position: "center 46%" },
    },
    {
      template: "panel",
      kicker: "The Case For",
      title:
        "But pride quietly changes what you measure. You start judging yourself by how far you have come, not by how far you still have to go.",
      image: { src: cockaigne, position: "center 52%" },
    },
    {
      template: "panel",
      kicker: "The Case For",
      title:
        "And once that happens, you celebrate progress instead of chasing excellence. You stop running.",
      image: { src: banquet, position: "center 40%" },
    },

    // 6 to 8. The case against, answering it directly.
    {
      template: "panel",
      kicker: "The Case Against",
      title: "Then again, nobody builds a country they are ashamed of.",
      // the canvas is arched; crop below the curve so no bare edge shows
      image: { src: work_, position: "center 55%" },
    },
    {
      template: "panel",
      kicker: "The Case Against",
      title:
        "Pride is what makes people stay, contribute, and believe the thing can actually work.",
      image: { src: harvesters, position: "center 86%" },
    },
    {
      template: "panel",
      kicker: "The Case Against",
      title:
        "And if you only ever measure yourself against the rich, you do not learn ambition. You learn resentment, and the quiet belief that you will never catch up.",
      image: { src: sorrow, position: "center 30%" },
    },

    // 9. The core conflict, put as a question rather than a table.
    {
      template: "versus",
      kicker: "The Core Conflict",
      title: "So where should the standard come from?",
      columns: [
        {
          heading: "Its own journey",
          points: [
            "It respects where we started, it holds people together, and it measures how far we have come.",
          ],
        },
        {
          heading: "The world's best",
          points: [
            "It sets a higher bar, it forces us to learn, and it measures how far we still have to go.",
          ],
        },
      ],
      closing: "Come and settle it.",
      image: { src: syndics, position: "center 25%" },
    },

    // 10. The room.
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
