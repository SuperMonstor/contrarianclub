import type { CSSProperties, ReactNode } from "react";
import { Lockup } from "../../src/core/kit";
import "./slides.css";

// Debate Club #11, both motions, as a pair of 2 x 6in bookmarks. Handed out on
// the night and kept afterwards, which is the only reason to print a motion on
// a strip of card. Class names are prefixed bm11-.
//
// What a bookmark has to do that a post does not:
//
//   It is held, not scrolled, so type can go small and reward a closer look.
//   Most of the time it sits in a book with the top inch and a half showing,
//   so the top carries identity: the lockup and the painting, nothing that
//   needs finishing.
//   It is cut by a machine with a tolerance, so nothing meaningful goes within
//   0.22in of the trim (SAFE), and no type is set under 6pt (MICRO).
//
// THE GRAMMAR THE PAIR SHARES
//
//   The painting.   Runs off the top and both sides, into the bleed, and
//                   darkens into the ground under it. No window, no frame.
//                   Each is the painting its motion's campaign used: Bruegel's
//                   carnival from the poster for motion one, the Arnolfini
//                   couple from the carousel for motion two.
//   The label.      "Debate Club #11" and which motion it is, in plain
//                   sentence case. No numeral.
//   The motion.     Verbatim, the wording the room votes on, under the club's
//                   lead-in set smaller in the same face. Nothing on either
//                   piece is larger.
//   The fact.       One, with its source under it in the smallest type.
//   The foot.       A plain hairline, the night and the room, then the handle.
//
//   Gold marks one thing on each piece: the handle, the one thing a person is
//   asked to do after the night. See "Avoid AI design tells" in the root
//   CLAUDE.md for what is deliberately not here.
//
// THE ONE VARIABLE
//
// The motions are different lengths, so each sets its own size and the
// painting takes whatever height is left. The sentence is fixed and the
// picture yields, not the reverse.

/** Every horizontal inset, in px at 300ppi. 66px is 0.22in: clear of the
 *  0.2in a guillotine needs, by a sixteenth. */
const SAFE = 66;

/** The floor for any type. 26px is 6.2pt, over the 6pt trade printers ask
 *  for reversed type. */
const MICRO = 26;

const TRIM_W = 600;

export interface Plate {
  src: string;
  ratio: number;
  /** the treatment class in slides.css */
  art: string;
  /** what the picture is, printed small under the foot */
  credit: string;
}

/** Where in the painting to centre, and how far in. x and y are fractions of
 *  the painting; scale 1 means the painting is exactly the trim width. A
 *  scale too small to cover the window is raised until it does. */
export interface Crop {
  x: number;
  y: number;
  scale: number;
}

/** The painting, cut to a window that is the full trim width by `height`, and
 *  then run out past the trim by the bleed on the top and both sides. */
function Painting({
  plate,
  crop,
  height,
  bleed,
}: {
  plate: Plate;
  crop: Crop;
  height: number;
  bleed: number;
}) {
  const W = TRIM_W + bleed * 2;
  const H = height + bleed;
  const minScale = Math.max(W, H * plate.ratio) / TRIM_W;
  const w = TRIM_W * Math.max(crop.scale, minScale);
  const h = w / plate.ratio;
  const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, overflow: "hidden" }}>
      <img
        className={plate.art}
        src={plate.src}
        alt=""
        style={{
          position: "absolute",
          width: w,
          height: h,
          maxWidth: "none",
          left: clamp(W / 2 - crop.x * w, W - w, 0),
          top: clamp(H / 2 - crop.y * h, H - h, 0),
        }}
      />
      <div className="bm11-fade" />
    </div>
  );
}

const SMALL: CSSProperties = {
  fontFamily: "var(--cc-font-ui)",
  fontWeight: 500,
  fontSize: MICRO,
  lineHeight: 1.35,
  margin: 0,
  color: "var(--cc-muted)",
};

function Gap({ h }: { h: number }) {
  return <div style={{ flex: "none", height: h }} />;
}

/** One bookmark. Both pieces are this component with different arguments. */
export function MotionBookmark({
  plate,
  crop,
  plateHeight,
  label,
  formula,
  motion,
  motionSize,
  fact,
  source,
  when,
  where,
  handle,
  bleed = 0,
}: {
  plate: Plate;
  crop: Crop;
  /** how much of the trim the painting takes, measured from the top */
  plateHeight: number;
  label: string;
  formula: string;
  /** the claim, worded exactly as the room will vote on it */
  motion: ReactNode;
  motionSize: number;
  fact: string;
  source: string;
  when: string;
  where: string;
  handle: string;
  bleed?: number;
}) {
  return (
    <div className="bm11-sheet">
      <Painting plate={plate} crop={crop} height={plateHeight} bleed={bleed} />
      <div className="bm11-top" style={{ height: 260 + bleed }} />

      {/* everything below is laid out on the trim, then moved in by the bleed,
          so the layout never changes between the two exports */}
      <div
        className="bm11-body"
        style={{
          left: bleed + SAFE,
          top: bleed,
          width: TRIM_W - SAFE * 2,
          height: 1800,
        }}
      >
        <Gap h={78} />
        <Lockup width={270} artwork="left" />

        <div style={{ flex: "none", height: plateHeight - 78 - 110 - 40 }} />

        <p className="bm11-on-art" style={{ ...SMALL, color: "var(--cc-parchment)" }}>
          {label}
        </p>
        <Gap h={30} />
        <p
          style={{
            margin: 0,
            fontFamily: "var(--cc-font-display)",
            fontWeight: 400,
            fontSize: 30,
            lineHeight: 1.25,
            color: "var(--cc-parchment)",
          }}
        >
          {formula}
        </p>
        <Gap h={12} />
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--cc-font-display)",
            fontWeight: 700,
            fontSize: motionSize,
            lineHeight: 1.18,
            letterSpacing: "-0.01em",
            color: "var(--cc-ivory)",
          }}
        >
          {motion}
        </h1>

        <div style={{ flex: 1, minHeight: 40 }} />

        <p
          style={{
            margin: 0,
            fontFamily: "var(--cc-font-display)",
            fontSize: 30,
            lineHeight: 1.32,
            fontVariantNumeric: "lining-nums",
            color: "var(--cc-parchment)",
          }}
        >
          {fact}
        </p>
        <Gap h={12} />
        <p style={SMALL}>{source}</p>

        <Gap h={40} />
        <div className="bm11-rule" />
        <Gap h={30} />
        <p
          style={{
            margin: 0,
            fontFamily: "var(--cc-font-display)",
            fontSize: 30,
            lineHeight: 1.3,
            color: "var(--cc-ivory)",
          }}
        >
          {when}
          <br />
          {where}
        </p>
        <Gap h={18} />
        <p style={{ ...SMALL, fontWeight: 600, color: "var(--cc-gold)" }}>{handle}</p>
        <Gap h={24} />
        <p style={{ ...SMALL, fontWeight: 400 }}>{plate.credit}</p>
        <Gap h={78} />
      </div>
    </div>
  );
}
