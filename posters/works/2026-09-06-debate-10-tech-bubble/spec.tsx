import type { WorkSpec } from "../../src/core/types";
import avenueSrc from "./assets/avenue.jpg";
import badge from "./assets/btw-badge.png";
import quaySrc from "./assets/quay.jpg";
import rooftopsSrc from "./assets/rooftops.jpg";
import towerSrc from "./assets/tower.jpg";
import { Beat, Hook, type Plate, Poster } from "./slides";

// Debate Club #10, at Bengaluru Tech Week 2026. Announcing the first of the
// two motions, revealed outright, on the last slide.
//
// The copy is one continuous voice across eight slides and is meant to be read
// straight through. Anyone editing a line should read the slide before it and
// the slide after it first: every one of them opens on a connective and closes
// on something unfinished, and that is the whole reason the deck gets swiped.
//
// The design reasoning, and why each picture is where it is, is in slides.tsx.
//
// The art, all public domain via Wikimedia Commons:
//
//   avenue    Meindert Hobbema, The Avenue at Middelharnis (1689). An empty
//             lane, tall trees, a big sky, almost nobody in it. Opens the deck
//             as the slow town, and returns on slide 7 as the argument for
//             less, which was on the page before anyone made it.
//   rooftops  Gustave Doré, Over London by Rail, from London: A Pilgrimage
//             (1872). Back to back housing packed to the horizon under a
//             railway arch. A city with no room left in it.
//   tower     Pieter Bruegel the Elder, The Tower of Babel (c. 1568, Museum
//             Boijmans Van Beuningen, Rotterdam). The smaller, darker second
//             Babel, not the Vienna panel that appears in the national pride
//             deck. Raw brick still going up at the top, finished storeys
//             already in shadow below. The thing that outgrew its own footing.
//   quay      John Atkinson Grimshaw, Greenock (1882). A wet quay at dusk,
//             gaslight, masts, and one figure walking home.
//
// The numbers in the footnotes are sourced. If one ages out, change the number
// and its source together:
//
//   40% of India's IT exports, 2m+ tech jobs   industry reporting, 2024-25
//   3.3m (1991), ~14m now                      Census of India, projections
//   96 km of metro, Delhi 420                  BMRCL and DMRC, 2026
//   36 min per 10 km, second slowest           TomTom Traffic Index 2025
//   7,000 of ~16,000 borewells dry             reporting, summer 2024

const avenue: Plate = {
  src: avenueSrc,
  ratio: 4200 / 3110,
  art: "tb-art-avenue",
  scrim: "tb-scrim-open",
};
const rooftops: Plate = {
  src: rooftopsSrc,
  ratio: 3904 / 3160,
  art: "tb-art-engraving",
  scrim: "tb-scrim-dense",
};
const tower: Plate = {
  src: towerSrc,
  ratio: 4945 / 3973,
  art: "tb-art-tower",
  scrim: "tb-scrim",
};
const towerDusk: Plate = { ...tower, art: "tb-art-tower-dusk" };
const quay: Plate = {
  src: quaySrc,
  ratio: 4455 / 2880,
  art: "tb-art-night",
  // the open scrim, not the default: the default darkens the middle band,
  // which on this plate is the row of lit windows the slide is for
  scrim: "tb-scrim-open",
};

const OF = 8;

const HOW_IT_WORKS = [
  "Debaters drawn at random.",
  "The floor opens to everyone.",
  "Limited seats, so everyone speaks.",
];

const work: WorkSpec = {
  title: "Debate Club #10, Bengaluru's tech bubble",
  date: "2026-09-06",
  formats: ["carousel-slide"],

  slides: [
    // 1. The question, on the empty lane. The picture is doing the second half
    //    of the copy's job before the copy gets there.
    {
      label: "The question",
      hasImage: true,
      render: () => (
        <Hook
          plate={avenue}
          crop={{ x: 0.5, y: 0.5, scale: 1.82 }}
          badge={badge}
          question={["So, how did", "Bengaluru become", "Bengaluru?"]}
          lines={[
            "For most of the last century, it was basically a retirement town.",
            { text: "Gardens, pensioners, cheap rent, and not much else.", tone: "parchment" },
          ]}
          cta="Swipe to see what happened next →"
          ctaNote="The motion is on the last slide"
        />
      ),
    },

    // 2. Doré's rooftops, and the deck changes material. The lane had gaps in
    //    it; this has none.
    {
      label: "They arrived",
      hasImage: true,
      render: () => (
        <Beat
          plate={rooftops}
          crop={{ x: 0.5, y: 0.45, scale: 2.2 }}
          n={2}
          of={OF}
          footnote="Roughly 40% of India's IT exports. Over two million people working in tech."
          lines={[
            "Then, somewhere along the way, the software companies arrived.",
            "Startups came next.",
            "And then an entire generation started moving here to work for one or the other.",
            { text: "And they just… kept coming.", tone: "parchment" },
          ]}
          size={42}
        />
      ),
    },

    // 3. The tower, and the one slide where the type does what the sentence
    //    says: three lines about growth set at three growing sizes, then two
    //    lines about the city that stay where they were.
    {
      label: "It grew",
      hasImage: true,
      render: () => (
        <Beat
          plate={tower}
          crop={{ x: 0.5, y: 0.42, scale: 1.74 }}
          n={3}
          of={OF}
          footnote="3.3 million people in 1991, around 14 million now. 96 km of metro. Delhi has 420."
          lines={[
            { text: "The tech industry grew.", size: 42 },
            { text: "Then it grew some more.", size: 56 },
            { text: "And then it grew a lot.", size: 76 },
            "",
            { text: "The city, though?", size: 42, tone: "parchment" },
            { text: "It didn't quite keep up.", size: 42, tone: "parchment" },
          ]}
        />
      ),
    },

    // 4. Grimshaw's quay: the only plate that is lifted rather than knocked
    //    back. One person walking home in the wet, which is what the numbers
    //    on this slide actually mean.
    {
      label: "What it feels like",
      hasImage: true,
      render: () => (
        <Beat
          plate={quay}
          crop={{ x: 0.68, y: 0.5, scale: 2.0 }}
          n={4}
          of={OF}
          footnote="TomTom Traffic Index 2025. Reporting on the 2024 water crisis."
          lines={[
            "You probably know what that feels like.",
            "",
            "Thirty-six minutes to cross ten kilometres.",
            "Borewells running dry.",
            {
              text: "Roads, water, housing and public transport struggling to keep up with a city that keeps getting bigger.",
              size: 36,
              tone: "parchment",
            },
          ]}
          size={44}
        />
      ),
    },

    // 5. No picture. The word is the picture, and it is the only slide where
    //    repetition is the content rather than a failure of one.
    {
      label: "More",
      render: () => (
        <Beat
          n={5}
          of={OF}
          shout={{ text: "More.", size: 128 }}
          lines={[
            "More flyovers.",
            "More layouts.",
            "More people.",
            "More growth.",
            "",
            {
              text: "We keep trying to build our way out of the problem.",
              size: 36,
              tone: "parchment",
            },
          ]}
          size={44}
        />
      ),
    },

    // 6. The tower again, almost a silhouette. The turn, and a real question
    //    rather than a jab: the deck has to leave both sides of this arguable.
    {
      label: "The turn",
      hasImage: true,
      render: () => (
        <Beat
          plate={towerDusk}
          crop={{ x: 0.5, y: 0.46, scale: 1.68 }}
          n={6}
          of={OF}
          lines={[
            { text: "But here's the interesting question:", size: 38, tone: "parchment" },
            "",
            { text: "What if more is actually the problem?", size: 48, tone: "gold" },
            "",
            {
              text: "What if Bengaluru's tech industry grew faster than the city could accommodate?",
              size: 42,
            },
          ]}
        />
      ),
    },

    // 7. The avenue returns, close on the lane this time. The slide arguing
    //    for less is the picture the deck opened on, which is the quietest way
    //    to make that case.
    {
      label: "Or less",
      hasImage: true,
      render: () => (
        <Beat
          plate={avenue}
          crop={{ x: 0.5, y: 0.66, scale: 2.6 }}
          n={7}
          of={OF}
          lines={[
            "And if that's true, maybe the answer isn't to make the tech bubble bigger.",
            { text: "Maybe it's to make it smaller.", tone: "parchment" },
            "",
            { text: "Could we actually need less tech to save Bengaluru?", size: 56, tone: "gold" },
          ]}
          size={42}
        />
      ),
    },

    // 8. The motion, and the poster. This slide has to stand alone as a single
    //    image, so it carries the mark, the motion, the night and the festival.
    {
      label: "Motion and poster",
      hasImage: true,
      render: () => (
        <Poster
          plate={tower}
          crop={{ x: 0.5, y: 0.38, scale: 1.78 }}
          badge={badge}
          handoff="That's what we're debating this Sunday."
          motion={["Bengaluru", "needs to burst", "its tech bubble."]}
          note="One of two motions. The second is announced closer to the night."
          when="Sunday, 6 September"
          where="Big Pitcher, Indiranagar"
          time="Time announced soon"
          lines={HOW_IT_WORKS}
          cta="Tickets out now"
        />
      ),
    },
  ],
};

export default work;
