import type { WorkSpec } from "../../src/core/types";
import autonomy from "./assets/autonomy.jpg";
import obligation from "./assets/obligation.jpg";
import { Poster } from "./slides";

// Debate Club #9. Two motions, one axis: personal autonomy against social
// obligation. The motions themselves are withheld until the room, so the
// poster sells the axis rather than the questions.
//
// The design reasoning is in slides.tsx.
//
// The art, both public domain via Wikimedia Commons:
//
//   left   Raja Ravi Varma, Shakuntala Lost in Thoughts (1901). A woman
//          alone, self-possessed, no one else in the picture. Warm, open,
//          outdoors.
//   right  Edgar Degas, The Bellelli Family (1858-67). A family posed as a
//          duty: mother in mourning black, the children arranged, the father
//          turned away. Cool, enclosed, interior.
//
// Warm and alone against cool and surrounded, so the two halves argue at
// thumbnail size before a word is read.
const work: WorkSpec = {
  title: "Debate Club #9, autonomy vs obligation",
  date: "2026-08-16",
  formats: ["ig-portrait"],

  slides: [
    {
      label: "Poster",
      hasImage: true,
      render: () => (
        <Poster
          copy={{
            kicker: "Debate Club #9",
            sides: [
              {
                label: "Personal",
                word: "Autonomy",
                size: 79,
                art: {
                  src: autonomy,
                  position: "68% center",
                  className: "pa-art-autonomy",
                },
              },
              {
                label: "Social",
                word: "Obligation",
                size: 72,
                art: {
                  src: obligation,
                  position: "24% center",
                  className: "pa-art-obligation",
                },
              },
            ],
            oneLiner: (
              <>
                Two motions on where one ends
                <br />
                and the other begins.
              </>
            ),
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
