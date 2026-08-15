import type { ReactNode } from "react";
import { Art, ArtTone, Lockup } from "../../src/core/kit";
import "./slides.css";

// Debate Club #9. One poster, and the composition is the theme.
//
// The grammar:
//
//   The frame is split down the middle, not across it. Two paintings, two
//   columns, a gold seam between them with the "vs" breaking the line. Left
//   is the individual, right is the group, and you feel the opposition
//   before you read either word. Government and opposition, essentially.
//
//   Each column owns its half completely: its own painting, its own scrim,
//   its own word set at the same size as the other so neither side wins on
//   the page. The lockup sits on the seam at the top, because the club is
//   the thing standing between the two.
//
//   Art region runs full bleed to 960, then each column's scrim ramps to
//   near-black so the picture dissolves into the copy plate rather than
//   stopping at an edge. Everything below 960 is type on black: the
//   one-liner that names the question, the three lines that say how the
//   night works, the call to action.
//
// Gold means the club's own voice here: the seam, the vs, the kicker, the
// call to action. Ivory is the two contested words. Nothing else is gold, so
// gold never means "one of the sides".

const ART_H = 940; // where the paintings give way to the copy plate
const SEAM = 540; // the split, dead centre
const FRAME = 47; // core's engraved border, inner line

/** One side of the argument: a painting, a qualifier, and the word itself. */
export interface Side {
  /** small gold qualifier above the word: PERSONAL, SOCIAL */
  label: string;
  /** the contested noun, set large */
  word: string;
  /** tuned per side so the two words come out the same width on the page.
   *  Equal size would hand the longer word more of the poster, and neither
   *  side is allowed to win before the debate. */
  size: number;
  art: { src: string; position?: string; className?: string };
}

export interface PosterCopy {
  kicker: string;
  /** exactly two, left then right */
  sides: [Side, Side];
  oneLiner: ReactNode;
  /** how the night works, one sentence per line */
  lines: string[];
  cta: string;
}

const SHADOW =
  "0 1px 2px rgba(0,0,0,0.9), 0 2px 16px rgba(0,0,0,0.78), 0 6px 46px rgba(0,0,0,0.6)";

/** One column of the diptych: a painting, clipped, with its word over it. */
function Column({ side, edge }: { side: Side; edge: "left" | "right" }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: edge === "left" ? 0 : SEAM,
        width: SEAM,
        height: ART_H,
        overflow: "hidden",
      }}
    >
      <Art
        src={side.art.src}
        position={side.art.position}
        className={side.art.className ?? "art"}
      />
      <ArtTone />
      <div className="pa-scrim" />

      <div
        style={{
          position: "absolute",
          inset: "auto 0 0 0",
          zIndex: 2,
          paddingBottom: 66,
          paddingLeft: 30,
          paddingRight: 30,
          textAlign: "center",
        }}
      >
        <div
          className="kicker"
          style={{ fontSize: 18, letterSpacing: "0.36em", textShadow: SHADOW }}
        >
          {side.label}
        </div>
        <div
          style={{
            marginTop: 14,
            fontFamily: "var(--cc-font-condensed)",
            fontWeight: 700,
            fontSize: side.size,
            lineHeight: 1,
            letterSpacing: "0.005em",
            textTransform: "uppercase",
            color: "var(--cc-ivory)",
            textShadow: SHADOW,
          }}
        >
          {side.word}
        </div>
      </div>
    </div>
  );
}

export function Poster({ copy }: { copy: PosterCopy }) {
  const [left, right] = copy.sides;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Column side={left} edge="left" />
      <Column side={right} edge="right" />

      {/* the seam, and the vs breaking it */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: SEAM,
          width: 1,
          height: ART_H,
          zIndex: 3,
          background:
            "linear-gradient(180deg, rgba(200,162,74,0.06) 0%, rgba(200,162,74,0.5) 22%, rgba(200,162,74,0.5) 78%, rgba(200,162,74,0) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 815,
          left: SEAM - 29,
          width: 58,
          height: 42,
          zIndex: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--cc-black)",
          border: "1px solid var(--cc-line-strong)",
          fontFamily: "var(--cc-font-display)",
          fontStyle: "italic",
          fontSize: 27,
          color: "var(--cc-gold)",
        }}
      >
        vs
      </div>

      {/* the club, standing on the seam */}
      <div
        style={{
          position: "absolute",
          top: 58,
          left: 0,
          right: 0,
          zIndex: 5,
          textAlign: "center",
        }}
      >
        <Lockup width={260} align="center" />
        <div
          className="kicker"
          style={{
            marginTop: 30,
            fontSize: 20,
            letterSpacing: "0.4em",
            textShadow: SHADOW,
          }}
        >
          {copy.kicker}
        </div>
      </div>

      {/* the copy plate */}
      <div
        style={{
          position: "absolute",
          top: ART_H,
          left: 0,
          right: 0,
          bottom: FRAME,
          zIndex: 5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          className="one-liner"
          style={{
            fontSize: 31,
            lineHeight: 1.26,
            maxWidth: 660,
            textAlign: "center",
          }}
        >
          {copy.oneLiner}
        </div>

        <hr className="rule" style={{ width: 150, margin: "30px 0 26px" }} />

        <div style={{ textAlign: "center" }}>
          {copy.lines.map((line) => (
            <div
              key={line}
              className="value"
              style={{ fontSize: 26, lineHeight: 1.58, color: "var(--cc-parchment)" }}
            >
              {line}
            </div>
          ))}
        </div>

        <div
          className="kicker"
          style={{ marginTop: 30, fontSize: 20, letterSpacing: "0.34em" }}
        >
          {copy.cta}
        </div>
      </div>

      {/* The engraved border again, on top. Core draws it under the art, which
          is right for a poster whose picture is full bleed: it disappears.
          This one runs edge to edge over both paintings so the frame reads as
          a frame rather than as three sides of a rectangle around the copy. */}
      <div className="pa-frame" />
    </div>
  );
}
