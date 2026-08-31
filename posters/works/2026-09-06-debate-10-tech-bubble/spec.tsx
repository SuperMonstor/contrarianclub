import type { WorkSpec } from "../../src/core/types";
import avenueSrc from "./assets/avenue.jpg";
import badge from "./assets/btw-badge.png";
import quaySrc from "./assets/quay.jpg";
import rooftopsSrc from "./assets/rooftops.jpg";
import towerSrc from "./assets/tower.jpg";
import { Beat, Hook, type Plate, Poster, Turn } from "./slides";

// Debate Club #10, at Bengaluru Tech Week 2026. Announcing the first of the
// two motions, revealed outright, on the last slide.
//
// The story the deck tells: the city was a slow, cheap, pleasant place, then
// an industry arrived and never stopped arriving, and the city underneath it
// was never built to match. Which is an argument for hitting the brakes, or
// an argument that the brakes are the wrong thing to reach for. That is the
// debate.
//
// The design reasoning, and why each picture is where it is, is in slides.tsx.
//
// The art, all public domain via Wikimedia Commons:
//
//   tower     Pieter Bruegel the Elder, The Tower of Babel (c. 1568, Museum
//             Boijmans Van Beuningen, Rotterdam). The smaller, darker second
//             Babel, not the Vienna panel that appears in the national pride
//             deck. Raw brick still going up at the top, finished storeys
//             already in shadow below, a harbour town at the foot that never
//             grew at all.
//   avenue    Meindert Hobbema, The Avenue at Middelharnis (1689). An empty
//             lane, tall trees, a big sky, and almost nobody in it.
//   rooftops  Gustave Doré, Over London by Rail, from London: A Pilgrimage
//             (1872). Back to back housing packed to the horizon under a
//             railway arch. A city with no room left in it.
//   quay      John Atkinson Grimshaw, Greenock (1882). A wet quay at dusk,
//             gaslight, masts, and one figure walking home.
//
// Every number on slide 3, 4 and 5 is sourced. If one ages out, change the
// number and its source together:
//
//   40% of India's IT exports, 2m+ tech jobs   industry reporting, 2024-25
//   3.3m (1991), 8.5m (2011), ~14m now         Census of India, projections
//   96 km of metro, Delhi 420                  BMRCL and DMRC, 2026
//   36 min per 10 km, second slowest           TomTom Traffic Index 2025
//   7,000 of ~16,000 borewells dry             reporting, summer 2024

const tower: Plate = {
  src: towerSrc,
  ratio: 4945 / 3973,
  art: "tb-art-tower",
  scrim: "tb-scrim",
};
const towerDusk: Plate = { ...tower, art: "tb-art-tower-dusk" };
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
const quay: Plate = {
  src: quaySrc,
  ratio: 4455 / 2880,
  art: "tb-art-night",
  // the open scrim, not the default: the default darkens the middle band,
  // which on this plate is the row of lit windows the slide is for
  scrim: "tb-scrim-open",
};

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
    // 1. The tower entire, before any slide is allowed to crop into anything.
    {
      label: "Hook",
      hasImage: true,
      render: () => (
        <Hook plate={tower} crop={{ x: 0.5, y: 0.5, scale: 1.62 }} badge={badge} />
      ),
    },

    // 2. The empty lane. The one slide in the deck that is allowed to be
    //    light, because it is the slide about the city being pleasant.
    {
      label: "What it was",
      hasImage: true,
      render: () => (
        <Beat plate={avenue} crop={{ x: 0.5, y: 0.55, scale: 1.9 }} kicker="1980">
          This was a retirement town. Gardens, pensioners, cheap rent, and a reputation
          for being pleasant and slow.
        </Beat>
      ),
    },

    // 3. Doré's rooftops, and the deck changes material. The industry arrives
    //    and the picture goes from an empty lane to a place with no gaps in it.
    {
      label: "What happened",
      hasImage: true,
      render: () => (
        <Beat
          plate={rooftops}
          crop={{ x: 0.5, y: 0.45, scale: 2.2 }}
          kicker="Then"
          footnote="Roughly 40% of India's IT exports. Over two million people working in tech."
        >
          The software companies put down roots. The startups followed them. A generation
          moved here to work for one or the other, and kept coming.
        </Beat>
      ),
    },

    // 4. No picture. The slide about the part of the city that was never built
    //    is the one slide with nothing behind the words, and it is the only
    //    place in the deck where that reads as meaning rather than as a gap.
    {
      label: "What did not",
      render: () => (
        <Beat
          kicker="Meanwhile"
          size={54}
          footnote={
            <>
              3.3 million people in 1991. Around 14 million now.
              <br />
              96 km of metro in fifteen years. Delhi has 420.
            </>
          }
        >
          The industry doubled, and doubled again. The city underneath it stayed roughly
          the size it always was.
        </Beat>
      ),
    },

    // 5. Grimshaw's quay: the only slide where the picture is lifted rather
    //    than knocked back. One person walking home in the wet, which is the
    //    whole of what the numbers under it actually mean.
    {
      label: "The cost",
      hasImage: true,
      render: () => (
        <Beat
          plate={quay}
          crop={{ x: 0.68, y: 0.5, scale: 2.0 }}
          kicker="Where you feel it"
          footnote="TomTom Traffic Index 2025. Reporting on the 2024 water crisis."
        >
          It takes 36 minutes to cross ten kilometres, and only Mexico City is slower. In
          the summer of 2024, seven thousand borewells ran dry.
        </Beat>
      ),
    },

    // 6. The tower again, almost a silhouette. The pause, and the sentence the
    //    motion answers.
    {
      label: "The turn",
      hasImage: true,
      render: () => (
        <Turn plate={towerDusk} crop={{ x: 0.5, y: 0.48, scale: 1.68 }}>
          Every answer so far has been more. More flyovers, more layouts, more people.
          Nobody has argued for less.
        </Turn>
      ),
    },

    // 7. The motion, and the poster. This slide has to stand alone as a single
    //    image, so it carries the mark, the motion, the night and the festival.
    {
      label: "Motion and poster",
      hasImage: true,
      render: () => (
        <Poster
          plate={tower}
          crop={{ x: 0.5, y: 0.38, scale: 1.78 }}
          badge={badge}
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
