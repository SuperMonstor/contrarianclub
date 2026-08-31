import type { CSSProperties, ReactNode } from "react";
import { Lockup } from "../../src/core/kit";
import "./slides.css";

// Debate Club #10. Eight slides announcing the first of two motions, at
// Bengaluru Tech Week 2026.
//
// ---------------------------------------------------------------------------
// The whole thing is one person talking
//
// Read end to end the deck is a single continuous voice, and every slide is
// built to hand off to the next one:
//
//   1  so, how did Bengaluru become Bengaluru?      it was a retirement town
//   2  then the software companies arrived          and they kept coming
//   3  the industry grew, and grew, and grew        the city did not
//   4  you probably know what that feels like       here is what it costs
//   5  so what is always the answer? more           we build our way out
//   6  but what if more is the problem              a real question, not a jab
//   7  then maybe the answer is less                and if it is, say so
//   8  that is what we are debating                 the motion, and the poster
//
// Every slide opens on a connective and closes on something unfinished. That
// is the actual mechanism: nobody swipes because a slide was interesting, they
// swipe because the sentence has not landed yet.
//
// ---------------------------------------------------------------------------
// The grammar
//
// SIX PICTURES, FIVE MATERIALS, AND NO TWO NEIGHBOURS ALIKE:
//
//   1  Hobbema, The Avenue at Middelharnis (1689)      light oil, open sky
//   2  Doré, Over London by Rail (1872)                ink engraving
//   3  Bruegel, The Tower of Babel (Rotterdam)         warm oil
//   4  Grimshaw, Greenock (1882)                       night oil, gaslight
//   5  nothing at all                                  near-black
//   6  the tower again, at dusk, nearly a silhouette
//   7  the avenue again, close on the empty lane
//   8  the tower, for the poster
//
// The two reprises are load bearing rather than economical. The tower returns
// at slide 6 as a silhouette under "what if more is the problem", because the
// tower is the thing that got built. The avenue returns at slide 7 under
// "maybe the answer is less", and it is the quiet empty lane the deck opened
// on: the argument for less, already on the page in slide 1, before anyone had
// made it. Slide 5 has no picture because the word on it is the picture.
//
// THREE TYPEFACES, AND OSWALD ONLY WHERE THE VOICE STOPS NARRATING. Playfair
// at reading size carries all the talking; the middle of a carousel is
// somebody speaking, and narration set in poster caps reads as a list of
// claims. Oswald condensed caps appear three times only: the opening question,
// the single word MORE, and the motion. Those are the three moments the deck
// stops telling you something and hits you with it.
//
// LINE BREAKS ARE COPY, NOT LAYOUT. Each slide is given its lines, not a
// paragraph, so the rhythm of the writing survives contact with the column.
// Slide 3 sets its three lines about growth at three growing sizes, which is
// the sentence drawing itself.
//
// ONE DIVISION, LOW ON THE PAGE, AT THE SAME HEIGHT EVERY TIME. On the story
// slides it is a gold hairline with sourced numbers underneath. On slides 1
// and 8 it is the top edge of the cream festival band. See .tb-band in
// slides.css for why the band exists and what it is carrying.
//
// NOTHING OF THE CLUB'S GOES IN THE BAND EXCEPT ON THE POSTER. The swipe
// instruction on slide 1 sits in gold above the band, not in ink inside it:
// set on cream beside the festival's own card it read as the festival's
// furniture rather than as the club talking. Gold on black is the club's voice
// everywhere else in the deck, so it is the club's voice here. Slide 1's strip
// carries the badge and nothing else. Only the poster, which is the club's own
// page, is allowed to print the club's details in the band.
//
// FLUSH LEFT THROUGHOUT, to one margin at x=92, which is why the lockup takes
// its left cut.
// ---------------------------------------------------------------------------

// This work ships one format, so the canvas is a constant rather than a set of
// ratios. If it ever wants the story size these become functions of `format`.
const W = 1080;
const H = 1350;
const MARGIN = 92;

/** The division. Same height on every slide. */
const RULE = 1150;
/** Where the last line of narration lands, clear of the division. */
const TEXT_BASE = RULE - 62;

/* --- Plates ---------------------------------------------------------------- */

/** A picture, plus the two things the layout needs to know about it: its
 *  aspect, so a crop can be positioned, and the treatment it was tuned for.
 *  Plates in five materials cannot share one filter. */
export interface Plate {
  src: string;
  ratio: number;
  art: string;
  scrim: string;
}

/** Where in the picture to centre, and how far in. x and y are fractions of
 *  the picture; scale 1 means the picture is exactly one slide wide. */
export interface Crop {
  x: number;
  y: number;
  scale: number;
}

/** Keep the picture over the whole canvas.
 *
 *  A crop centre near an edge cannot be a slide centre: ask for the top of the
 *  tower at y=0.17 and the canvas runs out above it, leaving a band of bare
 *  black with a hard seam across it. Clamping means a crop says where the eye
 *  should go and the frame stays covered regardless, so these can be tuned by
 *  eye without a class of silent breakage. */
function CropArt({ plate, crop }: { plate: Plate; crop: Crop }) {
  const minScale = (H / W) * plate.ratio;
  const w = W * Math.max(crop.scale, minScale);
  const h = w / plate.ratio;
  const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
  return (
    <img
      className={plate.art}
      src={plate.src}
      alt=""
      style={{
        width: w,
        height: h,
        left: clamp(W / 2 - crop.x * w, W - w, 0),
        top: clamp(H / 2 - crop.y * h, H - h, 0),
        maxWidth: "none",
      }}
    />
  );
}

/** Every slide: the picture, its scrim, then the content. */
function Ground({ plate, crop, children }: { plate?: Plate; crop?: Crop; children: ReactNode }) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {plate && crop && (
        <>
          <CropArt plate={plate} crop={crop} />
          <div className={plate.scrim} />
        </>
      )}
      <div style={{ position: "absolute", inset: 0, zIndex: 4 }}>{children}</div>
    </div>
  );
}

/* --- Type roles this deck defines for itself ------------------------------ */

/** The three moments the voice stops narrating: the question, MORE, the
 *  motion. Nothing else in the deck is allowed to shout. */
const CONDENSED: CSSProperties = {
  fontFamily: "var(--cc-font-condensed)",
  fontWeight: 700,
  textTransform: "uppercase",
  lineHeight: 0.94,
  letterSpacing: "-0.004em",
  color: "var(--cc-ivory)",
  margin: 0,
};

const TONES = {
  ivory: "var(--cc-ivory)",
  parchment: "var(--cc-parchment)",
  gold: "var(--cc-gold-bright)",
  muted: "var(--cc-muted)",
};

/** One line of the talking. An empty string is a beat of silence, which the
 *  copy uses as punctuation and which a paragraph could not express. */
export type Line =
  | string
  | { text: string; size?: number; tone?: keyof typeof TONES; italic?: boolean };

function Narration({ lines, size = 46 }: { lines: Line[]; size?: number }) {
  return (
    <>
      {lines.map((line, i) => {
        const l = typeof line === "string" ? { text: line } : line;
        if (!l.text) return <div key={i} style={{ height: Math.round(size * 0.62) }} />;
        return (
          <p
            key={i}
            style={{
              margin: 0,
              marginTop: i === 0 ? 0 : Math.round((l.size ?? size) * 0.3),
              fontFamily: "var(--cc-font-display)",
              fontWeight: 400,
              fontStyle: l.italic ? "italic" : "normal",
              fontSize: l.size ?? size,
              lineHeight: 1.3,
              letterSpacing: "-0.005em",
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

/** Where the reader is, and how far to the motion. It replaces the labels an
 *  earlier cut put here ("1980", "Then", "Meanwhile"), which said out loud
 *  what the writing now says for itself, and it backs up the instruction on
 *  slide 1 by telling the reader exactly how much is left. */
function Counter({ n, of }: { n: number; of: number }) {
  return (
    <div
      className="kicker tb-on-art"
      style={{
        position: "absolute",
        left: MARGIN,
        top: 92,
        fontSize: 15,
        letterSpacing: "0.3em",
        color: "var(--cc-gold-deep)",
      }}
    >
      {String(n).padStart(2, "0")} <span style={{ opacity: 0.6 }}>/</span>{" "}
      {String(of).padStart(2, "0")}
    </div>
  );
}

/** The sourced number, under the rule, subordinate to the talking above it by
 *  construction: small, gold, set in caps, never more than two lines. */
function Footnote({ children }: { children: ReactNode }) {
  return (
    <div
      className="tb-on-art"
      style={{
        position: "absolute",
        left: MARGIN,
        top: RULE + 44,
        width: 840,
        fontFamily: "var(--cc-font-ui)",
        fontWeight: 600,
        fontSize: 19,
        letterSpacing: "0.09em",
        lineHeight: 1.75,
        textTransform: "uppercase",
        color: "var(--cc-gold)",
      }}
    >
      {children}
    </div>
  );
}

/* --- The festival band ---------------------------------------------------- */

function Badge({ src, width }: { src: string; width: number }) {
  return (
    <img
      className="tb-badge"
      src={src}
      alt="Bengaluru Tech Week 2026, official member event"
      width={width}
    />
  );
}

/** The cream foot. Left column is whatever the slide says in ink, right is the
 *  badge, both on one optical centre line. */
function Band({
  height,
  badge,
  badgeWidth,
  children,
}: {
  height: number;
  badge: string;
  badgeWidth: number;
  children?: ReactNode;
}) {
  return (
    <div
      className="tb-band"
      style={{
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: MARGIN,
        paddingRight: MARGIN,
        boxSizing: "border-box",
      }}
    >
      <div>{children ?? null}</div>
      <Badge src={badge} width={badgeWidth} />
    </div>
  );
}

/* --- The slides ----------------------------------------------------------- */

/** 1. THE QUESTION. Opens on the quiet lane, because the first thing the deck
 *  has to say is that this used to be a slow place. Nothing is sold here: no
 *  date, no venue, no ticket line. A first slide that opens with a date is a
 *  first slide nobody swipes. */
export function Hook({
  plate,
  crop,
  badge,
  question,
  lines,
  cta,
  ctaNote,
}: {
  plate: Plate;
  crop: Crop;
  badge: string;
  question: string[];
  lines: Line[];
  cta: string;
  ctaNote: string;
}) {
  return (
    <Ground plate={plate} crop={crop}>
      <div style={{ position: "absolute", left: MARGIN, top: 92 }}>
        <Lockup width={248} artwork="left" />
        <div
          className="kicker tb-on-art"
          style={{ marginTop: 28, fontSize: 15, letterSpacing: "0.32em" }}
        >
          Debate Club #10
        </div>
      </div>

      <div
        className="tb-on-art"
        style={{ position: "absolute", left: MARGIN, right: MARGIN, bottom: H - (RULE - 132) }}
      >
        {question.map((line) => (
          <div key={line} style={{ ...CONDENSED, fontSize: 92 }}>
            {line}
          </div>
        ))}
        <div style={{ marginTop: 34 }}>
          <Narration lines={lines} size={30} />
        </div>
      </div>

      <div
        className="kicker tb-on-art"
        style={{
          position: "absolute",
          left: MARGIN,
          top: RULE - 74,
          fontSize: 20,
          letterSpacing: "0.2em",
        }}
      >
        {cta}
      </div>
      <div
        className="tb-on-art"
        style={{
          position: "absolute",
          left: MARGIN,
          top: RULE - 40,
          fontFamily: "var(--cc-font-ui)",
          fontWeight: 600,
          fontSize: 14,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--cc-muted)",
        }}
      >
        {ctaNote}
      </div>

      <Band height={H - RULE} badge={badge} badgeWidth={286} />
    </Ground>
  );
}

/** 2 to 7. A beat of the story: the talking, and the sourced number under the
 *  rule if there is one. The block is bottom-anchored so its last line lands
 *  on the division however long it runs. */
export function Beat({
  plate,
  crop,
  n,
  of,
  lines,
  size,
  shout,
  footnote,
}: {
  plate?: Plate;
  crop?: Crop;
  n: number;
  of: number;
  lines: Line[];
  size?: number;
  /** the one word this beat is allowed to shout, set above the lines */
  shout?: { text: string; size: number };
  footnote?: ReactNode;
}) {
  return (
    <Ground plate={plate} crop={crop}>
      <Counter n={n} of={of} />
      <div
        className="tb-on-art"
        style={{ position: "absolute", left: MARGIN, width: 856, bottom: H - TEXT_BASE }}
      >
        {shout && (
          <div style={{ ...CONDENSED, fontSize: shout.size, marginBottom: 30 }}>{shout.text}</div>
        )}
        <Narration lines={lines} size={size} />
      </div>
      <hr className="tb-rule" style={{ top: RULE }} />
      {footnote && <Footnote>{footnote}</Footnote>}
    </Ground>
  );
}

/** 8. THE MOTION, AND THE POSTER. The one slide that has to work alone if
 *  somebody screenshots it or it goes out as a single image: the mark, the
 *  motion, the night, the tickets, the festival. */
export function Poster({
  plate,
  crop,
  badge,
  handoff,
  motion,
  note,
  lines,
  cta,
  when,
  where,
}: {
  plate: Plate;
  crop: Crop;
  badge: string;
  /** the sentence slide 7 left hanging, finished here */
  handoff: string;
  motion: string[];
  note: string;
  lines: string[];
  cta: string;
  when: string;
  where: string;
}) {
  const BAND = 428;
  return (
    <Ground plate={plate} crop={crop}>
      <div style={{ position: "absolute", left: MARGIN, top: 88 }}>
        <Lockup width={248} artwork="left" />
      </div>

      <div
        className="tb-on-art"
        style={{ position: "absolute", left: MARGIN, right: MARGIN, bottom: BAND + 72 }}
      >
        <div
          style={{
            fontFamily: "var(--cc-font-display)",
            fontStyle: "italic",
            fontSize: 36,
            lineHeight: 1.3,
            color: "var(--cc-parchment)",
            marginBottom: 26,
          }}
        >
          {handoff}
        </div>
        <div
          className="kicker"
          style={{ fontSize: 15, letterSpacing: "0.32em", marginBottom: 20 }}
        >
          This club believes
        </div>
        {motion.map((line) => (
          <div key={line} style={{ ...CONDENSED, fontSize: 92 }}>
            {line}
          </div>
        ))}
        <div
          style={{
            marginTop: 24,
            fontFamily: "var(--cc-font-ui)",
            fontSize: 20,
            color: "var(--cc-muted)",
          }}
        >
          {note}
        </div>
      </div>

      <Band height={BAND} badge={badge} badgeWidth={318}>
        <div style={{ fontFamily: "var(--cc-font-display)", fontSize: 46, lineHeight: 1.28 }}>
          {when}
          <br />
          {where}
        </div>
        <hr className="tb-band-line" style={{ margin: "28px 0 24px", width: 480 }} />
        {lines.map((line) => (
          <div
            key={line}
            className="tb-band-meta"
            style={{ fontSize: 15, letterSpacing: "0.11em", lineHeight: 1.72 }}
          >
            {line}
          </div>
        ))}
        <div className="tb-band-cta" style={{ fontSize: 18, letterSpacing: "0.26em", marginTop: 22 }}>
          {cta}
        </div>
      </Band>
    </Ground>
  );
}
