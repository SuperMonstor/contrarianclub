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
};

const arnolfini: Plate = {
  src: arnolfiniSrc,
  ratio: 3801 / 5200,
  art: "bm11-art-arnolfini",
};

const LABEL = "Debate Club #11, 27 September 2026";
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
          plateHeight={1200}
          label={LABEL}
          formula="This Club Believes that"
          motion={<>Indians should sacrifice public festival celebrations abroad to protect India&rsquo;s global image</>}
          motionSize={48}
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
          plateHeight={1160}
          label={LABEL}
          formula="This Club Would"
          motion={
            <>
              make eligibility for the legal and financial benefits of marriage conditional on
              having a child within five years of marriage
            </>
          }
          motionSize={40}
          handle={HANDLE}
        />
      ),
    },
  ],
};

export default work;
