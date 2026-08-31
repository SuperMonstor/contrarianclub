import type { CSSProperties, ReactNode } from "react";
import { Lockup } from "../../src/core/kit";
import "./slides.css";

// Debate Club #10. Seven slides announcing the first of two motions, at
// Bengaluru Tech Week 2026.
//
// ---------------------------------------------------------------------------
// The argument, which is a story and not a set of statistics
//
//   1  the hook       nobody planned this city, and the motion is at the end
//   2  what it was    a slow, pleasant, cheap town
//   3  what happened  the industry arrived and never stopped arriving
//   4  what did not   the city underneath stayed the size it always was
//   5  the cost       where a person actually feels it
//   6  the turn       every answer so far has been more
//   7  the motion     said outright, and the poster for the night
//
// The numbers are real and they are sourced, but they are never the content of
// a slide. Each one sits under the rule in small caps, as a footnote to a
// sentence somebody could have said out loud. A carousel that puts a table on
// screen is a carousel people swipe past.
//
// ---------------------------------------------------------------------------
// The grammar
//
// FIVE PICTURES, FOUR REGISTERS. The deck moves from paint to soot and back:
//
//   1  Bruegel, The Tower of Babel (Rotterdam, c. 1568)   warm oil
//   2  Hobbema, The Avenue at Middelharnis (1689)         light oil, open sky
//   3  Doré, Over London by Rail (1872)                   ink engraving
//   4  nothing at all                                     near-black
//   5  Grimshaw, Greenock (1882)                          night oil, gaslight
//   6  the tower again, at dusk, nearly a silhouette
//   7  the tower, for the poster
//
// The tower opens and closes it: the thing that got built. Between them the
// picture changes material every slide, which is the point. Slide 4 is the
// only one with no picture, because it is the slide about the part of the city
// that was never built, and an absence is the one thing a photograph of
// something cannot show.
//
// TWO TYPEFACES, TWO JOBS. Oswald condensed caps appear exactly twice: the
// hook and the motion. Those are the two things a reader has to leave with.
// Everything in between is Playfair at reading size, because the middle of the
// deck is somebody talking, and setting narration in poster caps is what makes
// a story read as a list of claims.
//
// ONE DIVISION, LOW ON THE PAGE, AT THE SAME HEIGHT EVERY TIME. On the story
// slides it is a gold hairline with the numbers underneath. On slides 1 and 7
// it is the top edge of the cream festival band. See .tb-band in slides.css
// for why the band exists.
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
const TEXT_BASE = RULE - 66;

/* --- Plates ---------------------------------------------------------------- */

/** A picture, plus the two things the layout needs to know about it: its
 *  aspect, so a crop can be positioned, and the treatment it was tuned for.
 *  Four plates in four materials cannot share one filter. */
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

/** Every slide: the picture, its scrim, then the content. Slides that carry
 *  the hairline draw it themselves; the two band slides do not. */
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

/** The two headline moments, and only those two. */
const CONDENSED: CSSProperties = {
  fontFamily: "var(--cc-font-condensed)",
  fontWeight: 700,
  textTransform: "uppercase",
  lineHeight: 0.94,
  letterSpacing: "-0.004em",
  color: "var(--cc-ivory)",
  margin: 0,
};

/** The narration. Everything between the hook and the motion. */
const NARRATION: CSSProperties = {
  fontFamily: "var(--cc-font-display)",
  fontWeight: 400,
  fontSize: 50,
  lineHeight: 1.34,
  letterSpacing: "-0.005em",
  color: "var(--cc-ivory)",
  margin: 0,
};

function Kicker({ children }: { children: ReactNode }) {
  return (
    <div
      className="kicker tb-on-art"
      style={{ position: "absolute", left: MARGIN, top: 92, fontSize: 15, letterSpacing: "0.32em" }}
    >
      {children}
    </div>
  );
}

/** The sourced number, under the rule, subordinate to the sentence above it
 *  by construction: small, gold, set in caps, and never more than two lines. */
function Footnote({ children }: { children: ReactNode }) {
  return (
    <div
      className="tb-on-art"
      style={{
        position: "absolute",
        left: MARGIN,
        top: RULE + 44,
        width: 830,
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

/** The cream foot. Left column is whatever the slide has to say in ink, right
 *  is the badge, both on one optical centre line. */
function Band({
  height,
  badge,
  badgeWidth,
  children,
}: {
  height: number;
  badge: string;
  badgeWidth: number;
  children: ReactNode;
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
      <div>{children}</div>
      <Badge src={badge} width={badgeWidth} />
    </div>
  );
}

/* --- The slides ----------------------------------------------------------- */

/** 1. THE HOOK. The tower entire, the thesis in three words, and the only
 *  instruction the deck gives: keep going, the motion is at the end. Nothing
 *  is sold here. A first slide that opens with a date is a first slide nobody
 *  swipes. */
export function Hook({ plate, crop, badge }: { plate: Plate; crop: Crop; badge: string }) {
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
        style={{ position: "absolute", left: MARGIN, right: MARGIN, bottom: H - (RULE - 96) }}
      >
        {["Bengaluru", "happened", "by accident."].map((line) => (
          <div key={line} style={{ ...CONDENSED, fontSize: 138 }}>
            {line}
          </div>
        ))}
        <p style={{ ...NARRATION, fontSize: 34, color: "var(--cc-parchment)", marginTop: 30 }}>
          Nobody planned for the city it turned into.
        </p>
      </div>

      <Band height={H - RULE} badge={badge} badgeWidth={276}>
        <div style={{ fontFamily: "var(--cc-font-display)", fontSize: 38, fontStyle: "italic" }}>
          Keep swiping.
        </div>
        <div className="tb-band-meta" style={{ fontSize: 15, letterSpacing: "0.16em", marginTop: 10 }}>
          The motion is on the last slide
        </div>
      </Band>
    </Ground>
  );
}

/** 2 to 5. A beat of the story: what it is called, what happened, and the
 *  number underneath if there is one. The narration is bottom-anchored so its
 *  last line lands on the division whatever length it runs to. */
export function Beat({
  plate,
  crop,
  kicker,
  children,
  footnote,
  size = 50,
}: {
  plate?: Plate;
  crop?: Crop;
  kicker: string;
  children: ReactNode;
  footnote?: ReactNode;
  size?: number;
}) {
  return (
    <Ground plate={plate} crop={crop}>
      <Kicker>{kicker}</Kicker>
      <p
        className="tb-on-art"
        style={{
          position: "absolute",
          left: MARGIN,
          width: 848,
          bottom: H - TEXT_BASE,
          ...NARRATION,
          fontSize: size,
        }}
      >
        {children}
      </p>
      <hr className="tb-rule" style={{ top: RULE }} />
      {footnote && <Footnote>{footnote}</Footnote>}
    </Ground>
  );
}

/** 6. THE TURN. The tower at dusk and one line in gold, set high with the rest
 *  of the page left empty. After five slides of argument the reader has earned
 *  a page that asks for nothing. */
export function Turn({ plate, crop, children }: { plate: Plate; crop: Crop; children: ReactNode }) {
  return (
    <Ground plate={plate} crop={crop}>
      <p
        className="tb-on-art"
        style={{
          position: "absolute",
          left: MARGIN,
          top: 208,
          width: 848,
          ...NARRATION,
          fontStyle: "italic",
          fontSize: 54,
          lineHeight: 1.36,
          color: "var(--cc-gold-bright)",
        }}
      >
        {children}
      </p>
      <hr className="tb-rule" style={{ top: RULE }} />
    </Ground>
  );
}

/** 7. THE MOTION, AND THE POSTER. The one slide that has to work alone if
 *  somebody screenshots it or it goes out as a single image: the mark, the
 *  motion, the night, the tickets, the festival. */
export function Poster({
  plate,
  crop,
  badge,
  motion,
  lines,
  cta,
  when,
  where,
  time,
  note,
}: {
  plate: Plate;
  crop: Crop;
  badge: string;
  motion: string[];
  lines: string[];
  cta: string;
  when: string;
  where: string;
  time: string;
  note: string;
}) {
  const BAND = 428;
  return (
    <Ground plate={plate} crop={crop}>
      <div style={{ position: "absolute", left: MARGIN, top: 88 }}>
        <Lockup width={248} artwork="left" />
      </div>

      <div
        className="tb-on-art"
        style={{ position: "absolute", left: MARGIN, right: MARGIN, bottom: H - (H - BAND - 76) }}
      >
        <div
          style={{
            fontFamily: "var(--cc-font-display)",
            fontStyle: "italic",
            fontSize: 40,
            color: "var(--cc-parchment)",
            marginBottom: 20,
          }}
        >
          This club believes
        </div>
        {motion.map((line) => (
          <div key={line} style={{ ...CONDENSED, fontSize: 96 }}>
            {line}
          </div>
        ))}
        <div
          style={{
            marginTop: 26,
            fontFamily: "var(--cc-font-ui)",
            fontSize: 21,
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
        <div className="tb-band-meta" style={{ fontSize: 16, letterSpacing: "0.14em", marginTop: 12 }}>
          {time}
        </div>
        <hr className="tb-band-line" style={{ margin: "26px 0 22px", width: 480 }} />
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
