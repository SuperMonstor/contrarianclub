import type { CSSProperties } from "react";
import type { Format } from "../../src/core/formats";
import { Lockup } from "../../src/core/kit";
import "./slides.css";

// Debate Club #11. One poster, and the job it has is unusual for this club:
// announce the theme and withhold the motions.
//
// ---------------------------------------------------------------------------
// The argument the layout is making
//
// Both motions are the same question in different clothes. One asks a diaspora
// to give up a public celebration to protect the country's reputation; the
// other would tax adults who choose not to have children. Neither is about
// festivals or about tax. Both are about what a country may demand of a
// private life, so the theme asks that out loud, and each half of the page
// names only what the demand would be for.
//
// "Can" rather than "should", because it carries both readings the room will
// argue: what India is able to ask of you, and what it is entitled to.
//
// A DIPTYCH, FLOOR TO CEILING, BECAUSE THE NIGHT IS ONE ARGUMENT IN TWO CASES.
// Two paintings meet at a gold seam, each running the full height of the page.
// The first cut of this poster hung them in a band across the middle with flat
// black above and below, and two thirds of the page had nothing on it. It read
// as a slide. The paintings are the ground now, and every piece of type sits
// on them, which is what the Debate #9 and #10 posters do and why they read
// as posters.
//
// THE PICTURES CARRY WHAT THE COPY WITHHOLDS. The copy says "for India's
// image" and "for India's future" and nothing else. Bruegel supplies a town
// celebrating in the open, in front of everyone, with the disapproving half of
// the same square watching. Reymerswaele supplies two clerks, a ledger and a
// heap of coins, one of them looking straight out at the reader. A reader who
// works out festivals and money from that has earned it; the motions still
// arrive in the room.
//
// NOTHING DECORATIVE. The edition and the details sit in the top right corner
// opposite the lockup, where a playbill puts them, and that is the only
// flourish. An earlier cut drew a gold double frame over the art, put a tick
// before every label, numbered the halves in gold roman numerals, faded every
// rule and set a glow behind the type. Each of those made it look generated,
// so none of them is here: the paintings run to the edge, the halves are
// plain labels, the rule is a plain hairline and the seam is the gap between
// two prints.
//
// TYPE DOES THREE JOBS. Oswald condensed caps shouts once, for the theme.
// Playfair does all the talking: the two halves, the details, the notice that
// the motions are held back. Inter is the small print, in sentence case. Gold
// is used once, for the call to action, and only it is set in tracked caps.
//
// ---------------------------------------------------------------------------
// The art, public domain via Wikimedia Commons:
//
//   carnival    Pieter Bruegel the Elder, The Fight Between Carnival and Lent
//               (1559, Kunsthistorisches Museum). A vertical slice through the
//               carnival half of the square: rooftops and the round dance at
//               the top, the notable couple led by their fool in the middle,
//               Carnival on his barrel at the bottom.
//   collectors  Marinus van Reymerswaele, The Tax Collectors (first half of
//               the 16th century, National Museum in Warsaw). The clerk who
//               looks back at you, the pointing finger, the coins.

const MARGIN = 92;

/* --- Copy this poster defines for itself ---------------------------------- */

/** A picture, its aspect, and the treatment it was tuned for. Two paintings
 *  from different decades and different light cannot share a filter: the
 *  Bruegel is a bright sanded square that has to come down, the Reymerswaele
 *  is already night-dark and has to come up. */
export interface Plate {
  src: string;
  ratio: number;
  art: string;
}

/** Where in the picture to centre, and how far in. x and y are fractions of
 *  the picture; scale 1 means the picture is exactly one panel wide. A scale
 *  too small to cover the panel is raised until it does. */
export interface Crop {
  x: number;
  y: number;
  scale: number;
}

/** One half of the page: what the demand would be for, and the painting it
 *  is argued on. */
export interface Half {
  label: string;
  plate: Plate;
  crop: Crop;
}

export interface Copy {
  edition: string;
  /** the date, then the time and place, one line each, set in the corner */
  details: string[];
  themeLabel: string;
  /** the theme itself, one line per entry */
  theme: string[];
  halves: [Half, Half];
  /** the line that says the motions are held back */
  notice: string;
  /** how the night works, one line each */
  lines: string[];
  cta: string;
}

/* --- Metrics -------------------------------------------------------------- */

/** The page, at the two sizes this piece ships. Written out per format rather
 *  than derived, because a poster is a fixed composition and a formula that
 *  happens to land on 1350 is not easier to reason about than the number. */
interface Metrics {
  lockupTop: number;
  lockupW: number;
  editionSize: number;
  dateSize: number;
  detailSize: number;
  themeLabelTop: number;
  themeLabelSize: number;
  themeTop: number;
  themeSize: number;
  labelTop: number;
  labelSize: number;
  ruleTop: number;
  noticeSize: number;
  ctaSize: number;
  linesTop: number;
  linesSize: number;
}

const PORTRAIT: Metrics = {
  lockupTop: 84,
  lockupW: 236,
  editionSize: 15,
  dateSize: 28,
  detailSize: 22,
  themeLabelTop: 262,
  themeLabelSize: 16,
  themeTop: 298,
  themeSize: 112,
  labelTop: 930,
  labelSize: 50,
  ruleTop: 1062,
  noticeSize: 30,
  ctaSize: 18,
  linesTop: 1158,
  linesSize: 14,
};

const STORY: Metrics = {
  lockupTop: 124,
  lockupW: 268,
  editionSize: 17,
  dateSize: 32,
  detailSize: 25,
  themeLabelTop: 340,
  themeLabelSize: 18,
  themeTop: 382,
  themeSize: 126,
  labelTop: 1392,
  labelSize: 56,
  ruleTop: 1530,
  noticeSize: 34,
  ctaSize: 20,
  linesTop: 1640,
  linesSize: 16,
};

const metrics = (format: Format): Metrics => (format.height >= 1700 ? STORY : PORTRAIT);

/* --- The ground ----------------------------------------------------------- */

/** Keep the picture over its own panel. A crop centre near an edge cannot be a
 *  panel centre, so the position is clamped: a crop says where the eye should
 *  go, and the panel stays covered regardless. */
function PanelArt({
  plate,
  crop,
  pw,
  ph,
}: {
  plate: Plate;
  crop: Crop;
  pw: number;
  ph: number;
}) {
  const minScale = (ph / pw) * plate.ratio;
  const w = pw * Math.max(crop.scale, minScale);
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
        left: clamp(pw / 2 - crop.x * w, pw - w, 0),
        top: clamp(ph / 2 - crop.y * h, ph - h, 0),
        maxWidth: "none",
      }}
    />
  );
}

/** Where type is allowed to sit, as one gradient over both paintings. It is
 *  built from the metrics rather than written as fixed percentages, because
 *  the zones are the layout: near-black behind the theme, clear through the
 *  middle where the paintings are the content, a ramp under the two halves,
 *  and near-black again under the notice and the details. */
function scrim(m: Metrics, format: Format) {
  const H = format.height;
  const pct = (y: number) => `${((y / H) * 100).toFixed(1)}%`;
  const themeEnd = m.themeTop + m.themeSize * 2 * 0.94;
  return `linear-gradient(180deg,
    rgba(11, 9, 7, 0.82) 0%,
    rgba(11, 9, 7, 0.76) ${pct(themeEnd - 60)},
    rgba(11, 9, 7, 0.3) ${pct(themeEnd + 70)},
    rgba(11, 9, 7, 0.04) ${pct(themeEnd + 150)},
    rgba(11, 9, 7, 0.08) ${pct(m.labelTop - 160)},
    rgba(11, 9, 7, 0.66) ${pct(m.labelTop + m.labelSize + 10)},
    rgba(9, 7, 5, 0.9) ${pct(m.ruleTop - 10)},
    rgba(8, 6, 4, 0.95) 100%)`;
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

/** The small print: sentence case, muted, no tracking. */
const SMALL: CSSProperties = {
  fontFamily: "var(--cc-font-ui)",
  fontWeight: 500,
  color: "var(--cc-muted)",
  margin: 0,
};

/** One half's label. The outer margin is the page margin and the
 *  inner one is half of it, so the two blocks sit symmetrically about the
 *  seam and read as a pair rather than two posters that happen to touch. */
function HalfLabel({
  half,
  side,
  m,
  format,
}: {
  half: Half;
  side: "left" | "right";
  m: Metrics;
  format: Format;
}) {
  const left = side === "left";
  return (
    <div
      className="wo-on-art"
      style={{
        position: "absolute",
        top: m.labelTop,
        left: left ? MARGIN : format.width / 2 + 40,
        right: left ? format.width / 2 + 40 : MARGIN,
      }}
    >
      <p
        style={{
          ...SERIF,
          fontSize: m.labelSize,
          lineHeight: 1.12,
          letterSpacing: "-0.01em",
          color: "var(--cc-ivory)",
        }}
      >
        {half.label}
      </p>
    </div>
  );
}

/* --- The poster ----------------------------------------------------------- */

export function Poster({ copy, format }: { copy: Copy; format: Format }) {
  const m = metrics(format);
  const W = format.width;
  const H = format.height;
  const pw = W / 2;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* the ground: two paintings, floor to ceiling, meeting at the seam */}
      {copy.halves.map((half, i) => (
        <div
          key={half.label}
          style={{
            position: "absolute",
            top: 0,
            height: H,
            left: i === 0 ? 0 : pw,
            width: pw,
            overflow: "hidden",
          }}
        >
          <PanelArt plate={half.plate} crop={half.crop} pw={pw} ph={H} />
        </div>
      ))}
      <div className="wo-scrim" style={{ background: scrim(m, format) }} />
      <div className="wo-seam" style={{ left: pw }} />

      {/* the club, and opposite it the edition and the details */}
      <div style={{ position: "absolute", left: MARGIN, top: m.lockupTop }}>
        <Lockup width={m.lockupW} artwork="left" />
      </div>
      <div
        className="wo-on-art"
        style={{ position: "absolute", right: MARGIN, top: m.lockupTop + 4, textAlign: "right" }}
      >
        <p style={{ ...SMALL, fontSize: m.editionSize + 2 }}>{copy.edition}</p>
        {copy.details.map((line, i) => (
          <p
            key={line}
            style={{
              ...SERIF,
              marginTop: i === 0 ? Math.round(m.dateSize * 0.5) : 2,
              fontSize: i === 0 ? m.dateSize : m.detailSize,
              lineHeight: 1.3,
              color: i === 0 ? "var(--cc-ivory)" : "var(--cc-parchment)",
            }}
          >
            {line}
          </p>
        ))}
      </div>

      {/* the theme */}
      <p
        className="wo-on-art"
        style={{
          ...SMALL,
          position: "absolute",
          left: MARGIN,
          top: m.themeLabelTop,
          fontSize: m.themeLabelSize + 6,
          color: "var(--cc-parchment)",
        }}
      >
        {copy.themeLabel}
      </p>
      <div
        className="wo-on-art"
        style={{ position: "absolute", left: MARGIN, top: m.themeTop, width: W - MARGIN * 2 }}
      >
        {copy.theme.map((line) => (
          <p key={line} style={{ ...CONDENSED, fontSize: m.themeSize }}>
            {line}
          </p>
        ))}
      </div>

      {/* the two halves */}
      <HalfLabel half={copy.halves[0]} side="left" m={m} format={format} />
      <HalfLabel half={copy.halves[1]} side="right" m={m} format={format} />

      {/* the notice, then how the night runs */}
      <div className="wo-rule" style={{ top: m.ruleTop, left: MARGIN, right: MARGIN }} />
      <div
        className="wo-on-art"
        style={{
          position: "absolute",
          left: MARGIN,
          right: MARGIN,
          top: m.ruleTop + 30,
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
        <p
          style={{
            ...SERIF,
            fontSize: m.noticeSize,
            lineHeight: 1.2,
            color: "var(--cc-ivory)",
          }}
        >
          {copy.notice}
        </p>
        <div className="kicker" style={{ fontSize: m.ctaSize, letterSpacing: "0.28em" }}>
          {copy.cta}
        </div>
      </div>
      <div style={{ position: "absolute", left: MARGIN, top: m.linesTop }}>
        {copy.lines.map((line) => (
          <p key={line} style={{ ...SMALL, fontSize: m.linesSize + 2, lineHeight: 1.6 }}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
