import type { WorkSpec } from "../../src/core/types";
import obligation from "./assets/obligation.jpg";
import { Poster } from "./slides";

// Debate Club #9. Two motions, one axis: personal autonomy against social
// obligation. The motions themselves are withheld until the room, so the
// poster sells the axis rather than the questions.
//
// The design reasoning is in slides.tsx.
//
// The art, public domain via Wikimedia Commons: Edgar Degas, The Bellelli
// Family (1858-67). A family arranged for the record, mother in mourning
// black, the daughters posed between, and the father turned away from all of
// them in his own chair. The whole motion is in one picture, which is why it
// runs alone: an earlier cut paired it with a Ravi Varma, and two paintings
// cropped into columns read as two damaged reproductions rather than one
// argument.
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
            art: {
              src: obligation,
              position: "center center",
              className: "pa-art-obligation",
            },
            hero: ["Personal Autonomy", "Social Obligation"],
            oneLiner: "Two motions on where one ends and the other begins.",
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
