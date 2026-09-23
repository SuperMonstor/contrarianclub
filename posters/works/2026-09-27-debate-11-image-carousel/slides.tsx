import type { CSSProperties, ReactNode } from "react";
import { Lockup } from "../../src/core/kit";
import "./slides.css";

// Debate Club #11, the first motion. Nine slides on "I. For India's image".
//
// ---------------------------------------------------------------------------
// The argument
//
//   1  are Indians abroad embarrassing India?       the question, and the swipe
//   2  take Leicester, this month                   the video, and the headline
//   3  and it isn't one river                       Brampton, and its fireworks
//   4  and none of it stays in the street           how one clip becomes all of us
//   5  whose image?                                 the hinge, no picture
//   6  because every community heard this first     the Irish, and their parade
//   7  and the festivals that got tolerated         Leicester's lamps, New York's schools
//   8  so the question was never whether            the fair question, in gold
//   9  come and take a side                         the back cover
//
// Slides 2 to 8 are one continuous voice, the way both Debate #10 decks were:
// every slide opens on a connective and closes on something unfinished, and
// that is the whole reason the deck gets swiped. Anyone editing a line should
// read the slide before it and the slide after it first.
//
// Three slides make the case for the motion, two make the case against, and
// the fourth and eighth are the hinges. The deck has to leave both sides
// arguable, because the room votes on it.
//
// THE MOTION IS NOT IN THE DECK. The poster announced a theme and held both
// motions back until the day, so this carousel names the topic, which a deck
// about it cannot avoid, and still never prints the motion's words. The back
// cover says so out loud.
//
// ---------------------------------------------------------------------------
// The grammar
//
// ONE PAINTING, THE WAY DEBATE #9 USED ONE DEGAS. Every picture slide is a
// detail of Bruegel's Fight Between Carnival and Lent, the painting the poster
// set this motion on. It already contains the whole argument: a town
// celebrating in the open, the respectable half of the same square
// disapproving of it, and people leaning out of every window to watch. Slide 1
// shows the square entire, and only then do the slides move in close, because
// a tight crop with no wide shot before it reads as a damaged reproduction.
//
//   1  the square, entire                 the argument in one frame
//   2  the well, the fishmonger           water, for the river in the copy
//   3  the fire, the frying pan           fire, for the fireworks
//   4  the window full of faces           the watchers, for the internet
//   5  nothing                            the question is the picture
//   6  Carnival on his barrel             the celebration, unapologetic
//   7  the round dance                    a festival the town has absorbed
//   8  Lent on her cart                   restraint, for the fair question
//   9  the square again, at dusk          the back cover
//
// THE POSTER'S FRAME RUNS THROUGH THE DECK. The gold double rule drawn over the
// art on the poster is drawn over every slide here, so the carousel reads as
// the same printed object opened up, not a second design.
//
// THREE TYPEFACES, AND OSWALD ONLY WHERE THE VOICE STOPS NARRATING: the
// question on slide 1, WHOSE IMAGE on slide 5, and the invitation on slide 9.
// Playfair carries all the talking. Inter is small gold utility: the counter,
// the footnotes, the swipe, the call to action.
//
// ONE DIVISION, LOW ON THE PAGE, AT THE SAME HEIGHT EVERY TIME: a gold
// hairline with the sourced fact under it. Every number in the deck has a
// source under the line, and the list is at the top of spec.tsx.
//
// FLUSH LEFT THROUGHOUT, to one margin at x=92, with the lockup in its left cut.

const W = 1080;
const H = 1350;
const MARGIN = 92;

/** The division. Same height on every slide. */
const RULE = 1140;
/** Where the last line of narration lands, clear of the division. */
const TEXT_BASE = RULE - 60;

/* --- Plates ---------------------------------------------------------------- */

/** A detail of the painting, plus what the layout needs to know about it: its
 *  aspect, so a crop can be positioned, and the treatment and scrim it was
 *  tuned for. */
export interface Plate {
  src: string;
  ratio: number;
  art: string;
  scrim: string;
}

/** Where in the detail to centre, and how far in. x and y are fractions of the
 *  picture; scale 1 means the picture is exactly one slide wide. */
export interface Crop {
  x: number;
  y: number;
  scale: number;
}

/** Keep the picture over the whole canvas. A crop says where the eye should
 *  go, and the position is clamped so the frame stays covered regardless. */
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

/** Every slide: the picture, its scrim, the frame, then the content. */
function Ground({ plate, crop, children }: { plate?: Plate; crop?: Crop; children: ReactNode }) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {plate && crop && (
        <>
          <CropArt plate={plate} crop={crop} />
          <div className={plate.scrim} />
        </>
      )}
      <div className="ic-frame" />
      <div style={{ position: "absolute", inset: 0 }}>{children}</div>
    </div>
  );
}

/* --- Type ------------------------------------------------------------------ */

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
};

/** One line of the talking. An empty string is a beat of silence, which the
 *  copy uses as punctuation and which a paragraph could not express. */
export type Line = string | { text: string; size?: number; tone?: keyof typeof TONES };

function Narration({ lines, size = 44 }: { lines: Line[]; size?: number }) {
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
              marginTop: i === 0 ? 0 : Math.round((l.size ?? size) * 0.3),
              fontFamily: "var(--cc-font-display)",
              fontWeight: 400,
              fontSize: l.size ?? size,
              lineHeight: 1.28,
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

/** Where the reader is, and how much is left. */
function Counter({ n, of }: { n: number; of: number }) {
  return (
    <div
      className="kicker ic-on-art"
      style={{
        position: "absolute",
        left: MARGIN,
        top: 92,
        fontSize: 15,
        letterSpacing: "0.3em",
        color: "var(--cc-gold)",
      }}
    >
      {String(n).padStart(2, "0")} <span style={{ opacity: 0.6 }}>/</span>{" "}
      {String(of).padStart(2, "0")}
    </div>
  );
}

/** The small gold label with its tick, as the poster sets "Theme". */
function Label({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      className="kicker ic-on-art"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        fontSize: 16,
        letterSpacing: "0.3em",
        ...style,
      }}
    >
      <span className="ic-tick" />
      {children}
    </div>
  );
}

/** Under the rule: a sourced fact, or on slide 1 the swipe. Small, gold, caps,
 *  never more than two lines, and subordinate to the talking by construction. */
function UnderRule({ children }: { children: ReactNode }) {
  return (
    <div
      className="kicker ic-on-art"
      style={{
        position: "absolute",
        left: MARGIN,
        top: RULE + 40,
        width: W - MARGIN * 2,
        fontSize: 18,
        letterSpacing: "0.09em",
        lineHeight: 1.7,
      }}
    >
      {children}
    </div>
  );
}

/** The club's mark, and opposite it the edition and the date, as the poster
 *  sets them. Only the two covers carry it. */
function Masthead({ details }: { details: string[] }) {
  return (
    <>
      <div style={{ position: "absolute", left: MARGIN, top: 84 }}>
        <Lockup width={214} artwork="left" />
      </div>
      <div
        className="ic-on-art"
        style={{ position: "absolute", right: MARGIN, top: 88, textAlign: "right" }}
      >
        <div className="kicker" style={{ fontSize: 15, letterSpacing: "0.3em" }}>
          Debate Club #11
        </div>
        {details.map((line, i) => (
          <p
            key={line}
            style={{
              margin: 0,
              marginTop: i === 0 ? 12 : 2,
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

/* --- The slides ------------------------------------------------------------ */

/** 1. The question, over the square entire. It is the accusation the motion
 *  answers rather than the motion, which is the sentence a reader already has
 *  an opinion on, and the reason they stop. The swipe lives here because this
 *  page asks something, so it is the page that can promise an answer. */
export function Hook({
  plate,
  crop,
  details,
  label,
  shout,
  line,
  cta,
}: {
  plate: Plate;
  crop: Crop;
  details: string[];
  label: string;
  shout: { lines: string[]; size: number };
  line: string;
  cta: string;
}) {
  return (
    <Ground plate={plate} crop={crop}>
      <Masthead details={details} />
      <div
        className="ic-on-art"
        style={{ position: "absolute", left: MARGIN, width: W - MARGIN * 2, bottom: H - TEXT_BASE }}
      >
        <Label style={{ marginBottom: 26 }}>{label}</Label>
        {shout.lines.map((l) => (
          <p key={l} style={{ ...CONDENSED, fontSize: shout.size }}>
            {l}
          </p>
        ))}
        <div style={{ marginTop: 30, width: 800 }}>
          <Narration lines={[{ text: line, size: 32, tone: "parchment" }]} />
        </div>
      </div>
      <hr className="ic-rule" style={{ top: RULE }} />
      <UnderRule>{cta}</UnderRule>
    </Ground>
  );
}

/** 2 to 8. A beat of the case: the talking, bottom-anchored so its last line
 *  lands on the division however long it runs, and the sourced fact under the
 *  rule if there is one. */
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
  /** the words this beat is allowed to shout, set above the lines */
  shout?: { lines: string[]; size: number };
  footnote?: string;
}) {
  return (
    <Ground plate={plate} crop={crop}>
      <Counter n={n} of={of} />
      <div
        className="ic-on-art"
        style={{ position: "absolute", left: MARGIN, width: 856, bottom: H - TEXT_BASE }}
      >
        {shout && (
          <div style={{ marginBottom: 40 }}>
            {shout.lines.map((l) => (
              <p key={l} style={{ ...CONDENSED, fontSize: shout.size }}>
                {l}
              </p>
            ))}
          </div>
        )}
        <Narration lines={lines} size={size} />
      </div>
      <hr className="ic-rule" style={{ top: RULE }} />
      {footnote && <UnderRule>{footnote}</UnderRule>}
    </Ground>
  );
}

/** 9. The back cover. Eight pages of argument, then the one page that asks the
 *  reader to turn up, says out loud that the motion itself is held back, and
 *  repeats the details so nobody who read to the end swipes back for them. */
export function Closer({
  plate,
  crop,
  details,
  label,
  invitation,
  notice,
  note,
  lines,
  cta,
}: {
  plate: Plate;
  crop: Crop;
  details: string[];
  label: string;
  invitation: string[];
  notice: string;
  note: string;
  lines: string[];
  cta: string[];
}) {
  return (
    <Ground plate={plate} crop={crop}>
      <Masthead details={details} />
      <div
        className="ic-on-art"
        style={{ position: "absolute", left: MARGIN, width: W - MARGIN * 2, bottom: H - TEXT_BASE }}
      >
        <Label style={{ marginBottom: 26 }}>{label}</Label>
        {invitation.map((l) => (
          <p key={l} style={{ ...CONDENSED, fontSize: 108 }}>
            {l}
          </p>
        ))}
        <p
          style={{
            margin: 0,
            marginTop: 30,
            fontFamily: "var(--cc-font-display)",
            fontStyle: "italic",
            fontSize: 32,
            lineHeight: 1.25,
            color: "var(--cc-ivory)",
          }}
        >
          {notice}
        </p>
        <p
          style={{
            margin: 0,
            marginTop: 10,
            fontFamily: "var(--cc-font-display)",
            fontSize: 24,
            lineHeight: 1.3,
            color: "var(--cc-parchment)",
          }}
        >
          {note}
        </p>
      </div>
      <hr className="ic-rule" style={{ top: RULE }} />
      <div
        className="ic-on-art"
        style={{
          position: "absolute",
          left: MARGIN,
          right: MARGIN,
          top: RULE + 36,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          {lines.map((l) => (
            <div
              key={l}
              className="label"
              style={{ fontSize: 14, letterSpacing: "0.12em", lineHeight: 1.7 }}
            >
              {l}
            </div>
          ))}
        </div>
        <div style={{ textAlign: "right" }}>
          {cta.map((l) => (
            <div
              key={l}
              className="kicker"
              style={{ fontSize: 17, letterSpacing: "0.26em", lineHeight: 1.75 }}
            >
              {l}
            </div>
          ))}
        </div>
      </div>
    </Ground>
  );
}
