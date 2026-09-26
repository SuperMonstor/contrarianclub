import type { WorkSpec } from "../../src/core/types";
import arnolfiniSrc from "./assets/arnolfini.jpg";
import carnivalSrc from "./assets/carnival.jpg";
import { MotionBookmark, type Plate } from "./slides";

// Debate Club #11, Sunday 27 September, Big Pitcher, Indiranagar. Both motions
// as a pair of 2 x 6in bookmarks, handed out on the night. The design
// reasoning is in slides.tsx.
//
// Both motions are worded exactly as the handouts word them, because the room
// votes on that wording. The source of truth is
// handouts/2026-09-27-debate-11-*/debate.js; if a motion changes there, it
// changes here.
//
// The facts, one each:
//
//   I   anti-Indian posts on X nearly tripled   Network Contagion Research
//       in 2025                                 Institute, 11 March 2026. The
//                                               same source as the motion one
//                                               carousel.
//   II  1.9 children per woman in India;        UNFPA, State of World
//       2.1 is replacement                      Population 2025. The same
//                                               source as the marriage
//                                               carousel.
//
// The pictures, both public domain, both the same files their campaigns used:
//
//   carnival   Bruegel, The Fight Between Carnival and Lent, 1559. Cut in on
//              Carnival himself, riding his barrel, because a strip 2in wide
//              cannot hold the whole square.
//   arnolfini  Jan van Eyck, The Arnolfini Portrait, 1434. Pushed in on the
//              couple and held to the top, so both faces sit clear of the
//              lockup.

const carnival: Plate = {
  src: carnivalSrc,
  ratio: 3000 / 2145,
  art: "bm11-art-carnival",
  credit: "Pieter Bruegel the Elder, The Fight Between Carnival and Lent, 1559.",
};

const arnolfini: Plate = {
  src: arnolfiniSrc,
  ratio: 3801 / 5200,
  art: "bm11-art-arnolfini",
  credit: "Jan van Eyck, The Arnolfini Portrait, 1434.",
};

const WHEN = "Sunday, 27 September";
const WHERE = "Big Pitcher, Indiranagar";
const HANDLE = "@thecontrarian.club";

const work: WorkSpec = {
  title: "Debate Club #11, both motions, bookmarks",
  date: "2026-09-27",
  formats: ["bookmark", "bookmark-bleed"],
  slides: [
    {
      label: "Motion one",
      hasImage: true,
      render: ({ format }) => (
        <MotionBookmark
          bleed={format.bleed}
          plate={carnival}
          crop={{ x: 0.38, y: 0.72, scale: 3.4 }}
          plateHeight={820}
          label="Debate Club #11, motion one of two"
          formula="This Club Believes that"
          motion={<>Indians should sacrifice public festival celebrations abroad to protect India&rsquo;s global image</>}
          motionSize={42}
          fact="Anti-Indian posts on X nearly tripled in 2025."
          source="Network Contagion Research Institute, March 2026."
          when={WHEN}
          where={WHERE}
          handle={HANDLE}
        />
      ),
    },
    {
      label: "Motion two",
      hasImage: true,
      render: ({ format }) => (
        <MotionBookmark
          bleed={format.bleed}
          plate={arnolfini}
          crop={{ x: 0.5, y: 0, scale: 1.6 }}
          plateHeight={760}
          label="Debate Club #11, motion two of two"
          formula="This Club Would"
          motion={
            <>
              make eligibility for the legal and financial benefits of marriage conditional on
              having a child within five years of marriage
            </>
          }
          motionSize={36}
          fact="The average Indian woman now has 1.9 children. A population needs 2.1 to replace itself."
          source="UNFPA, State of World Population 2025."
          when={WHEN}
          where={WHERE}
          handle={HANDLE}
        />
      ),
    },
  ],
};

export default work;
