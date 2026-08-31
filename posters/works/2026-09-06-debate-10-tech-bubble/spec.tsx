import type { WorkSpec } from "../../src/core/types";
import badge from "./assets/btw-badge.png";
import tower from "./assets/tower.jpg";
import { Boom, Growth, Hook, Ledger, Motion, Night, Numeral, Turn } from "./slides";

// Debate Club #10. Announcing the first of two motions, at Bengaluru Tech
// Week 2026. The design reasoning is in slides.tsx.
//
// The art, public domain via Wikimedia Commons: Pieter Bruegel the Elder,
// The Tower of Babel (c. 1568, Museum Boijmans Van Beuningen, Rotterdam).
// This is the smaller, darker second Babel, not the Vienna panel that appears
// as one slide of the national pride deck. Reusing the subject is deliberate:
// the unfinished tower is the club's picture for building past your own
// footings, and this motion is that argument about one city. Using a
// different canvas of it keeps the archive from repeating an image.
//
// Every crop below is a fraction of that one painting. Which crop lands on
// which slide carries the argument: the boom on the raw red top storeys that
// are still going up, the ledger on the finished masonry, the last two slides
// on the small harbour town at the foot that never grew at all.
//
// The numbers are all sourced and printed on slide 4. If any of them age out,
// change the number and the source line together.

const LINES = [
  "Debaters drawn at random.",
  "The floor opens to everyone.",
  "Limited seats, so everyone speaks.",
];
const CTA = "Tickets out now";

const work: WorkSpec = {
  title: "Debate Club #10, Bengaluru's tech bubble",
  date: "2026-09-06",
  formats: ["carousel-slide"],

  slides: [
    // 1. The tower entire, and the thesis in three words. The room is
    //    established before any slide is allowed to crop into it.
    {
      label: "Hook",
      hasImage: true,
      render: () => <Hook src={tower} crop={{ x: 0.5, y: 0.5, scale: 1.62 }} badge={badge} />,
    },

    // 2. The raw red crown, still under construction. What the industry is
    //    worth, before anything about what it cost.
    {
      label: "Boom",
      hasImage: true,
      render: () => <Boom src={tower} crop={{ x: 0.45, y: 0.36, scale: 2.2 }} />,
    },

    // 3. The stacked storeys, because the slide is a stack. Three years, three
    //    numbers, and a year column that refuses to grow with them.
    {
      label: "Growth",
      hasImage: true,
      render: () => <Growth src={tower} crop={{ x: 0.46, y: 0.5, scale: 2.0 }} />,
    },

    // 4. The masonry, reduced to a surface, so the arches sit behind the rows
    //    as a grid and never compete with them.
    {
      label: "Ledger",
      hasImage: true,
      render: () => <Ledger src={tower} crop={{ x: 0.42, y: 0.62, scale: 2.4 }} />,
    },

    // 5. The base of the tower, where the ramps meet the ground. One number at
    //    the size of a picture.
    {
      label: "Commute",
      hasImage: true,
      render: () => <Numeral src={tower} crop={{ x: 0.4, y: 0.69, scale: 2.6 }} />,
    },

    // 6. Out to the open sky and the harbour on the right, and nothing on the
    //    page but the question. The only slide with no number on it.
    {
      label: "Turn",
      hasImage: true,
      render: () => (
        <Turn src={tower} crop={{ x: 0.7, y: 0.5, scale: 1.8 }}>
          What happens when the industry that made a city outgrows the city?
        </Turn>
      ),
    },

    // 7. Back to the tower entire, from slightly lower, and the motion said
    //    outright. No redactions this time.
    {
      label: "Motion",
      hasImage: true,
      render: () => <Motion src={tower} crop={{ x: 0.48, y: 0.46, scale: 1.74 }} />,
    },

    // 8. The harbour and the town at the foot of the tower, and the practical
    //    page. The club's mark at the left margin, the festival's at the right.
    //    Lifted off the very bottom corner, which is unlit paint and reads as a
    //    blank rectangle rather than as a place.
    {
      label: "The night",
      hasImage: true,
      render: () => (
        <Night
          src={tower}
          crop={{ x: 0.84, y: 0.58, scale: 2.9 }}
          badge={badge}
          lines={LINES}
          cta={CTA}
        />
      ),
    },
  ],
};

export default work;
