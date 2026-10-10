import type { CSSProperties, ReactNode } from "react";
import { Lockup } from "../../src/core/kit";
import "./slides.css";

// Debate Club #12, the Indian education system. The carousel for the motion
// on government schools. Class names are prefixed gs-.
//
// ---------------------------------------------------------------------------
// The story
//
//   1  fixing government schools won't change a thing   the claim
//   2  CJP's Fix the Schools campaign                    the news
//   3  we've tried this: buildings up, learning not      the record
//   4  the government runs the school and judges it      the diagnosis
//   5  so stop running schools; Andhra Pradesh tried it  the proposal
//   6  a market only builds where it pays                the other side
//   7  the motion, verbatim                              what the room argues
//   8  a guest who works on this, against the room       the twist
//   9  the Debate #12 poster                             the way in
//
// Written as one person talking, in full sentences, the way the club speaks.
// Slide 2 describes CJP's campaign fairly and says the club disagrees; it does
// not mock it. Slide 6 is the strongest case against the motion and has to
// stay that strong: the room is there to argue it, not to be told the answer.
//
// ---------------------------------------------------------------------------
// The grammar
//
// REAL PLACES, NOT PAINTINGS. This motion is about schools that exist now, so
// the deck is photographs: real government schools in Rajasthan, Punjab,
// Tamil Nadu and Odisha, a midday meal, CJP's protest at Jantar Mantar, and
// the club's own room. Each is credited on its slide, as its licence needs.
// Photos stay close to their own colour (no warm filter, see the root
// CLAUDE.md); they are only taken down a little, and only the text zones go
// near-black.
//
// THE HOOK IS THE ONE SHOUT, over an empty classroom. Everything after it is
// Playfair talking.
//
// NOT EVERY SLIDE IS THE SAME SLIDE. Where the picture's subject sits low,
// the slide talks at the head (2, 4); where it sits high, at the foot (3, 5,
// 8). Slide 6 opens at the head and lands its question at the foot. Slide 7
// takes a school gate at dusk.
//
// NOTHING DECORATIVE. No frame over the picture, no ticks before labels, no
// glow behind type, no fading rules, no stat set huge on its own.
//
// GOLD MEANS ONE THING PER SLIDE, and most slides have none: the question the
// deck exists for on slide 6, and the call to the room on slide 8. No tracked
// caps. Sources, credits and the counter are plain muted sentence case.

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
  /** who took it and under what licence, printed under the rule */
  credit: string;
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
      className="gs-on-art"
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

/** Under the rule: where the facts came from, then whose picture this is.
 *  The smallest, quietest type on the slide. */
function UnderRule({ source, credit }: { source?: string; credit: string }) {
  return (
    <>
      <hr className="gs-rule" style={{ top: RULE }} />
      <div
        className="gs-on-art"
        style={{ position: "absolute", left: MARGIN, top: RULE + 28, width: W - MARGIN * 2 }}
      >
        {source && <p style={{ ...SMALL, fontSize: 16, lineHeight: 1.5 }}>{source}</p>}
        <p style={{ ...SMALL, marginTop: source ? 6 : 0, fontSize: 13, fontWeight: 400 }}>
          {credit}
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
        className="gs-on-art"
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

/** 1. The claim, over the empty classroom. */
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
    <Ground plate={plate} crop={crop} scrim="gs-scrim-hook">
      <Masthead edition={edition} />
      <div
        className="gs-on-art"
        style={{ position: "absolute", left: MARGIN, right: MARGIN - 20, bottom: H - TEXT_BASE }}
      >
        {hook.map((l) => (
          <p key={l} style={{ ...CONDENSED, fontSize: size, lineHeight: 0.94 }}>
            {l}
          </p>
        ))}
      </div>
      <UnderRule credit={plate.credit} />
    </Ground>
  );
}

/** 2 to 6, and 8. A beat of the argument. It talks at the head, at the foot,
 *  or both with the picture between. The counter marks its place, except on
 *  a slide that carries the masthead instead. */
export function Beat({
  plate,
  crop,
  scrim,
  n,
  of,
  edition,
  head,
  headSize = 44,
  foot,
  footSize = 44,
  source,
}: {
  plate: Plate;
  crop: Crop;
  scrim: string;
  n: number;
  of: number;
  /** set to show the logo and edition in place of the counter */
  edition?: string;
  head?: Line[];
  headSize?: number;
  foot?: Line[];
  footSize?: number;
  source?: string;
}) {
  return (
    <Ground plate={plate} crop={crop} scrim={scrim}>
      {edition ? <Masthead edition={edition} /> : <Counter n={n} of={of} />}
      {head && (
        <div
          className="gs-on-art"
          style={{ position: "absolute", left: MARGIN, width: W - MARGIN * 2, top: HEAD_TOP }}
        >
          <Talk lines={head} size={headSize} />
        </div>
      )}
      {foot && (
        <div
          className="gs-on-art"
          style={{ position: "absolute", left: MARGIN, width: W - MARGIN * 2, bottom: H - TEXT_BASE }}
        >
          <Talk lines={foot} size={footSize} />
        </div>
      )}
      <UnderRule source={source} credit={plate.credit} />
    </Ground>
  );
}

/** 7. The motion, verbatim, over a school gate at dusk. Sized to the
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
    <Ground plate={plate} crop={crop} scrim="gs-scrim-motion">
      <Masthead edition={edition} />
      <div
        className="gs-on-art"
        style={{ position: "absolute", left: MARGIN, width: W - MARGIN * 2, bottom: H - TEXT_BASE }}
      >
        <p style={{ ...SMALL, fontSize: 24, color: "var(--cc-parchment)", marginBottom: 26 }}>
          {label}
        </p>
        <p
          style={{
            margin: 0,
            fontFamily: "var(--cc-font-display)",
            fontSize: 72,
            lineHeight: 1.12,
            letterSpacing: "-0.012em",
            color: "var(--cc-ivory)",
          }}
        >
          {motion}
        </p>
      </div>
      <UnderRule credit={plate.credit} />
    </Ground>
  );
}

/** 9. The Debate #12 poster, exactly as published. It is the exported image
 *  from works/2026-10-07-debate-12-indian-education, copied into this
 *  folder's assets so the carousel carries everything it needs. */
export function Poster({ src }: { src: string }) {
  return (
    <img
      src={src}
      alt=""
      style={{ position: "absolute", inset: 0, width: W, height: H, maxWidth: "none" }}
    />
  );
}
