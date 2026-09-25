import type { CSSProperties, ReactNode } from "react";
import { Lockup } from "../../src/core/kit";
import "./slides.css";

// Debate Club #11, the second motion, as it was rewritten: marriage and its
// benefits, not tax. The motion one deck (works/2026-09-27-debate-11-image-
// carousel) is built from posts and headlines, because that motion is about
// something people are already shouting about online. This one is an argument,
// so it is told as one: a single line of reasoning, walked slide by slide, and
// nothing quoted. Class names are prefixed mc-.
//
// ---------------------------------------------------------------------------
// The story
//
//   1  marriages should be annulled if you don't have kids    the provocation
//   2  marriage changes what the state gives you              the stakes
//   3  why does the state hand all that out?                  what it is for
//   4  and India is having fewer children                     the case
//   5  Hungary runs a version                                 it has been done
//   6  but whose five years?                                  the hard cases
//   7  nobody's annulling anything, but conditions?           the question
//   8  the motion, struck out, and the way in                 come and find out
//
// Slide 1 is deliberately harsher than the motion. The deck walks it back to
// something that sounds reasonable, and that walk is the pitch: by slide 7 a
// reader should be unsure which side they are on. Nothing here makes the idea
// look religious or old-fashioned, on purpose. It is argued as policy.
//
// ---------------------------------------------------------------------------
// The grammar
//
// ONE PAINTING, READ CLOSELY. Every slide is a piece of van Eyck's Arnolfini
// Portrait, a married couple in their bedroom in 1434. The deck walks through
// it the way the argument walks through marriage: the couple, the joined
// hands, the mirror that shows the witnesses in the doorway, her hand on her
// gown, the chandelier with one candle lit, the dog at their feet, and then the whole
// room. Each detail is named in the credit. It is the same Flemish school as
// the poster's two panels.
//
// The close details in shadow (the mirror, the chandelier, the dog) are dark
// in the painting itself, and take the lift treatment rather than the
// standard one.
//
// THE HOOK IS THE LOWER HALF OF THE FIRST SLIDE. The couple keep the top, the
// provocation takes the foot in the condensed face, set as large as it fits.
//
// NOT EVERY SLIDE IS THE SAME SLIDE. Beats sit at the foot by default. Slide 3
// asks its question at the head and answers at the foot, with the mirror
// between. Slide 6 opens at the head and leaves the dog below. Slide 7 pulls
// back to the whole painting.
//
// NOTHING DECORATIVE. No frame over the painting, no ticks before labels, no
// glow behind type, no fading rules. See "Avoid AI design tells" in the root
// CLAUDE.md.
//
// GOLD MEANS ONE THING PER SLIDE, and most slides have none. It marks the
// question on slide 7 and "Tickets in bio" on slide 8, which is the only
// line in the deck set in tracked caps. Sources, credits and the counter are
// plain muted type in sentence case.
//
// THREE TYPEFACES. Oswald shouts once, on slide 1. Playfair does the talking.
// Inter is the small print.

const W = 1080;
const H = 1350;
const MARGIN = 92;

/** The division above the small print. Same height on every slide. */
const RULE = 1176;
/** Where the last line of narration lands, clear of the division. */
const TEXT_BASE = RULE - 56;
/** Where a slide that opens at the head starts, clear of the counter. */
const HEAD_TOP = 156;

/* --- The painting -------------------------------------------------------- */

export interface Plate {
  src: string;
  ratio: number;
  /** the treatment class in slides.css */
  art: string;
}

/** Where in the painting to centre, and how far in. x and y are fractions of
 *  the painting; scale 1 means the painting is exactly one slide wide. A scale
 *  too small to cover the slide is raised until it does. */
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

/** The marker the strikes are drawn with: a turbulence filter that chews the
 *  edges so no two bars are the same shape. */
function InkFilter() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
      <filter id="mc-ink">
        <feTurbulence type="fractalNoise" baseFrequency="0.035 0.18" numOctaves="2" seed="11" />
        <feDisplacementMap in="SourceGraphic" scale="5" />
      </filter>
    </svg>
  );
}

/** Every slide: the painting, its fade, then the content. */
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
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <InkFilter />
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

/** One line of the talking. An empty string is a beat of silence. */
export type Line = string | { text: string; size?: number; tone?: keyof typeof TONES };

function Narration({ lines, size = 40 }: { lines: Line[]; size?: number }) {
  return (
    <>
      {lines.map((line, i) => {
        const l = typeof line === "string" ? { text: line } : line;
        if (!l.text) return <div key={i} style={{ height: Math.round(size * 0.6) }} />;
        return (
          <p
            key={i}
            style={{
              margin: 0,
              fontFamily: "var(--cc-font-display)",
              fontWeight: 400,
              fontSize: l.size ?? size,
              lineHeight: 1.28,
              letterSpacing: "-0.005em",
              fontVariantNumeric: "lining-nums",
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
      className="mc-on-art"
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

const PAINTING = "Jan van Eyck, The Arnolfini Portrait, 1434.";

/** Under the rule: where the facts came from, then which part of the
 *  painting this is. The smallest, quietest type on the slide. */
function UnderRule({ source, detail }: { source?: string; detail?: string }) {
  return (
    <>
      <hr className="mc-rule" style={{ top: RULE }} />
      <div
        className="mc-on-art"
        style={{ position: "absolute", left: MARGIN, top: RULE + 28, width: W - MARGIN * 2 }}
      >
        {source && <p style={{ ...SMALL, fontSize: 16, lineHeight: 1.5 }}>{source}</p>}
        <p style={{ ...SMALL, marginTop: source ? 6 : 0, fontSize: 13, fontWeight: 400 }}>
          {PAINTING}
          {detail ? ` ${detail}` : ""}
        </p>
      </div>
    </>
  );
}

/* --- The strike ----------------------------------------------------------- */

/** A word behind a hand-drawn bar. The hidden word still sets the width, so
 *  the bar is as long as what it hides. */
export function Strike({ children }: { children: string }) {
  const tilt = ((children.length % 3) - 1) * 0.45;
  return (
    <span className="mc-strike" style={{ transform: `rotate(${tilt}deg)` }}>
      {children}
    </span>
  );
}

/* --- Slides --------------------------------------------------------------- */

/** 1. The provocation, under the couple. */
export function Hook({
  plate,
  crop,
  label,
  hook,
  size,
}: {
  plate: Plate;
  crop: Crop;
  label: string;
  hook: string[];
  size: number;
}) {
  return (
    <Ground plate={plate} crop={crop} scrim="mc-scrim-hook">
      <div style={{ position: "absolute", left: MARGIN, top: 84 }}>
        <Lockup width={200} artwork="left" />
      </div>
      <div
        className="mc-on-art"
        style={{ position: "absolute", left: MARGIN, right: MARGIN - 20, bottom: H - TEXT_BASE }}
      >
        <p style={{ ...SMALL, fontSize: 24, color: "var(--cc-parchment)", marginBottom: 30 }}>
          {label}
        </p>
        {hook.map((l) => (
          <p key={l} style={{ ...CONDENSED, fontSize: size, lineHeight: 0.92 }}>
            {l}
          </p>
        ))}
      </div>
      <UnderRule detail="Detail." />
    </Ground>
  );
}

/** 2 to 7. A beat of the argument. The talking sits at the foot by default;
 *  a beat can also open at the head (`head`), and can leave the foot empty so
 *  the painting has the lower half to itself. */
export function Beat({
  plate,
  crop,
  scrim = "mc-scrim-foot",
  lift = false,
  n,
  of,
  head,
  headSize = 44,
  lines = [],
  size = 40,
  source,
  detail,
}: {
  plate: Plate;
  crop: Crop;
  scrim?: string;
  /** a close detail in shadow, brought up a little so it reads */
  lift?: boolean;
  n: number;
  of: number;
  head?: Line[];
  headSize?: number;
  lines?: Line[];
  size?: number;
  source?: string;
  /** which part of the painting, for the credit */
  detail?: string;
}) {
  return (
    <Ground plate={lift ? { ...plate, art: "mc-art-lift" } : plate} crop={crop} scrim={scrim}>
      <Counter n={n} of={of} />
      {head && (
        <div
          className="mc-on-art"
          style={{ position: "absolute", left: MARGIN, width: W - MARGIN * 2, top: HEAD_TOP }}
        >
          <Narration lines={head} size={headSize} />
        </div>
      )}
      {lines.length > 0 && (
        <div
          className="mc-on-art"
          style={{ position: "absolute", left: MARGIN, width: W - MARGIN * 2, bottom: H - TEXT_BASE }}
        >
          <Narration lines={lines} size={size} />
        </div>
      )}
      <UnderRule source={source} detail={detail} />
    </Ground>
  );
}

/** 8. The motion, struck out, when it will be read, and the way in. */
export function Motion({
  plate,
  crop,
  label,
  motion,
  notice,
  details,
  invitation,
  cta,
}: {
  plate: Plate;
  crop: Crop;
  label: string;
  motion: ReactNode;
  /** the line that says when it will be read */
  notice: string;
  details: string[];
  invitation: string[];
  cta: string;
}) {
  return (
    <Ground plate={plate} crop={crop} scrim="mc-scrim-motion">
      <div style={{ position: "absolute", left: MARGIN, top: 84 }}>
        <Lockup width={214} artwork="left" />
      </div>
      <div
        className="mc-on-art"
        style={{ position: "absolute", right: MARGIN, top: 88, textAlign: "right" }}
      >
        <p style={{ ...SMALL, fontSize: 17 }}>Debate Club #11</p>
        {details.map((line, i) => (
          <p
            key={line}
            style={{
              margin: 0,
              marginTop: i === 0 ? 10 : 2,
              fontFamily: "var(--cc-font-display)",
              fontSize: i === 0 ? 26 : 21,
              lineHeight: 1.3,
              color: i === 0 ? "var(--cc-ivory)" : "var(--cc-parchment)",
            }}
          >
            {line}
          </p>
        ))}
      </div>

      <div
        className="mc-on-art"
        style={{ position: "absolute", left: MARGIN, width: W - MARGIN * 2, bottom: H - 950 }}
      >
        <p style={{ ...SMALL, fontSize: 22, color: "var(--cc-parchment)", marginBottom: 22 }}>
          {label}
        </p>
        <p
          style={{
            margin: 0,
            fontFamily: "var(--cc-font-display)",
            fontSize: 44,
            lineHeight: 1.44,
            letterSpacing: "-0.01em",
            color: "var(--cc-ivory)",
          }}
        >
          {motion}
        </p>
        <p
          style={{
            margin: 0,
            marginTop: 34,
            fontFamily: "var(--cc-font-display)",
            fontSize: 30,
            lineHeight: 1.3,
            color: "var(--cc-parchment)",
          }}
        >
          {notice}
        </p>
      </div>

      <hr className="mc-rule" style={{ top: 1008 }} />
      <div
        className="mc-on-art"
        style={{ position: "absolute", left: MARGIN, right: MARGIN, top: 1054 }}
      >
        {invitation.map((l) => (
          <p
            key={l}
            style={{
              margin: 0,
              fontFamily: "var(--cc-font-display)",
              fontSize: 44,
              lineHeight: 1.22,
              letterSpacing: "-0.01em",
              color: "var(--cc-ivory)",
            }}
          >
            {l}
          </p>
        ))}
        <div className="kicker" style={{ marginTop: 40, fontSize: 22, letterSpacing: "0.22em" }}>
          {cta}
        </div>
      </div>
    </Ground>
  );
}
