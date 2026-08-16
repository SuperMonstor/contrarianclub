import type { WorkSpec } from "../../src/core/types";
import obligation from "./assets/obligation.jpg";
import { Close, Motion, Poster, Question, R } from "./slides";

// Debate Club #9. Two motions, one axis: personal autonomy against social
// obligation. The motions are withheld until the room, so the deck teases them
// by printing them with their load bearing words blacked out.
//
// The design reasoning is in slides.tsx.
//
// The art, public domain via Wikimedia Commons: Edgar Degas, The Bellelli
// Family (1858-67). A family arranged for the record, mother in mourning
// black, the daughters posed between, and the father turned away from all of
// them in his own chair. One painting for all six slides: slide 1 shows the
// room entire, the middle slides move in close on it, slide 6 pulls back out.
//
// Which detail carries which slide is not decoration. The family motion sits
// on the mother and her daughters. The self destruction motion sits on the
// father, who has turned his back on the whole arrangement.
const LINES = [
  "Debaters drawn at random.",
  "The floor opens to everyone.",
  "Limited seats, so everyone speaks.",
];
const CTA = "Tickets out now";

const work: WorkSpec = {
  title: "Debate Club #9, autonomy vs obligation",
  date: "2026-08-16",
  formats: ["carousel-slide"],

  slides: [
    // 1. The poster, up front. The whole offer in one frame, and the room
    //    established entire before any slide crops into it.
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
            lines: LINES,
            cta: CTA,
          }}
        />
      ),
    },

    // 2. The first motion, four words short. What survives the bars still says
    //    something at the expense of individual autonomy, so the reader knows
    //    the shape of the argument and not the target.
    {
      label: "Motion one",
      hasImage: true,
      render: () => (
        <Motion
          src={obligation}
          focus={{ x: 0.28, y: 0.55, scale: 2.2 }}
          kicker="Motion One"
          text={
            <>
              This House Believes that <R>Indian</R> <R>society</R> places too much
              emphasis on <R>familial</R> <R>obligation</R> at the expense of individual
              autonomy.
            </>
          }
          withheld="Four words withheld"
        />
      ),
    },

    // 3. What that motion is really asking, on the mother's face.
    {
      label: "Question one",
      hasImage: true,
      render: () => (
        <Question
          src={obligation}
          focus={{ x: 0.27, y: 0.3, scale: 3.2 }}
          text={<>How much of your life belongs to the people who raised you?</>}
        />
      ),
    },

    // 4. The second motion, also four words short, on the father who has
    //    turned away from the room.
    {
      label: "Motion two",
      hasImage: true,
      render: () => (
        <Motion
          src={obligation}
          focus={{ x: 0.82, y: 0.42, scale: 2.4 }}
          kicker="Motion Two"
          lift
          text={
            <>
              Respecting personal autonomy requires <R>society</R> to tolerate <R>self</R>{" "}
              <R>destructive</R> <R>choices</R>.
            </>
          }
          withheld="Four words withheld"
        />
      ),
    },

    // 5. The second question. Short enough to land as a dare.
    {
      label: "Question two",
      hasImage: true,
      render: () => (
        <Question
          src={obligation}
          focus={{ x: 0.8, y: 0.46, scale: 3.4 }}
          text={<>Is it your life to ruin?</>}
        />
      ),
    },

    // 6. The close, in the room the deck opened in, and the one slide that
    //    says the withholding out loud instead of leaving it as an omission.
    {
      label: "Close",
      hasImage: true,
      render: () => (
        <Close
          art={{
            src: obligation,
            position: "center center",
            className: "pa-art-obligation",
          }}
          hero={["Motions revealed", "in the room"]}
          oneLiner="Nobody sees them beforehand, so nobody arrives with a prepared case."
          lines={LINES}
          cta={CTA}
        />
      ),
    },
  ],
};

export default work;
