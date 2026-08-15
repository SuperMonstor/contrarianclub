import type { ReactNode } from "react";
import { Art, ArtTone, Lockup } from "../../src/core/kit";
import "./slides.css";

// Debate Club #9. One poster, and the composition is the theme.
//
// The grammar:
//
//   Masthead, plate, hero, copy. Four bands, in that order, each doing one
//   job. The club sits on flat black at the top where nothing competes with
//   it. The picture is a plate below that, split down the middle: two
//   paintings, a gold seam between them, left the individual and right the
//   group. The seam stops where the picture ramps into black, and the two
//   contested words take the full width of the poster below it, stacked, with
//   the divider rotated flat and the vs breaking it. So the split is vertical
//   in the picture and horizontal in the words: the same line, turned.
//
//   Type does three jobs and no more, which is the only reason a poster this
//   dense holds together. Playfair is the club's voice: the lockup, the
//   one-liner, the vs. Oswald is what the night is: the two words, and the
//   three facts under them. Inter appears twice, both small gold caps, both
//   pure utility: the edition number and the call to action.
//
//   Gold is the club talking. The seam, the vs, the kicker, the CTA. Ivory is
//   the two contested words, weighted identically, because neither side is
//   allowed to win on the page.

const MASTHEAD = 265; // black band: the lockup gets a dead quiet ground
const ART_BOTTOM = 1000; // where the plate gives way to the copy
const SEAM = 540; // the split, dead centre
const SEAM_END = 640; // the seam stops before the hero: it belongs to the picture
const HERO_TOP = 690;
const HERO_SIZE = 126;
const FRAME = 47; // core's engraved border, inner line

/** One side of the argument: a painting and the word it carries. */
export interface Side {
  /** the contested noun, set large under the plate */
  word: string;
  art: { src: string; position?: string; className?: string };
}

export interface PosterCopy {
  kicker: string;
  /** exactly two, left then right, in the order they are argued */
  sides: [Side, Side];
  oneLiner: ReactNode;
  /** how the night works, one line each */
  lines: string[];
  cta: string;
}

const SHADOW =
  "0 1px 2px rgba(0,0,0,0.9), 0 2px 16px rgba(0,0,0,0.78), 0 6px 46px rgba(0,0,0,0.6)";

/** Half the plate: a painting, clipped to its column. */
function Column({ side, edge }: { side: Side; edge: "left" | "right" }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: edge === "left" ? 0 : SEAM,
        width: SEAM,
        height: ART_BOTTOM - MASTHEAD,
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
    </div>
  );
}

/** The flat divider between the two words: the seam, rotated. */
function VsRule() {
  return (
    <div
      style={{
        position: "absolute",
        top: HERO_TOP + Math.round(HERO_SIZE * 1.02),
        left: 0,
        right: 0,
        height: 44,
        zIndex: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
      }}
    >
      <span
        style={{
          width: 330,
          height: 1,
          background:
            "linear-gradient(90deg, transparent, var(--cc-line-strong) 88%)",
        }}
      />
      <span
        style={{
          fontFamily: "var(--cc-font-display)",
          fontStyle: "italic",
          fontSize: 30,
          color: "var(--cc-gold)",
          textShadow: SHADOW,
        }}
      >
        vs
      </span>
      <span
        style={{
          width: 330,
          height: 1,
          background:
            "linear-gradient(90deg, var(--cc-line-strong) 12%, transparent)",
        }}
      />
    </div>
  );
}

function Word({ children, top }: { children: ReactNode; top: number }) {
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        right: 0,
        zIndex: 4,
        textAlign: "center",
        fontFamily: "var(--cc-font-condensed)",
        fontWeight: 700,
        fontSize: HERO_SIZE,
        lineHeight: 1.02,
        letterSpacing: "0.004em",
        textTransform: "uppercase",
        color: "var(--cc-ivory)",
        textShadow: SHADOW,
      }}
    >
      {children}
    </div>
  );
}

export function Poster({ copy }: { copy: PosterCopy }) {
  const [left, right] = copy.sides;
  const lineH = Math.round(HERO_SIZE * 1.02);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* the masthead, on flat black */}
      <div
        style={{
          position: "absolute",
          top: 46,
          left: 0,
          right: 0,
          zIndex: 5,
          textAlign: "center",
        }}
      >
        <Lockup width={320} align="center" />
        <div
          className="kicker"
          style={{ marginTop: 27, fontSize: 22, letterSpacing: "0.42em" }}
        >
          {copy.kicker}
        </div>
      </div>

      {/* the plate */}
      <div
        style={{
          position: "absolute",
          top: MASTHEAD,
          left: 0,
          right: 0,
          height: ART_BOTTOM - MASTHEAD,
          overflow: "hidden",
        }}
      >
        <Column side={left} edge="left" />
        <Column side={right} edge="right" />
        {/* The seam. A bare hairline disappears into a lit painting, so it
            runs in its own dark gutter: the two pictures are cut apart, and
            the gold line sits in the cut. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: SEAM - 2,
            width: 4,
            height: SEAM_END - MASTHEAD,
            zIndex: 3,
            background:
              "linear-gradient(90deg, rgba(11,9,7,0.92) 0 1.5px, rgba(200,162,74,0.75) 1.5px 2.5px, rgba(11,9,7,0.92) 2.5px 4px)",
            WebkitMaskImage:
              "linear-gradient(180deg, #000 0%, #000 68%, transparent 100%)",
            maskImage:
              "linear-gradient(180deg, #000 0%, #000 68%, transparent 100%)",
          }}
        />
      </div>

      {/* the hero, taking the full width the columns could not give it */}
      <Word top={HERO_TOP}>{left.word}</Word>
      <VsRule />
      <Word top={HERO_TOP + lineH + 44}>{right.word}</Word>

      {/* the copy plate */}
      <div
        style={{
          position: "absolute",
          top: ART_BOTTOM,
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
          style={{
            fontFamily: "var(--cc-font-display)",
            fontSize: 34,
            lineHeight: 1.3,
            color: "var(--cc-parchment)",
            textAlign: "center",
          }}
        >
          {copy.oneLiner}
        </div>

        <div style={{ marginTop: 32, textAlign: "center" }}>
          {copy.lines.map((line) => (
            <div
              key={line}
              style={{
                fontFamily: "var(--cc-font-condensed)",
                fontWeight: 400,
                fontSize: 21,
                lineHeight: 1.72,
                letterSpacing: "0.11em",
                textTransform: "uppercase",
                color: "var(--cc-parchment)",
              }}
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
          This one runs edge to edge over the plate so the frame reads as a
          frame rather than as three sides of a rectangle around the copy. */}
      <div className="pa-frame" />
    </div>
  );
}
