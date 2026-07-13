import type { WorkSpec } from "../../src/core/types";
import liberty from "./assets/liberty.jpg";
import observatory from "./assets/observatory.jpg";
import cockaigne from "./assets/cockaigne.jpg";
import babel from "./assets/babel.jpg";
import akbar from "./assets/akbar.jpg";
import qingming from "./assets/qingming.jpg";
import sorrow from "./assets/sorrow.jpg";
import mountains from "./assets/mountains.jpg";
import wanderer from "./assets/wanderer.jpg";

// Instagram carousel for the 19 July debate. See copy.md for the copy
// decisions and the rejected motion wordings.
//
// Two rules the piece is built on.
//
// It reads as one argument spoken aloud. Each side opens with a slide that
// walks you into the reasoning, then the slides that follow just continue the
// thought with no label on them. Nobody talks in bullet points, and nobody
// says "the case for" three times in a row.
//
// The art comes from everywhere, because the debate is about whether to look
// beyond your own borders. Illustrating that from a single canon would be an
// argument against the motion made by accident.
//
//   1  liberty      Delacroix, France      pride at its most seductive
//   2  observatory  Ottoman miniature      measuring yourself against the sky
//   3  cockaigne    Bruegel, Flanders      lying stuffed and idle, done running
//   4  babel        Bruegel, Flanders      the monument to self-regard that never finished
//   5  akbar        Akbarnama, Mughal      building the thing you believe in
//   6  qingming     Song dynasty, China    a city held up by the people in it
//   7  sorrow       Van Gogh, Netherlands  what measuring yourself against the rich does
//   8  mountains    Fan Kuan, China        the scale of what is left to climb
//   9  wanderer     Friedrich, Germany     one figure choosing what to measure himself against
//
// All public domain, via Wikimedia Commons.
const work: WorkSpec = {
  title: "National Pride Debate",
  date: "2026-07-19",
  formats: ["carousel-slide"],

  slides: [
    // 1. The hook. The motion, asked as a question.
    {
      template: "statement",
      kicker: "Coming Up Next",
      title: "Can too much national pride hold a country back?",
      oneLiner:
        "A question that has divided economists, policymakers and patriots.",
      image: { src: liberty, treatment: "full" },
    },

    // 2. Opens the case for by walking into the reasoning rather than
    //    announcing a position.
    {
      template: "statement",
      kicker: "The Case For",
      title: "Start with how anyone gets better at anything",
      oneLiner:
        "You find someone doing it better than you, and you study them. So what happens when pride makes that feel like disloyalty?",
      image: { src: observatory, treatment: "full", position: "center 40%" },
    },

    // 3 and 4. The thought continues. No labels.
    {
      template: "panel",
      kicker: "",
      title:
        "Pride quietly changes what you measure. You start judging yourself by how far you have come, not by how far you still have to go.",
      image: { src: cockaigne, position: "center 52%" },
    },
    {
      template: "panel",
      kicker: "",
      title:
        "And once that happens, you celebrate progress instead of chasing excellence. You stop running.",
      image: { src: babel, position: "center 40%" },
    },

    // 5. The other side opens by answering, not by starting over.
    {
      template: "statement",
      kicker: "The Case Against",
      title: "Now try taking the pride away",
      oneLiner:
        "Nobody has ever built anything for a country they were ashamed of. So what exactly would we build with?",
      image: { src: akbar, treatment: "full", position: "center 42%" },
    },

    // 6 and 7.
    {
      template: "panel",
      kicker: "",
      title:
        "Pride is what makes people stay, contribute, and believe the thing can actually work.",
      image: { src: qingming, position: "center 60%" },
    },
    {
      template: "panel",
      kicker: "",
      title:
        "And measure yourself only against the rich, and you do not learn ambition. You learn resentment, and the quiet belief that you will never catch up.",
      image: { src: sorrow, position: "center 30%" },
    },

    // 8. The core conflict, put as a question rather than a table.
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
      image: { src: mountains, position: "center 8%" },
    },

    // 9. The room. The motion, finally stated as the thing you will vote on.
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
