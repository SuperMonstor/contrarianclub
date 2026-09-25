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
//   3  what is the state paying for? the next generation      answer one
//   4  and India is having fewer children                     its case
//   5  Hungary runs a version                                 it has been done
//   6  the other answer: the two of you                       answer two
//   7  nobody's annulled; live together, adopt                what's on the table
//   8  the bond, or what it does for everyone else?           the crux
//   9  the motion, struck out, and when it is read            the withholding
//  10  spectate, or get involved                              the way in
//
// The crux of the night is where the value of a marriage comes from: the bond
// between two people, or its social function in raising the next generation.
// The deck gives each answer its own case. Slides 3 to 5 argue the function,
// slide 6 argues the bond (turning slide 2's list round: every benefit on it
// goes to the spouse, not the children), and slide 8 sets the two side by
// side. Anyone editing a line should keep the two answers even.
//
// Slide 1 is deliberately harsher than the motion, and slide 7 walks it back
// before the crux: no marriage is annulled, a couple can live together for
// life without marrying, and adopting a child counts. That last line is the
// club's reading of "having a child"; change it only if the reading changes. Nothing here makes the idea look religious
// or old-fashioned, on purpose. It is argued as policy.
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
// between. Slides 6 and 7 open at the head and leave the dog and the hands
// below. Slide 8 pulls back to the whole painting. Slide 10 ends on the
// husband's raised hand, someone asking to speak.
//
// NOTHING DECORATIVE. No frame over the painting, no ticks before labels, no
// glow behind type, no fading rules. See "Avoid AI design tells" in the root
// CLAUDE.md.
//
// GOLD MEANS ONE THING PER SLIDE, and most slides have none. It marks the
// crux on slide 8, the 500 likes line on slide 9 (the largest type after the
// hook, because it is what slide 9 is for), and "Tickets in bio" on slide 10,
// the only line in the deck set in tracked caps. Sources, credits and the counter are
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

/** The logo top left, and the date and place top right if given. */
function Masthead({ details = [] }: { details?: string[] }) {
  return (
    <>
      <div style={{ position: "absolute", left: MARGIN, top: 84 }}>
        <Lockup width={214} artwork="left" />
      </div>
      <div
        className="mc-on-art"
        style={{ position: "absolute", right: MARGIN, top: 88, textAlign: "right" }}
      >
        {details.length > 0 && <p style={{ ...SMALL, fontSize: 17 }}>Debate Club #11</p>}
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
    </>
  );
}

/** 9. The motion, struck out, and when it will be read. The notice is the
 *  point of the slide, so it is the largest line and the gold one; the
 *  struck motion sits above it, smaller, as the thing being withheld. */
export function Motion({
  plate,
  crop,
  label,
  motion,
  notice,
  details,
}: {
  plate: Plate;
  crop: Crop;
  label: string;
  motion: ReactNode;
  /** the line that says when it will be read */
  notice: string;
  details: string[];
}) {
  return (
    <Ground plate={plate} crop={crop} scrim="mc-scrim-motion">
      <Masthead details={details} />
      <div
        className="mc-on-art"
        style={{ position: "absolute", left: MARGIN, width: W - MARGIN * 2, bottom: 110 }}
      >
        <p style={{ ...SMALL, fontSize: 22, color: "var(--cc-parchment)", marginBottom: 20 }}>
          {label}
        </p>
        <p
          style={{
            margin: 0,
            fontFamily: "var(--cc-font-display)",
            fontSize: 34,
            lineHeight: 1.5,
            letterSpacing: "-0.01em",
            color: "var(--cc-ivory)",
          }}
        >
          {motion}
        </p>
        <hr className="mc-rule" style={{ position: "static", margin: "52px 0 44px" }} />
        <p
          style={{
            margin: 0,
            fontFamily: "var(--cc-font-display)",
            fontSize: 70,
            lineHeight: 1.1,
            letterSpacing: "-0.015em",
            fontVariantNumeric: "lining-nums",
            color: "var(--cc-gold-bright)",
          }}
        >
          {notice}
        </p>
      </div>
    </Ground>
  );
}

/** 10. The way in: who it is for, when and where, and where the tickets are.
 *  The date sits with the invitation rather than top right, where it would
 *  land on the husband's face. */
export function Invite({
  plate,
  crop,
  invitation,
  when,
  cta,
  detail,
}: {
  plate: Plate;
  crop: Crop;
  invitation: string[];
  when: string;
  cta: string;
  /** which part of the painting, for the credit */
  detail: string;
}) {
  return (
    <Ground plate={plate} crop={crop} scrim="mc-scrim-foot">
      <Masthead />
      <div
        className="mc-on-art"
        style={{ position: "absolute", left: MARGIN, width: W - MARGIN * 2, bottom: H - TEXT_BASE }}
      >
        {invitation.map((l) => (
          <p
            key={l}
            style={{
              margin: 0,
              fontFamily: "var(--cc-font-display)",
              fontSize: 64,
              lineHeight: 1.12,
              letterSpacing: "-0.012em",
              color: "var(--cc-ivory)",
            }}
          >
            {l}
          </p>
        ))}
        <p
          style={{
            margin: 0,
            marginTop: 36,
            fontFamily: "var(--cc-font-display)",
            fontSize: 28,
            lineHeight: 1.3,
            color: "var(--cc-parchment)",
          }}
        >
          {when}
        </p>
        <div className="kicker" style={{ marginTop: 40, fontSize: 24, letterSpacing: "0.22em" }}>
          {cta}
        </div>
      </div>
      <UnderRule detail={detail} />
    </Ground>
  );
}
