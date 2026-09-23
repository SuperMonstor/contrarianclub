import type { WorkSpec } from "../../src/core/types";
import carnivalSrc from "./assets/carnival.jpg";
import collectorsSrc from "./assets/collectors.jpg";
import { type Plate, Poster } from "./slides";

// Debate Club #11, Sunday 27 September, Big Pitcher. One poster.
//
// The club is trying something it has not tried before: the themes are
// announced now, the motions only in the room. So this poster prints neither
// motion, which is the one time the house rule about setting motions verbatim
// does not apply. The full text of both is in copy.md, held back, and goes on
// the handout and the recap unchanged.
//
// The reasoning behind the composition is in slides.tsx. The short version:
// both motions ask the same thing, so the theme asks it, and each half of the
// page names only what the demand would be for. The paintings do the rest.
//
// The held back motions, for whoever writes the handout:
//
//   1. This Club Believes That Indians Should Sacrifice Public Festival
//      Celebrations Abroad To Protect India's Global Image.
//   2. This Club Would Impose a Higher Income Tax on Adults Who Voluntarily
//      Choose to Remain Childfree.

const carnival: Plate = {
  src: carnivalSrc,
  ratio: 3000 / 2145,
  art: "wo-art-carnival",
};

const collectors: Plate = {
  src: collectorsSrc,
  ratio: 3226 / 4000,
  art: "wo-art-collectors",
};

const work: WorkSpec = {
  title: "Debate Club #11, what can India ask of you",
  date: "2026-09-27",
  formats: ["ig-portrait", "ig-story"],

  slides: [
    {
      label: "Poster",
      hasImage: true,
      render: ({ format }) => (
        <Poster
          format={format}
          copy={{
            edition: "Debate Club #11",
            details: ["Sunday, 27 September", "2 to 5 pm", "Big Pitcher, Indiranagar"],
            themeLabel: "Theme",
            theme: ["What can India", "ask of you?"],
            halves: [
              {
                numeral: "I",
                label: "For India's image",
                plate: carnival,
                // a full height slice through the carnival half of the square,
                // at the smallest scale that covers the panel: rooftops, the
                // notable couple and their fool, Carnival on his barrel
                crop: { x: 0.42, y: 0.5, scale: 1 },
              },
              {
                numeral: "II",
                label: "For India's future",
                plate: collectors,
                // the clerk who looks back at you, the finger on the ledger,
                // and the coins under the notice
                crop: { x: 0.62, y: 0.4, scale: 2.3 },
              },
            ],
            notice: "Full motions revealed on the day.",
            lines: [
              "Debaters drawn at random.",
              "The floor opens to everyone.",
              "Limited seats, so everyone speaks.",
            ],
            cta: "Tickets out now",
          }}
        />
      ),
    },
  ],
};

export default work;
