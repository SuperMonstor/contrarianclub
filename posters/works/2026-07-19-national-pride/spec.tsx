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
import { Beat, ChapterOpen, Conflict, Hook, Invite } from "./slides";

// Instagram carousel for the 19 July debate. Copy decisions and the rejected
// motion wordings are in copy.md; the design reasoning is in slides.tsx.
//
// Nine slides, hand-built. It reads as one argument spoken aloud: each side
// opens with a slide that walks you into the reasoning, and the slides after
// it carry no label, they just continue the thought.
//
// The art comes from everywhere, because the debate is about whether to look
// beyond your own borders. Illustrating that from a single canon would be an
// argument against the motion made by accident.
//
//   1  liberty      Delacroix, France      pride at its most seductive
//   2  observatory  Ottoman miniature      measuring yourself against the sky
//   3  cockaigne    Bruegel, Flanders      lying stuffed and idle, done running
//   4  babel        Bruegel, Flanders      the monument to self-regard, unfinished
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
      template: Hook,
      kicker: "Coming Up Next",
      title: "Can too much national pride hold a country back?",
      oneLiner:
        "A question that has divided economists, policymakers and patriots.",
      image: { src: liberty, position: "center 32%" },
    },

    // 2. Chapter I. Walks into the reasoning rather than announcing a position.
    {
      template: (p) => <ChapterOpen spec={p.spec} side="for" numeral="I" />,
      kicker: "The Case For",
      title: "Start with how anyone gets better",
      oneLiner:
        "You find a country doing better than you, and you study them. What happens when pride makes that comparison feel like disloyalty?",
      image: { src: observatory, position: "center 34%" },
    },

    // 3 and 4. The thought continues. No labels.
    {
      template: (p) => <Beat spec={p.spec} side="for" index={0} total={2} />,
      kicker: "",
      title:
        "Pride quietly changes what you measure. You start judging yourself by how far you have come, not by how far you still have to go.",
      image: { src: cockaigne, position: "center 54%" },
    },
    {
      template: (p) => <Beat spec={p.spec} side="for" index={1} total={2} />,
      kicker: "",
      title:
        "And once that happens, you celebrate progress instead of chasing excellence. You stop running.",
      image: { src: babel, position: "center 38%" },
    },

    // 5. Chapter II. The other side answers rather than starting over.
    {
      template: (p) => <ChapterOpen spec={p.spec} side="against" numeral="II" />,
      kicker: "The Case Against",
      title: "Now try taking the pride away",
      oneLiner:
        "Nobody has ever built anything for a country they were ashamed of. So what exactly would we build with?",
      image: { src: akbar, position: "center 38%" },
    },

    // 6 and 7.
    {
      template: (p) => <Beat spec={p.spec} side="against" index={0} total={2} />,
      kicker: "",
      title:
        "Pride is what makes people stay, contribute, and believe the thing can actually work.",
      image: { src: qingming, position: "center 62%" },
    },
    {
      template: (p) => <Beat spec={p.spec} side="against" index={1} total={2} />,
      kicker: "",
      title:
        "Measure yourself only against other countries, and you do not learn ambition. You learn resentment, and the quiet belief that you will never catch up.",
      image: { src: sorrow, position: "center 26%" },
    },

    // 8. The conflict. The plate splits in two.
    {
      template: Conflict,
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
      image: { src: mountains, position: "center 10%" },
    },

    // 9. The room. The motion, finally stated as the thing you vote on.
    {
      template: Invite,
      kicker: "Next Debate",
      title: "National pride is a barrier to progress",
      oneLiner: "Because it discourages international comparison.",
      details: [
        { label: "Date", value: "Sunday, 19 July" },
        { label: "Time", value: "1:00 pm onwards" },
        { label: "Tickets", value: "Offlyn" },
        { label: "Where", value: "Underground Comedy Club, Koramangala" },
      ],
      closing: "The side that moves the most minds wins.",
      image: { src: wanderer, position: "center 40%" },
    },
  ],
};

export default work;
