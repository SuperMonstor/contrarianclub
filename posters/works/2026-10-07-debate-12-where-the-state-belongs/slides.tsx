import type { CSSProperties } from "react";
import type { Format } from "../../src/core/formats";
import { Lockup } from "../../src/core/kit";
import "./slides.css";

// Debate Club #12. One poster: the theme now, the motions in the room.
//
// ---------------------------------------------------------------------------
// The argument the layout is making
//
// The night has two subjects that look unrelated: the education system and
// government schools, and the law as it sits inside a relationship. What they
// share is the state. In one it runs the room; in the other it writes the
// terms between two people. So the theme asks the question both motions will
// argue, "Where does the state belong?", and each picture names only where.
//
// TWO ROOMS STACKED, THE STATE BETWEEN THEM. The classroom fills the top of
// the page, the marriage contract fills the bottom, both run edge to edge,
// and the theme sits in the dark where the two meet. #11 was a side by side
// diptych; this is the same idea turned on its side, because here the
// question is not "for what" but "where", and the eye should travel from one
// room, through the question, into the other.
//
// THE PICTURES DO THE HINTING. Steen's schoolmaster trims his quill while the
// school runs riot around him and a boy sleeps on the floor. Hogarth's two
// fathers haggle over the settlement while the couple turn their backs on
// each other and the lawyer leans in to the bride. Neither motion is named.
//
// TYPE DOES THREE JOBS. Oswald condensed caps shouts once, for the theme.
// Playfair names the two rooms and the edition. Inter is the small print in
// sentence case. Gold is used once, for the line that says the motions are
// held back, and only it is set in tracked caps.
//
// ---------------------------------------------------------------------------
// The art, public domain via Wikimedia Commons:
//
//   school      Jan Steen, A School for Boys and Girls (c. 1670, Scottish
//               National Gallery). The schoolmaster and his quill, the girl
//               at the desk, the boy asleep on the floor.
//   settlement  William Hogarth, Marriage A-la-Mode 1: The Marriage
//               Settlement (c. 1743, National Gallery, London). The couple
//               back to back, the lawyer, the contract on the table.

const MARGIN = 84;

/* --- Copy this poster defines for itself ---------------------------------- */

/** A painting, its aspect, and the filter class tuned for it. */
export interface Plate {
  src: string;
  ratio: number;
  art: string;
}

/** Where to centre, as fractions of the picture, and how far in. scale 1
 *  means the picture is exactly one page wide; too small to cover the band is
 *  raised until it does. */
export interface Crop {
  x: number;
  y: number;
  scale: number;
}

/** One of the two rooms: its name on the page, and the picture of it. */
export interface Room {
  label: string;
  plate: Plate;
  /** one crop per format family, because the bands change shape */
  crop: { portrait: Crop; story: Crop };
}

export interface Copy {
  edition: string;
  themeLabel: string;
  /** the theme, one line per entry */
  theme: string[];
  rooms: [Room, Room];
  /** the line that says the motions are held back */
  notice: string;
  /** how the night works, one line each */
  lines: string[];
}

/* --- Metrics -------------------------------------------------------------- */

interface Metrics {
  family: "portrait" | "story";
  lockupTop: number;
  lockupW: number;
  editionSize: number;
  /** where the two bands meet, and the middle of the theme */
  split: number;
  themeLabelSize: number;
  themeSize: number;
  labelSize: number;
  /** baseline-ish tops of the two room labels */
  labelTopA: number;
  labelTopB: number;
  ruleTop: number;
  noticeSize: number;
  linesSize: number;
}

const PORTRAIT: Metrics = {
  family: "portrait",
  lockupTop: 76,
  lockupW: 230,
  editionSize: 30,
  split: 676,
  themeLabelSize: 21,
  themeSize: 118,
  labelSize: 44,
  labelTopA: 404,
  labelTopB: 1010,
  ruleTop: 1150,
  noticeSize: 17,
  linesSize: 16,
};

const STORY: Metrics = {
  family: "story",
  lockupTop: 132,
  lockupW: 262,
  editionSize: 34,
  split: 958,
  themeLabelSize: 23,
  themeSize: 128,
  labelSize: 50,
  labelTopA: 660,
  labelTopB: 1450,
  ruleTop: 1650,
  noticeSize: 19,
  linesSize: 18,
};

const metrics = (format: Format): Metrics => (format.height >= 1700 ? STORY : PORTRAIT);

/* --- The ground ----------------------------------------------------------- */

function BandArt({ plate, crop, bw, bh }: { plate: Plate; crop: Crop; bw: number; bh: number }) {
  const minScale = (bh / bw) * plate.ratio;
  const w = bw * Math.max(crop.scale, minScale, 1);
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
        left: clamp(bw / 2 - crop.x * w, bw - w, 0),
        top: clamp(bh / 2 - crop.y * h, bh - h, 0),
        maxWidth: "none",
      }}
    />
  );
}

/** Where type may sit on each band, built from the layout's own numbers.
 *  Top band: soft under the lockup, open over the classroom, then down to
 *  near-black at the split. Bottom band: near-black at the split, open over
 *  the settlement, then down again under the notice. The two meet at the same
 *  black, so the theme sits on one dark ground with a room either side. */
function scrimTop(m: Metrics) {
  const pct = (y: number) => `${((y / m.split) * 100).toFixed(1)}%`;
  return `linear-gradient(180deg,
    rgba(11, 9, 7, 0.7) 0%,
    rgba(11, 9, 7, 0.34) ${pct(m.lockupTop + m.lockupW * 0.42 + 40)},
    rgba(11, 9, 7, 0.06) ${pct(m.lockupTop + m.lockupW * 0.42 + 120)},
    rgba(11, 9, 7, 0.12) ${pct(m.labelTopA - 110)},
    rgba(11, 9, 7, 0.62) ${pct(m.labelTopA + m.labelSize + 20)},
    rgba(11, 9, 7, 0.96) ${pct(m.split - m.themeSize * 0.9)},
    rgba(11, 9, 7, 0.97) 100%)`;
}

function scrimBottom(m: Metrics, H: number) {
  const bh = H - m.split;
  const pct = (y: number) => `${(((y - m.split) / bh) * 100).toFixed(1)}%`;
  return `linear-gradient(180deg,
    rgba(11, 9, 7, 0.97) 0%,
    rgba(11, 9, 7, 0.95) ${pct(m.split + m.themeSize * 1.05)},
    rgba(11, 9, 7, 0.22) ${pct(m.split + m.themeSize * 1.05 + 150)},
    rgba(11, 9, 7, 0.08) ${pct(m.labelTopB - 80)},
    rgba(11, 9, 7, 0.6) ${pct(m.labelTopB + m.labelSize + 20)},
    rgba(9, 7, 5, 0.92) ${pct(m.ruleTop - 6)},
    rgba(8, 6, 4, 0.96) 100%)`;
}

/* --- Type ----------------------------------------------------------------- */

const CONDENSED: CSSProperties = {
  fontFamily: "var(--cc-font-condensed)",
  fontWeight: 700,
  textTransform: "uppercase",
  lineHeight: 0.94,
  letterSpacing: "-0.004em",
  color: "var(--cc-ivory)",
  margin: 0,
};

const SERIF: CSSProperties = {
  fontFamily: "var(--cc-font-display)",
  fontWeight: 400,
  margin: 0,
};

const SMALL: CSSProperties = {
  fontFamily: "var(--cc-font-ui)",
  fontWeight: 500,
  color: "var(--cc-muted)",
  margin: 0,
};

/* --- The poster ----------------------------------------------------------- */

export function Poster({ copy, format }: { copy: Copy; format: Format }) {
  const m = metrics(format);
  const W = format.width;
  const H = format.height;
  const [a, b] = copy.rooms;
  const themeH = copy.theme.length * m.themeSize * 0.94;
  const themeTop = m.split - themeH / 2 - m.themeLabelSize * 0.5;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* the ground: the classroom above, the contract below */}
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: m.split, overflow: "hidden" }}>
        <BandArt plate={a.plate} crop={a.crop[m.family]} bw={W} bh={m.split} />
        <div className="ws-scrim" style={{ background: scrimTop(m) }} />
      </div>
      <div
        style={{ position: "absolute", left: 0, top: m.split, width: W, height: H - m.split, overflow: "hidden" }}
      >
        <BandArt plate={b.plate} crop={b.crop[m.family]} bw={W} bh={H - m.split} />
        <div className="ws-scrim" style={{ background: scrimBottom(m, H) }} />
      </div>

      {/* the club, and opposite it the edition */}
      <div style={{ position: "absolute", left: MARGIN, top: m.lockupTop }}>
        <Lockup width={m.lockupW} artwork="left" />
      </div>
      <p
        className="ws-on-art"
        style={{
          ...SERIF,
          position: "absolute",
          right: MARGIN,
          top: m.lockupTop - 4,
          fontSize: m.editionSize,
          lineHeight: 1.2,
          color: "var(--cc-ivory)",
        }}
      >
        {copy.edition}
      </p>

      {/* the first room, named at the foot of its picture */}
      <p
        className="ws-on-art"
        style={{
          ...SERIF,
          position: "absolute",
          left: MARGIN,
          top: m.labelTopA,
          fontSize: m.labelSize,
          lineHeight: 1.1,
          letterSpacing: "-0.01em",
          color: "var(--cc-ivory)",
        }}
      >
        {a.label}
      </p>

      {/* the theme, on the dark where the two rooms meet */}
      <div style={{ position: "absolute", left: MARGIN, right: MARGIN, top: themeTop - m.themeLabelSize * 2.2 }}>
        <p style={{ ...SMALL, fontSize: m.themeLabelSize, color: "var(--cc-parchment)" }}>{copy.themeLabel}</p>
        <div style={{ marginTop: Math.round(m.themeLabelSize * 0.9) }}>
          {copy.theme.map((line) => (
            <p key={line} style={{ ...CONDENSED, fontSize: m.themeSize }}>
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* the second room, named at the foot of its picture, opposite side */}
      <p
        className="ws-on-art"
        style={{
          ...SERIF,
          position: "absolute",
          right: MARGIN,
          top: m.labelTopB,
          fontSize: m.labelSize,
          lineHeight: 1.1,
          letterSpacing: "-0.01em",
          color: "var(--cc-ivory)",
          textAlign: "right",
        }}
      >
        {b.label}
      </p>

      {/* the notice, then how the night runs */}
      <div className="ws-rule" style={{ top: m.ruleTop, left: MARGIN, right: MARGIN }} />
      <div
        style={{
          position: "absolute",
          left: MARGIN,
          right: MARGIN,
          top: m.ruleTop + 34,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div className="kicker" style={{ fontSize: m.noticeSize, letterSpacing: "0.26em", lineHeight: 1.5 }}>
          {copy.notice}
        </div>
        <div style={{ textAlign: "right" }}>
          {copy.lines.map((line) => (
            <p key={line} style={{ ...SMALL, fontSize: m.linesSize, lineHeight: 1.6 }}>
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
