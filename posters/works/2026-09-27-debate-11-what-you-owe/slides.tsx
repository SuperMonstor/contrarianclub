import type { CSSProperties } from "react";
import type { Format } from "../../src/core/formats";
import { Lockup } from "../../src/core/kit";
import "./slides.css";

// Debate Club #11. One poster, and the job it has is unusual for this club:
// announce the themes and withhold the motions.
//
// ---------------------------------------------------------------------------
// The argument the layout is making
//
// Both motions are the same question in different clothes. One asks a diaspora
// to give up a public celebration to protect the country's reputation; the
// other asks a childfree adult to give up money to fix its birth rate. Neither
// is about festivals or about tax. Both are about what the collective may ask
// of a private life, so the poster asks that out loud and hangs the two
// instances underneath it.
//
// A DIPTYCH, BECAUSE THE NIGHT IS ONE ARGUMENT IN TWO CASES. Two panels, one
// band, a gold seam down the middle. Read as a pair they say "two motions, one
// question", which is the whole reason these two motions are on the same bill.
// Debate #9 put its two motions on separate slides and needed a sixth slide to
// tie them together. This is a single image and does not get that chance.
//
// THE PICTURES CARRY WHAT THE COPY WITHHOLDS. Bruegel gives a town celebrating
// in the open, in front of everyone, with the disapproving half of the same
// square watching. Reymerswaele gives two clerks, a ledger and a heap of
// coins, one of them looking straight out at the reader. The questions never
// say festival, and never say tax; the paintings do it for them, which is what
// keeps the motions unspent while the themes are genuinely on the page.
//
// THE QUESTIONS ARE THE THEMES, PHRASED AS QUESTIONS RATHER THAN SUBJECTS.
// "Diaspora and national image" is a syllabus entry and nobody argues with a
// syllabus. Both panels open on "If you", because the thing being decided in
// the room is what the country may ask of the person reading the poster.
//
// TYPE DOES THREE JOBS. Oswald condensed caps shouts once, for the question
// both motions sit under. Playfair does all the talking: the two themes, and
// the details. Inter appears small and gold only where it is pure utility: the
// edition, the theme labels, the format, the call to action.
//
// FLUSH LEFT ON THE PAGE MARGIN, and inside the band each column takes its own
// outer margin, so the two theme blocks sit symmetrically about the seam. The
// lockup takes its left cut, because this page sets nothing on a centre.
//
// ---------------------------------------------------------------------------
// The art, public domain via Wikimedia Commons:
//
//   carnival    Pieter Bruegel the Elder, The Fight Between Carnival and Lent
//               (1559, Kunsthistorisches Museum). The crop is the carnival
//               half: the barrel, the pie hat, the musicians. Chosen over the
//               Peasant Dance because the painting already contains the
//               argument, with the church and its penitents in the same
//               square, and a crop can move between them later.
//   collectors  Marinus van Reymerswaele, The Tax Collectors (first half of
//               the 16th century, National Museum in Warsaw). The ledger, the
//               coins, and the one face in the poster that looks back at you.

const MARGIN = 92;

/* --- Copy this poster defines for itself ---------------------------------- */

/** A picture, its aspect, and the treatment it was tuned for. Two paintings
 *  four centuries and one medium apart cannot share a filter: the Bruegel is a
 *  bright sanded square that has to come down, the Reymerswaele is already
 *  night-dark and has to come up. */
export interface Plate {
  src: string;
  ratio: number;
  art: string;
}

/** Where in the picture to centre, and how far in. x and y are fractions of
 *  the picture; scale 1 means the picture is exactly one panel wide. */
export interface Crop {
  x: number;
  y: number;
  scale: number;
}

/** One theme: the picture it is argued on, and the question that is as much
 *  of it as anybody gets before the room. Line breaks are copy here, as
 *  everywhere in this repo, and they go at phrase boundaries. */
export interface Theme {
  label: string;
  plate: Plate;
  crop: Crop;
  question: string[];
}

export interface Copy {
  kicker: string;
  /** the question both motions sit under */
  hero: string[];
  oneLiner: string;
  themes: [Theme, Theme];
  when: string;
  where: string;
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
  kickerTop: number;
  kickerSize: number;
  heroTop: number;
  heroSize: number;
  oneLinerTop: number;
  oneLinerSize: number;
  bandTop: number;
  bandH: number;
  labelSize: number;
  questionSize: number;
  whenTop: number;
  whenSize: number;
  whereSize: number;
  ctaTop: number;
  ctaSize: number;
  formatTop: number;
  formatSize: number;
  /** portrait sets the format lines against the right margin, across from the
   *  date, because the page is short. The story has room to stack them. */
  formatRight: boolean;
}

const PORTRAIT: Metrics = {
  lockupTop: 76,
  lockupW: 236,
  kickerTop: 208,
  kickerSize: 17,
  heroTop: 254,
  heroSize: 90,
  oneLinerTop: 446,
  oneLinerSize: 28,
  bandTop: 520,
  bandH: 500,
  labelSize: 15,
  questionSize: 31,
  whenTop: 1066,
  whenSize: 36,
  whereSize: 28,
  ctaTop: 1212,
  ctaSize: 19,
  formatTop: 1074,
  formatSize: 15,
  formatRight: true,
};

const STORY: Metrics = {
  lockupTop: 132,
  lockupW: 268,
  kickerTop: 296,
  kickerSize: 19,
  heroTop: 350,
  heroSize: 104,
  oneLinerTop: 586,
  oneLinerSize: 32,
  bandTop: 686,
  bandH: 700,
  labelSize: 16,
  questionSize: 31,
  whenTop: 1440,
  whenSize: 42,
  whereSize: 32,
  ctaTop: 1762,
  ctaSize: 21,
  formatTop: 1612,
  formatSize: 17,
  formatRight: false,
};

const metrics = (format: Format): Metrics => (format.height >= 1700 ? STORY : PORTRAIT);

/* --- The band ------------------------------------------------------------- */

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

/** Half the band: a painting, the scrim that says where type may sit on it,
 *  and one theme. The outer margin is the page margin and the inner one is
 *  half of it, which is what makes the two blocks read as a pair rather than
 *  as two posters that happen to be adjacent. */
function Panel({
  theme,
  side,
  m,
  format,
}: {
  theme: Theme;
  side: "left" | "right";
  m: Metrics;
  format: Format;
}) {
  const pw = format.width / 2;
  const left = side === "left";
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        height: m.bandH,
        left: left ? 0 : pw,
        width: pw,
        overflow: "hidden",
      }}
    >
      <PanelArt plate={theme.plate} crop={theme.crop} pw={pw} ph={m.bandH} />
      <div className="wo-scrim" />
      <div
        style={{
          position: "absolute",
          zIndex: 4,
          left: left ? MARGIN : 40,
          right: left ? 40 : MARGIN,
          bottom: 38,
        }}
      >
        <div className="wo-tick" />
        <div
          className="kicker"
          style={{ fontSize: m.labelSize, letterSpacing: "0.3em", marginTop: 14 }}
        >
          {theme.label}
        </div>
        {theme.question.map((line, i) => (
          <p
            key={i}
            style={{
              margin: 0,
              marginTop: i === 0 ? 18 : 0,
              fontFamily: "var(--cc-font-display)",
              fontWeight: 400,
              fontSize: m.questionSize,
              lineHeight: 1.26,
              letterSpacing: "-0.005em",
              color: "var(--cc-ivory)",
            }}
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

/* --- The poster ----------------------------------------------------------- */

const CONDENSED: CSSProperties = {
  fontFamily: "var(--cc-font-condensed)",
  fontWeight: 700,
  textTransform: "uppercase",
  lineHeight: 0.94,
  letterSpacing: "-0.004em",
  color: "var(--cc-ivory)",
  margin: 0,
};

export function Poster({ copy, format }: { copy: Copy; format: Format }) {
  const m = metrics(format);
  const bandBottom = m.bandTop + m.bandH;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* the club, then the edition */}
      <div style={{ position: "absolute", left: MARGIN, top: m.lockupTop }}>
        <Lockup width={m.lockupW} artwork="left" />
      </div>
      <div
        className="kicker"
        style={{
          position: "absolute",
          left: MARGIN,
          top: m.kickerTop,
          fontSize: m.kickerSize,
          letterSpacing: "0.32em",
        }}
      >
        {copy.kicker}
      </div>

      {/* the question both motions sit under */}
      <div
        style={{
          position: "absolute",
          left: MARGIN,
          top: m.heroTop,
          width: format.width - MARGIN * 2,
        }}
      >
        {copy.hero.map((line, i) => (
          <p key={i} style={{ ...CONDENSED, fontSize: m.heroSize }}>
            {line}
          </p>
        ))}
      </div>
      <p
        className="one-liner"
        style={{
          position: "absolute",
          left: MARGIN,
          top: m.oneLinerTop,
          margin: 0,
          fontFamily: "var(--cc-font-display)",
          fontSize: m.oneLinerSize,
          lineHeight: 1.3,
          color: "var(--cc-parchment)",
        }}
      >
        {copy.oneLiner}
      </p>

      {/* the two themes, one band, a seam between them */}
      <div className="wo-edge" style={{ top: m.bandTop }} />
      <div style={{ position: "absolute", left: 0, top: m.bandTop, width: format.width, height: m.bandH }}>
        <Panel theme={copy.themes[0]} side="left" m={m} format={format} />
        <Panel theme={copy.themes[1]} side="right" m={m} format={format} />
        <div className="wo-seam" style={{ left: format.width / 2 }} />
      </div>
      <div className="wo-edge" style={{ top: bandBottom }} />

      {/* when, where, and how the night runs */}
      <div style={{ position: "absolute", left: MARGIN, top: m.whenTop }}>
        <p
          style={{
            margin: 0,
            fontFamily: "var(--cc-font-display)",
            fontWeight: 400,
            fontSize: m.whenSize,
            lineHeight: 1.16,
            color: "var(--cc-ivory)",
          }}
        >
          {copy.when}
        </p>
        <p
          style={{
            margin: 0,
            marginTop: 12,
            fontFamily: "var(--cc-font-display)",
            fontWeight: 400,
            fontSize: m.whereSize,
            lineHeight: 1.2,
            color: "var(--cc-parchment)",
          }}
        >
          {copy.where}
        </p>
      </div>
      <div
        style={{
          position: "absolute",
          ...(m.formatRight ? { right: MARGIN } : { left: MARGIN }),
          top: m.formatTop,
          textAlign: m.formatRight ? "right" : "left",
        }}
      >
        {copy.lines.map((line) => (
          <div
            key={line}
            className="label"
            style={{
              fontSize: m.formatSize,
              letterSpacing: "0.12em",
              lineHeight: 1.7,
            }}
          >
            {line}
          </div>
        ))}
      </div>
      <div
        className="kicker"
        style={{
          position: "absolute",
          left: MARGIN,
          top: m.ctaTop,
          fontSize: m.ctaSize,
          letterSpacing: "0.28em",
        }}
      >
        {copy.cta}
      </div>
    </div>
  );
}
