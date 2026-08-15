import type { ReactNode } from "react";
import { Art, ArtTone, Lockup } from "../../src/core/kit";
import "./slides.css";

// Debate Club #9.
//
// The grammar:
//
//   One painting, one field, edge to edge. No plate, no box, no border. This
//   is the whole lesson of the Open Floor poster: its painting is cropped
//   hard too, but nothing draws a rectangle around it, so the eye reads it as
//   atmosphere and never asks where the rest of it went. Put a painting
//   inside visible edges and it reads as a reproduction instead, and a
//   reproduction that has been cut looks broken.
//
//   So the art is a continuous ground from the top of the poster down, and
//   every band of type sits on it: the lockup on a near-black top, the two
//   contested phrases where the picture ramps into the dark, the copy on the
//   black it becomes. Nothing has an edge of its own.
//
//   The picture carries the argument by itself. Degas paints a family
//   arranged for the record, and the father turned away from all of them in
//   his own chair. Both halves of the motion are in one frame, which is more
//   than the two cropped halves managed between them.
//
//   Type does three jobs and no more. Playfair is the club's voice: the
//   lockup, the one-liner, the vs. Oswald is what the night is: the two
//   phrases, and the three facts under them. Inter appears twice, both small
//   gold caps, both pure utility: the edition number and the call to action.
//
//   Gold is the club talking. Ivory is the two contested phrases, set at one
//   size, because neither side is allowed to win on the page.

const HERO_TOP = 762;
const HERO_SIZE = 96;
const HERO_LINE = Math.round(HERO_SIZE * 1.02);
const VS_H = 44;

export interface PosterCopy {
  kicker: string;
  art: { src: string; position?: string; className?: string };
  /** the two sides, stacked, the vs between them */
  hero: [string, string];
  oneLiner: ReactNode;
  /** how the night works, one line each */
  lines: string[];
  cta: string;
}

const SHADOW =
  "0 1px 2px rgba(0,0,0,0.9), 0 2px 16px rgba(0,0,0,0.78), 0 6px 46px rgba(0,0,0,0.6)";

/** The divider between the two phrases: a hairline broken by the vs. */
function VsRule({ top }: { top: number }) {
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        right: 0,
        height: VS_H,
        zIndex: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
      }}
    >
      <span
        style={{
          width: 300,
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
          width: 300,
          height: 1,
          background:
            "linear-gradient(90deg, var(--cc-line-strong) 12%, transparent)",
        }}
      />
    </div>
  );
}

function Phrase({ children, top }: { children: ReactNode; top: number }) {
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
  const [first, second] = copy.hero;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* The field. Covers the canvas, so core's engraved border never shows:
          this poster is one continuous picture, not a picture in a frame. */}
      <div className="pa-field">
        <Art
          src={copy.art.src}
          position={copy.art.position}
          className={copy.art.className ?? "art"}
        />
        <ArtTone />
        <div className="pa-scrim" />
      </div>

      {/* the club */}
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
        <Lockup width={320} align="center" />
        <div
          className="kicker"
          style={{
            marginTop: 26,
            fontSize: 22,
            letterSpacing: "0.42em",
            textShadow: SHADOW,
          }}
        >
          {copy.kicker}
        </div>
      </div>

      {/* the argument */}
      <Phrase top={HERO_TOP}>{first}</Phrase>
      <VsRule top={HERO_TOP + HERO_LINE} />
      <Phrase top={HERO_TOP + HERO_LINE + VS_H}>{second}</Phrase>

      {/* the terms */}
      <div
        style={{
          position: "absolute",
          top: 1032,
          left: 0,
          right: 0,
          zIndex: 5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
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

        <div style={{ marginTop: 30, textAlign: "center" }}>
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
          style={{ marginTop: 28, fontSize: 20, letterSpacing: "0.34em" }}
        >
          {copy.cta}
        </div>
      </div>
    </div>
  );
}
