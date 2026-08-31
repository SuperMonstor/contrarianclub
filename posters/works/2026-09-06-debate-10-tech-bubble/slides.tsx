import type { CSSProperties, ReactNode } from "react";
import { Lockup } from "../../src/core/kit";
import "./slides.css";

// Debate Club #10. An eight slide carousel announcing the motion on
// Bengaluru's tech bubble.
//
// ---------------------------------------------------------------------------
// The argument
//
//   1  the hook            the city outgrew itself
//   2  the boom            what the industry is worth
//   3  the arrival         what happened to the population
//   4  the ledger          what did not keep up, in four numbers
//   5  the commute         the one number everybody already feels
//   6  the turn            the question the numbers are really asking
//   7  the motion          said outright
//   8  the night           when, where, and who this is with
//
// The deck is deliberately number-led. The temptation with this topic is
// rhetoric, and rhetoric on this topic is exhausted: everybody in the city has
// already heard that the traffic is bad. Facts nobody can wave away do the
// arguing instead, and they leave the reader with something to repeat.
//
// ---------------------------------------------------------------------------
// The grammar
//
// One painting for all eight slides: Bruegel the Elder's Rotterdam Tower of
// Babel (c. 1568). A structure that went up faster than the ground under it
// could take, still growing in raw brick at the top while the finished storeys
// below are already in shadow, and at its foot a small harbour town that never
// grew at all. Slide 1 shows the tower entire, the middle slides move in close
// on it, the last two pull back out to the town.
//
// Which crop carries which slide is not decoration. The boom sits on the raw
// red top, still under construction. The ledger sits on the finished masonry.
// The night sits on the town at the foot, which is the thing the motion says
// got forgotten.
//
// THE HORIZON. One hairline at y=1080 on every slide, running the full width
// with no inset. It never moves. Claims grow above it, slide to slide;
// evidence sits below it at the same size every time. Swiping the deck is the
// boom pulling away from a ground that stays exactly where it is.
//
// FLUSH LEFT, ALWAYS. Every slide sets to one margin at x=92 and nothing on
// this deck is centred, which is why the lockup takes its left cut. The club's
// earlier decks are ceremonial and symmetrical; this one is a dossier, and a
// dossier is set like a document.
//
// THE COMPOSITIONS. Six of them, so no two consecutive slides are the same
// object with the text swapped:
//
//   FIELD    the tower entire, a claim stacked on the lower dark. Slides 1, 7.
//   CLAIM    a close crop, three lines of condensed caps, one fact under the
//            horizon. Slide 2.
//   GROWTH   three years against three numbers, the numbers getting bigger
//            while the year column stays the same width. Slide 3.
//   LEDGER   the picture reduced to masonry, four rows read as a table, with
//            its sources printed. The only slide you have to read. Slide 4.
//   NUMERAL  one number at the size of a picture. Slide 5.
//   TURN     the painting left open, one serif line high on the page, and
//            nothing else at all. The pause before the motion. Slide 6.
//
// COLOUR. Gold is the club talking: kickers, the horizon, the call to action.
// Ivory is the argument. Parchment is evidence. The festival badge brings an
// orange that exists nowhere else in the palette, so it is not repeated through
// the deck: it appears at full strength on the two covers, slide 1 and slide 8,
// in the top right corner opposite the club's own mark, and nowhere in between.
// Two marks on one top line say co-presented without spending a word on it, and
// reading as a foreign seal is the point rather than a problem.
// ---------------------------------------------------------------------------

// This work ships one format, so the canvas is a constant rather than a set of
// ratios. If it ever wants the story size these become functions of `format`.
const W = 1080;
const H = 1350;

const MARGIN = 92;

/** The fixed hairline. The one measurement the whole deck is built around. */
const HORIZON = 1080;
/** Where a claim's last baseline lands, just clear of the horizon. */
const CLAIM_BASE = HORIZON - 58;

const ART_RATIO = 4945 / 3973; // the Rotterdam panel

/** Where in the painting to centre, and how far in. x and y are fractions of
 *  the painting; scale 1 means the painting is exactly one slide wide. */
export interface Crop {
  x: number;
  y: number;
  scale: number;
}

/** Keep the painting over the whole canvas.
 *
 *  A crop centre near an edge of the painting cannot be a slide centre: ask
 *  for the top storeys at y=0.17 and the canvas runs out above them, leaving a
 *  band of bare black with a hard horizontal seam across it. Clamping means a
 *  crop states where you want the eye and the frame stays covered whatever
 *  happens, so these values can be tuned by eye without a class of silent
 *  breakage. Anything below `minScale` cannot cover at all. */
const minScale = (H / W) * ART_RATIO; // 1.556 for this panel at 1080x1350

function CropArt({
  src,
  crop,
  className = "tb-art",
}: {
  src: string;
  crop: Crop;
  className?: string;
}) {
  const w = W * Math.max(crop.scale, minScale);
  const h = w / ART_RATIO;
  const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
  return (
    <img
      className={className}
      src={src}
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

/** Every slide: the painting, its scrim, the horizon, then the content. */
function Ground({
  src,
  crop,
  art = "tb-art",
  scrim = "tb-scrim",
  children,
}: {
  src: string;
  crop: Crop;
  art?: string;
  scrim?: string;
  children: ReactNode;
}) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <CropArt src={src} crop={crop} className={art} />
      <div className={scrim} />
      <hr className="tb-horizon" style={{ top: HORIZON }} />
      <div style={{ position: "absolute", inset: 0, zIndex: 4 }}>{children}</div>
    </div>
  );
}

/* --- The type roles this deck defines for itself -------------------------- */

const CONDENSED: CSSProperties = {
  fontFamily: "var(--cc-font-condensed)",
  fontWeight: 700,
  textTransform: "uppercase",
  lineHeight: 0.94,
  letterSpacing: "-0.004em",
  color: "var(--cc-ivory)",
  margin: 0,
};

function Kicker({ children, top = 92 }: { children: ReactNode; top?: number }) {
  return (
    <div
      className="kicker tb-on-art"
      style={{ position: "absolute", left: MARGIN, top, fontSize: 15, letterSpacing: "0.32em" }}
    >
      {children}
    </div>
  );
}

/** The claim. Bottom-anchored so its last line always lands on the horizon,
 *  whatever size it is set at. */
function Claim({ lines, size }: { lines: string[]; size: number }) {
  return (
    <div
      className="tb-on-art"
      style={{ position: "absolute", left: MARGIN, right: MARGIN, bottom: H - CLAIM_BASE }}
    >
      {lines.map((line) => (
        <div key={line} style={{ ...CONDENSED, fontSize: size }}>
          {line}
        </div>
      ))}
    </div>
  );
}

/** The evidence. Below the horizon, and the same size on every slide. */
function Evidence({ children, width = 856 }: { children: ReactNode; width?: number }) {
  return (
    <p
      className="tb-on-art"
      style={{
        position: "absolute",
        left: MARGIN,
        top: HORIZON + 48,
        width,
        margin: 0,
        fontFamily: "var(--cc-font-ui)",
        fontSize: 25,
        lineHeight: 1.54,
        color: "var(--cc-parchment)",
      }}
    >
      {children}
    </p>
  );
}

/* --- The slides ----------------------------------------------------------- */

/** 1. FIELD. The tower entire, and the whole thesis in three words. Nothing
 *  is sold here: no date, no venue, no call to action. A first slide that
 *  starts selling is a first slide nobody swipes. */
export function Hook({ src, crop, badge }: { src: string; crop: Crop; badge: string }) {
  return (
    <Ground src={src} crop={crop}>
      <div
        style={{
          position: "absolute",
          left: MARGIN,
          right: MARGIN,
          top: 92,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div>
          <Lockup width={250} artwork="left" />
          <div
            className="kicker tb-on-art"
            style={{ marginTop: 30, fontSize: 15, letterSpacing: "0.32em" }}
          >
            Debate Club #10
          </div>
        </div>
        <img
          className="tb-badge"
          src={badge}
          alt="Bengaluru Tech Week 2026, official member event"
          width={288}
        />
      </div>

      <Claim lines={["Bengaluru", "Outgrew", "Bengaluru."]} size={146} />
      <Evidence>A global tech capital, built faster than the city underneath it.</Evidence>
    </Ground>
  );
}

/** 2. CLAIM. On the raw red top storeys, the part still going up. */
export function Boom({ src, crop }: { src: string; crop: Crop }) {
  return (
    <Ground src={src} crop={crop}>
      <Kicker>The boom</Kicker>
      <Claim lines={["The country's", "tech runs out", "of one city."]} size={104} />
      <Evidence>
        Roughly 40% of India's IT exports leave from here. Over two million people work in
        it.
      </Evidence>
    </Ground>
  );
}

/** 3. GROWTH. Three numbers against a year column that does not change width.
 *  The composition is the point: the constant is printed next to the thing
 *  that would not stay constant. */
const YEARS: { year: string; value: string; size: number }[] = [
  { year: "1991", value: "3.3 million", size: 66 },
  { year: "2011", value: "8.5 million", size: 96 },
  { year: "2026", value: "14 million", size: 136 },
];

export function Growth({ src, crop }: { src: string; crop: Crop }) {
  return (
    <Ground src={src} crop={crop}>
      <Kicker>And then everyone moved in</Kicker>
      <div
        className="tb-on-art"
        style={{ position: "absolute", left: MARGIN, right: MARGIN, bottom: H - CLAIM_BASE }}
      >
        {YEARS.map((row) => (
          <div
            key={row.year}
            style={{ display: "flex", alignItems: "baseline", marginTop: 22 }}
          >
            <div
              style={{
                flex: "0 0 156px",
                fontFamily: "var(--cc-font-ui)",
                fontWeight: 600,
                fontSize: 16,
                letterSpacing: "0.26em",
                color: "var(--cc-gold)",
              }}
            >
              {row.year}
            </div>
            <div style={{ ...CONDENSED, fontSize: row.size }}>{row.value}</div>
          </div>
        ))}
      </div>
      <Evidence>
        In twenty years the city took in more people than it had ever held.
      </Evidence>
    </Ground>
  );
}

/** 4. LEDGER. The picture becomes masonry and the slide becomes a table. The
 *  sources are printed because a deck that argues with numbers has to. */
// Each row reads as one sentence continuing out of its own number, and each
// sets on a single line. A table of two-line rows with three words orphaned on
// the second is a table nobody finishes.
const LEDGER: [string, string][] = [
  ["96 km", "of metro after fifteen years of building. Delhi has 420."],
  ["1.28 cr", "vehicles on the roads, and about 2,100 more every day."],
  ["7,000", "borewells ran dry in the summer of 2024, out of 16,000."],
  ["168 hrs", "lost per driver per year, sitting still in rush hour."],
];

export function Ledger({ src, crop }: { src: string; crop: Crop }) {
  return (
    <Ground src={src} crop={crop} art="tb-art-texture" scrim="tb-scrim-flat">
      <Kicker>What did not keep up</Kicker>
      <div
        style={{ position: "absolute", left: MARGIN, right: MARGIN, bottom: H - (HORIZON - 44) }}
      >
        {LEDGER.map(([value, note], i) => (
          <div key={value}>
            {i > 0 && <hr className="tb-row-line" />}
            <div style={{ display: "flex", alignItems: "baseline", padding: "42px 0 44px" }}>
              <div
                style={{
                  ...CONDENSED,
                  flex: "0 0 224px",
                  fontSize: 58,
                  color: "var(--cc-gold)",
                  lineHeight: 1,
                }}
              >
                {value}
              </div>
              <div
                style={{
                  fontFamily: "var(--cc-font-ui)",
                  fontSize: 23,
                  lineHeight: 1.5,
                  color: "var(--cc-parchment)",
                }}
              >
                {note}
              </div>
            </div>
          </div>
        ))}
      </div>
      <Evidence width={860}>
        <span style={{ fontSize: 19, color: "var(--cc-muted)", lineHeight: 1.6 }}>
          Sources: TomTom Traffic Index 2025, Karnataka transport department returns,
          reporting on the 2024 water crisis, Namma Metro and Delhi Metro network length.
        </span>
      </Evidence>
    </Ground>
  );
}

/** 5. NUMERAL. One number set at the size of a picture, because this is the
 *  fact the reader can check on the way home. */
export function Numeral({ src, crop }: { src: string; crop: Crop }) {
  return (
    <Ground src={src} crop={crop}>
      <Kicker>Getting to work</Kicker>
      <div
        className="tb-on-art"
        style={{
          position: "absolute",
          left: MARGIN,
          right: MARGIN,
          bottom: H - CLAIM_BASE,
          display: "flex",
          alignItems: "baseline",
        }}
      >
        <div style={{ ...CONDENSED, fontSize: 340, letterSpacing: "-0.03em" }}>36</div>
        <div style={{ marginLeft: 34 }}>
          <div style={{ ...CONDENSED, fontSize: 54 }}>minutes to cross</div>
          <div style={{ ...CONDENSED, fontSize: 54 }}>ten kilometres.</div>
        </div>
      </div>
      <Evidence>
        Only Mexico City is slower. At peak hour the traffic moves at 14 km/h.
      </Evidence>
    </Ground>
  );
}

/** 6. TURN. The painting is left open and the slide holds one line. After five
 *  slides of numbers the reader has earned a page with nothing on it. */
export function Turn({ src, crop, children }: { src: string; crop: Crop; children: ReactNode }) {
  return (
    <Ground src={src} crop={crop} scrim="tb-scrim-open">
      <p
        className="tb-on-art"
        style={{
          position: "absolute",
          left: MARGIN,
          top: 188,
          width: 856,
          margin: 0,
          fontFamily: "var(--cc-font-display)",
          fontStyle: "italic",
          fontSize: 52,
          lineHeight: 1.3,
          color: "var(--cc-gold-bright)",
        }}
      >
        {children}
      </p>
    </Ground>
  );
}

/** 7. FIELD. The tower entire again, and the motion said outright. */
export function Motion({ src, crop }: { src: string; crop: Crop }) {
  return (
    <Ground src={src} crop={crop}>
      <Kicker>The motion</Kicker>
      <div
        className="tb-on-art"
        style={{ position: "absolute", left: MARGIN, right: MARGIN, bottom: H - CLAIM_BASE }}
      >
        <div
          style={{
            fontFamily: "var(--cc-font-display)",
            fontStyle: "italic",
            fontSize: 42,
            color: "var(--cc-parchment)",
            marginBottom: 22,
          }}
        >
          This club believes
        </div>
        {["Bengaluru", "needs to burst", "its tech bubble."].map((line) => (
          <div key={line} style={{ ...CONDENSED, fontSize: 100 }}>
            {line}
          </div>
        ))}
      </div>
      <Evidence>One of two motions. The second is announced closer to the night.</Evidence>
    </Ground>
  );
}

/** 8. THE NIGHT. The town at the foot of the tower, and the practical page.
 *  Two marks on one top line: the club at the left margin, the festival at the
 *  right. Co-presented, without a word spent saying so. */
export function Night({
  src,
  crop,
  badge,
  lines,
  cta,
}: {
  src: string;
  crop: Crop;
  badge: string;
  lines: string[];
  cta: string;
}) {
  return (
    <Ground src={src} crop={crop} art="tb-art-texture" scrim="tb-scrim-flat">
      <div
        style={{
          position: "absolute",
          left: MARGIN,
          right: MARGIN,
          top: 96,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <Lockup width={250} artwork="left" />
        <img className="tb-badge" src={badge} alt="Bengaluru Tech Week 2026, official member event" width={392} />
      </div>

      <div style={{ position: "absolute", left: MARGIN, right: MARGIN, bottom: H - (HORIZON - 56) }}>
        <div className="kicker" style={{ fontSize: 15, letterSpacing: "0.32em", marginBottom: 34 }}>
          Debate Club #10
        </div>
        {["Sunday, 6 September", "Big Pitcher, Indiranagar", "Time announced soon"].map(
          (line, i) => (
            <div
              key={line}
              className="value"
              style={{
                fontSize: 54,
                lineHeight: 1.34,
                color: i === 2 ? "var(--cc-muted)" : "var(--cc-ivory)",
              }}
            >
              {line}
            </div>
          ),
        )}
      </div>

      <div style={{ position: "absolute", left: MARGIN, right: MARGIN, top: HORIZON + 52 }}>
        {lines.map((line) => (
          <div
            key={line}
            style={{
              fontFamily: "var(--cc-font-ui)",
              fontWeight: 600,
              fontSize: 18,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              lineHeight: 1.92,
              color: "var(--cc-parchment)",
            }}
          >
            {line}
          </div>
        ))}
        <div
          className="kicker"
          style={{ marginTop: 30, fontSize: 17, letterSpacing: "0.3em" }}
        >
          {cta}
        </div>
      </div>
    </Ground>
  );
}
