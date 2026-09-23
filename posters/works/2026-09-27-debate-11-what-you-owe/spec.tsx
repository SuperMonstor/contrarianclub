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
// both motions ask the same thing, so the headline asks it, and the two panels
// answer it with what each motion would actually take.
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
  title: "Debate Club #11, what you owe the country",
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
            kicker: "Debate Club #11",
            hero: ["What should you", "sacrifice", "for India?"],
            oneLiner: "Two motions on that question. Both announced on the day.",
            themes: [
              {
                label: "One. For India's image",
                plate: carnival,
                // the carnival half of the square: the barrel, the pie hat and
                // the musicians, with the crowd still reading as a crowd
                crop: { x: 0.37, y: 0.775, scale: 4.4 },
                answer: ["Your festivals, when you", "hold them abroad."],
              },
              {
                label: "Two. For India's future",
                plate: collectors,
                // both faces and the ledger, with the coins left under the
                // scrim where they are a suggestion rather than the subject
                crop: { x: 0.5, y: 0.52, scale: 1.64 },
                answer: ["What you never spent", "on children."],
              },
            ],
            when: "Sunday, 27 September",
            where: "2 to 5 pm, Big Pitcher, Indiranagar",
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
