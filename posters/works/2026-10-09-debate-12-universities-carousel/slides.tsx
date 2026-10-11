import type { CSSProperties, ReactNode } from "react";
import { Lockup } from "../../src/core/kit";
import "./slides.css";

// Debate Club #12, the Indian education system. The carousel for the motion on
// world-class universities. Class names are prefixed wu-.
//
// ---------------------------------------------------------------------------
// The story
//
//   1  India won't produce one any time soon          the claim
//   2  our best is 118th, nothing in the top 100       the scoreboard
//   3  the most competitive system, yet unemployable    the paradox
//   4  partly the people running them                  cause one
//   5  partly the way we look at education             cause two
//   6  the two feed each other; which changes first?   the crux
//   7  the motion, verbatim                            what the room argues
//   8  the Debate #12 poster                          the way in
//
// It is written as one person talking, in full sentences, because that is how
// the club speaks about this. Slides 4 and 5 are the club's two causes and
// carry equal weight: anyone editing a line should keep them even, because
// the motion only blames the second, and the room is there to argue whether
// the first matters more.
//
// ---------------------------------------------------------------------------
// The grammar
//
// ONE PICTURE, READ CLOSELY. Every slide is a piece of Raphael's School of
// Athens, the picture everyone reaches for when they imagine a great
// university. The deck walks through it while asking why India has not built
// one: the hall itself, the two globes (the world it is ranked against),
// Pythagoras with a crowd copying from his book, Plato and Aristotle at the
// head of the school, Heraclitus working alone, Euclid bent over a slate with
// his students, and the whole school at dusk. Then the deck hands over to
// the Debate #12 poster itself, so it ends on the event.
//
// The fresco is pale (stone, sky, white marble), so it is taken down further
// than the standard treatment, and only the text zones go near-black.
//
// THE HOOK IS THE ONE SHOUT. The claim is set in the condensed face, as
// large as it fits, under the hall. It says "won't", not "can't", on purpose:
// it is a forecast, which is what the motion is, rather than a verdict on the
// country. Everything after it is Playfair talking.
//
// NOT EVERY SLIDE IS THE SAME SLIDE. The lower figures sit near the foot of
// the fresco, so those slides talk at the head and leave the figures below
// (3 and 5). The higher ones talk at the foot (2 and 4). Slide 6 opens at
// the head and lands its question at the foot, with Euclid between. Slide 7
// pulls back to the whole school, at dusk.
//
// NOTHING DECORATIVE. No frame over the picture, no ticks before labels, no
// glow behind type, no fading rules, no stat set huge on its own. See "Avoid
// AI design tells" in the root CLAUDE.md.
//
// GOLD MEANS ONE THING PER SLIDE, and most slides have none. It marks the
// question the deck exists for on slide 6, and nothing else.
// No tracked caps anywhere. Sources, credits and the counter are plain muted
// type in sentence case.

const W = 1080;
const H = 1350;
const MARGIN = 92;

/** The division above the small print. Same height on every slide. */
const RULE = 1176;
/** Where the last line of talking lands, clear of the division. */
const TEXT_BASE = RULE - 56;
/** Where a slide that opens at the head starts, clear of the counter. */
const HEAD_TOP = 156;

/* --- The picture ---------------------------------------------------------- */

export interface Plate {
  src: string;
  ratio: number;
  /** the treatment class in slides.css */
  art: string;
}

/** Where in the picture to centre, and how far in. x and y are fractions of
 *  the picture; scale 1 means it is exactly one slide wide. A scale too small
 *  to cover the slide is raised until it does, and the picture is never
 *  pulled off its own edge. */
export interface Crop {
  x: number;
  y: number;
  scale: number;
}

function CropArt({ plate, crop }: { plate: Plate; crop: Crop }) {
  const minScale = Math.max(1, (H / W) * plate.ratio);
  const w = W * Math.max(crop.scale, minScale);
  const h = w / plate.ratio;
  const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
  return (
    <img
      className={plate.art}
      src={plate.src}
      alt=""
      style={{
        position: "absolute",
        width: w,
        height: h,
        left: clamp(W / 2 - crop.x * w, W - w, 0),
        top: clamp(H / 2 - crop.y * h, H - h, 0),
        maxWidth: "none",
      }}
    />
  );
}

/** Every slide: the picture, its fade, then the content. */
function Ground({
  plate,
  crop,
  scrim,
  children,
}: {
  plate: Plate;
  crop: Crop;
  scrim: string;
  children: ReactNode;
}) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "var(--cc-black)" }}>
      <CropArt plate={plate} crop={crop} />
      <div className={scrim} />
      <div style={{ position: "absolute", inset: 0 }}>{children}</div>
    </div>
  );
}

/* --- Type ----------------------------------------------------------------- */

const CONDENSED: CSSProperties = {
  fontFamily: "var(--cc-font-condensed)",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "-0.004em",
  color: "var(--cc-ivory)",
  margin: 0,
};

const SMALL: CSSProperties = {
  fontFamily: "var(--cc-font-ui)",
  fontWeight: 500,
  color: "var(--cc-muted)",
  margin: 0,
};

const TONES = {
  ivory: "var(--cc-ivory)",
  parchment: "var(--cc-parchment)",
  gold: "var(--cc-gold-bright)",
};

/** One paragraph of the talking. */
export type Line = string | { text: string; size?: number; tone?: keyof typeof TONES };

function Talk({ lines, size }: { lines: Line[]; size: number }) {
  return (
    <>
      {lines.map((line, i) => {
        const l = typeof line === "string" ? { text: line } : line;
        return (
          <p
            key={i}
            style={{
              margin: 0,
              marginTop: i === 0 ? 0 : Math.round(size * 0.55),
              fontFamily: "var(--cc-font-display)",
              fontWeight: 400,
              fontSize: l.size ?? size,
              lineHeight: 1.3,
              letterSpacing: "-0.005em",
              fontVariantNumeric: "lining-nums",
              // no paragraph ends on one word by itself
              textWrap: "pretty",
              color: TONES[l.tone ?? "ivory"],
            }}
          >
            {l.text}
          </p>
        );
      })}
    </>
  );
}

/** Where the reader is. Small and plain: a page number, not a feature. */
function Counter({ n, of }: { n: number; of: number }) {
  return (
    <div
      className="wu-on-art"
      style={{
        ...SMALL,
        position: "absolute",
        left: MARGIN,
        top: 88,
        fontSize: 17,
        color: "var(--cc-parchment)",
      }}
    >
      {n} of {of}
    </div>
  );
}

const PICTURE = "Raphael, The School of Athens, 1509 to 1511.";

/** Under the rule: where the facts came from, then which part of the
 *  picture this is. The smallest, quietest type on the slide. */
function UnderRule({ source, detail }: { source?: string; detail?: string }) {
  return (
    <>
      <hr className="wu-rule" style={{ top: RULE }} />
      <div
        className="wu-on-art"
        style={{ position: "absolute", left: MARGIN, top: RULE + 28, width: W - MARGIN * 2 }}
      >
        {source && <p style={{ ...SMALL, fontSize: 16, lineHeight: 1.5 }}>{source}</p>}
        <p style={{ ...SMALL, marginTop: source ? 6 : 0, fontSize: 13, fontWeight: 400 }}>
          {PICTURE}
          {detail ? ` ${detail}` : ""}
        </p>
      </div>
    </>
  );
}

/** The logo top left, and the edition top right. */
function Masthead({ edition }: { edition: string }) {
  return (
    <>
      <div style={{ position: "absolute", left: MARGIN, top: 84 }}>
        <Lockup width={200} artwork="left" />
      </div>
      <p
        className="wu-on-art"
        style={{
          position: "absolute",
          right: MARGIN,
          top: 88,
          margin: 0,
          fontFamily: "var(--cc-font-display)",
          fontSize: 30,
          color: "var(--cc-ivory)",
        }}
      >
        {edition}
      </p>
    </>
  );
}

/* --- Slides --------------------------------------------------------------- */

/** 1. The claim, under the hall. */
export function Hook({
  plate,
  crop,
  edition,
  hook,
  size,
}: {
  plate: Plate;
  crop: Crop;
  edition: string;
  hook: string[];
  size: number;
}) {
  return (
    <Ground plate={plate} crop={crop} scrim="wu-scrim-hook">
      <Masthead edition={edition} />
      <div
        className="wu-on-art"
        style={{ position: "absolute", left: MARGIN, right: MARGIN - 20, bottom: H - TEXT_BASE }}
      >
        {hook.map((l) => (
          <p key={l} style={{ ...CONDENSED, fontSize: size, lineHeight: 0.94 }}>
            {l}
          </p>
        ))}
      </div>
      <UnderRule detail="Detail: the hall." />
    </Ground>
  );
}

/** 2 to 6. A beat of the argument. It talks at the foot (`foot`), at the head
 *  (`head`), or both, with the picture between. */
export function Beat({
  plate,
  crop,
  scrim,
  n,
  of,
  head,
  headSize = 40,
  foot,
  footSize = 40,
  source,
  detail,
}: {
  plate: Plate;
  crop: Crop;
  scrim: string;
  n: number;
  of: number;
  head?: Line[];
  headSize?: number;
  foot?: Line[];
  footSize?: number;
  source?: string;
  /** which part of the picture, for the credit */
  detail: string;
}) {
  return (
    <Ground plate={plate} crop={crop} scrim={scrim}>
      <Counter n={n} of={of} />
      {head && (
        <div
          className="wu-on-art"
          style={{ position: "absolute", left: MARGIN, width: W - MARGIN * 2, top: HEAD_TOP }}
        >
          <Talk lines={head} size={headSize} />
        </div>
      )}
      {foot && (
        <div
          className="wu-on-art"
          style={{ position: "absolute", left: MARGIN, width: W - MARGIN * 2, bottom: H - TEXT_BASE }}
        >
          <Talk lines={foot} size={footSize} />
        </div>
      )}
      <UnderRule source={source} detail={detail} />
    </Ground>
  );
}

/** 7. The motion, verbatim, over the whole school at dusk. Sized to the
 *  sentence, never cut down to a slogan. */
export function Motion({
  plate,
  crop,
  edition,
  label,
  motion,
}: {
  plate: Plate;
  crop: Crop;
  edition: string;
  label: string;
  motion: string;
}) {
  return (
    <Ground plate={plate} crop={crop} scrim="wu-scrim-motion">
      <Masthead edition={edition} />
      <div
        className="wu-on-art"
        style={{ position: "absolute", left: MARGIN, width: W - MARGIN * 2, bottom: H - TEXT_BASE }}
      >
        <p style={{ ...SMALL, fontSize: 24, color: "var(--cc-parchment)", marginBottom: 26 }}>
          {label}
        </p>
        <p
          style={{
            margin: 0,
            fontFamily: "var(--cc-font-display)",
            fontSize: 56,
            lineHeight: 1.18,
            letterSpacing: "-0.012em",
            color: "var(--cc-ivory)",
          }}
        >
          {motion}
        </p>
      </div>
      <UnderRule />
    </Ground>
  );
}

/** 8. The Debate #12 poster, exactly as published. It is the exported image
 *  from works/2026-10-07-debate-12-indian-education, copied into this
 *  folder's assets so the carousel carries everything it needs. Its own
 *  format is 1080 x 1350, the same as a carousel slide, so it runs edge to
 *  edge with nothing added. */
export function Poster({ src }: { src: string }) {
  return (
    <img
      src={src}
      alt=""
      style={{ position: "absolute", inset: 0, width: W, height: H, maxWidth: "none" }}
    />
  );
}
