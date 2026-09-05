import type { WorkSpec } from "../../src/core/types";
import qingmingSrc from "./assets/qingming.jpg";
import towerSrc from "./assets/tower.jpg";
import { MotionBookmark, type Plate } from "./slides";

// Debate Club #10, 6 September 2026, at Big Pitcher, Indiranagar. Both motions
// as a pair of 2 x 6in bookmarks, handed out on the night.
//
// Two pieces, not two slides of one argument: they are handed out together and
// a person ends the evening holding both. The design reasoning is in
// slides.tsx.
//
// Both motions are worded exactly as the handouts word them, because the room
// votes on that wording and a bookmark that paraphrases it is wrong. The
// source of truth is handouts/2026-09-06-debate-10-*/debate.js, and if a
// motion changes there it changes here.
//
// The art, both public domain via Wikimedia Commons, and both already in the
// archive:
//
//   tower     Pieter Bruegel the Elder, The Tower of Babel (c. 1568, Museum
//             Boijmans Van Beuningen, Rotterdam). The darker second Babel,
//             not the Vienna panel. Raw brick still going up at the top,
//             finished storeys already in shadow below. It is the club's own
//             image for this motion: it carries slide 1 of the tech-bubble
//             deck, where the motion is announced.
//   qingming  After Zhang Zeduan, Along the River During the Qingming
//             Festival (c. 1120). Pushed into the packed quay under the
//             bridge rather than shown whole, because the whole scroll at 2in
//             reads as a landscape and the point of it is the crowd.
//
// THE NUMBERS
//
// Motion one's three lines are the sourced numbers from the tech-bubble deck,
// carried over unchanged. If one ages out, change the number and its source
// together, in both places:
//
//   40% of India's IT exports        industry reporting, 2024-25
//   3.3m (1991), ~14m now            Census of India, projections
//   7,000 of ~16,000 borewells dry   reporting, summer 2024
//
// Motion two has no sourced numbers anywhere in this repo, so its three lines
// are the club's own agreed ground and open question, taken from the `agreed`
// and `split` keys of the migrant-culture handout. They are claims the club
// has already committed to in print, which is the only kind of line that
// belongs on a piece going to a press without a citation behind it. If real
// migration or language figures are wanted here, add them with their source
// to the list above and swap them in.

const tower: Plate = {
  src: towerSrc,
  art: "d10-art-tower",
  height: 440,
  position: "48% 42%",
  caption: "Bruegel, The Tower of Babel, c. 1568. Built too high, too fast, on its own success.",
};

const qingming: Plate = {
  src: qingmingSrc,
  art: "d10-art-qingming",
  height: 356,
  position: "0% 50%",
  zoom: 2.1,
  focus: "0% 90%",
  caption:
    "Zhang Zeduan, Qingming scroll, c. 1120. A city held up by the people arriving in it.",
};

const work: WorkSpec = {
  title: "Debate 10, both motions, bookmarks",
  date: "2026-09-06",
  formats: ["bookmark", "bookmark-bleed"],
  slides: [
    {
      label: "I. Burst",
      hasImage: true,
      render: ({ format }) => (
        <MotionBookmark
          bleed={format.bleed}
          numeral="I"
          motionLabel="Motion one of two"
          plate={tower}
          motionSize={58}
          motion={
            <>
              Bengaluru
              <br />
              needs to burst
              <br />
              its tech bubble.
            </>
          }
          facts={[
            "40% of India's IT exports.",
            "3.3 million people in 1991. Around 14 million now.",
            "7,000 of about 16,000 borewells ran dry in one summer.",
          ]}
        />
      ),
    },
    {
      label: "II. Reshape",
      hasImage: true,
      render: ({ format }) => (
        <MotionBookmark
          bleed={format.bleed}
          numeral="II"
          motionLabel="Motion two of two"
          plate={qingming}
          motionSize={38}
          motion={
            <>
              Migrants to Bengaluru have the right to{" "}
              <span style={{ color: "var(--cc-gold)" }}>reshape</span> the city&rsquo;s culture,
              rather than merely adapt to it.
            </>
          }
          facts={[
            "You can live here ten years without Kannada and get by.",
            "No other Indian city is this relaxed about newcomers.",
            "The question is what that costs, and who pays it.",
          ]}
        />
      ),
    },
  ],
};

export default work;
