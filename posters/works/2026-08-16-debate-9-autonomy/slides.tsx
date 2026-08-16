import type { ReactNode } from "react";
import { Art, ArtTone, Lockup } from "../../src/core/kit";
import "./slides.css";

// Debate Club #9. A poster that leads a six slide carousel.
//
// The deck's argument: here is the night, here is a motion with its load
// bearing words blacked out, here is the question that motion is really
// asking, again for the second motion, then the close that says out loud that
// the full text only exists in the room. The redactions are the point. They
// make the withholding into the content instead of a caveat, and a reader who
// tries to fill the blanks has already started arguing.
//
// One painting for all six slides, which is the whole deck's discipline: the
// carousel happens in one room. Slide 1 shows that room entire, and only then
// do the middle slides move in close. Establishing the whole picture first is
// what licenses the details; a tight crop with no wide shot before it reads as
// a damaged reproduction rather than a detail.
//
// The grammar:
//
//   Poster and close   the room entire, type centred, ceremonial. The two
//                      covers of the thing.
//   Motions            a document. Near-black throughout, the painting only a
//                      texture behind it, the motion set as reading text with
//                      black bars where the words should be. Quiet, because
//                      the reader has to actually read.
//   Questions          the opposite: one line, set large, on an open detail of
//                      a face. Loud, because there is nothing to read.
//
//   So the deck alternates quiet and loud, and never twice in a row.
//
// The grammar of the poster itself:
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

/** Where in the source painting to centre a close crop, and how far in.
 *  x and y are fractions of the painting; scale 1 is the slide's own width. */
export interface Focus {
  x: number;
  y: number;
  scale: number;
}

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

// ---------------------------------------------------------------------------
// The carousel
// ---------------------------------------------------------------------------

const SRC_W = 3840;
const SRC_H = 3072;

/** A close crop of the painting, centred on a point in it and clamped so the
 *  slide is always covered. The whole deck reads one room, so every interior
 *  slide is this component pointed somewhere else. */
function Detail({ src, focus }: { src: string; focus: Focus }) {
  const w = Math.round(1080 * focus.scale);
  const h = Math.round((w * SRC_H) / SRC_W);
  const clamp = (v: number, min: number, max: number) =>
    Math.min(max, Math.max(min, v));

  return (
    <img
      className="pa-detail"
      src={src}
      alt=""
      width={w}
      height={h}
      style={{
        left: clamp(540 - focus.x * w, 1080 - w, 0),
        top: clamp(675 - focus.y * h, 1350 - h, 0),
      }}
    />
  );
}

/** A blacked out word. The bar is exactly as wide as the word it hides, so a
 *  reader can count the letters, which is most of the fun. */
export function R({ children }: { children: string }) {
  return <span className="pa-redacted">{children}</span>;
}

/** One motion, as a document with its load bearing words removed. */
export function Motion({
  src,
  focus,
  kicker,
  text,
  withheld,
  lift = false,
}: {
  src: string;
  focus: Focus;
  kicker: string;
  text: ReactNode;
  /** how many words are behind the bars, spelled out */
  withheld: string;
  /** ease the scrim where the painting is already dark */
  lift?: boolean;
}) {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div className="pa-field">
        <Detail src={src} focus={focus} />
        <ArtTone />
        <div className={lift ? "pa-scrim-doc pa-lift" : "pa-scrim-doc"} />
      </div>

      <div
        style={{
          position: "absolute",
          top: 150,
          left: 0,
          right: 0,
          zIndex: 5,
          textAlign: "center",
        }}
      >
        <div
          className="kicker"
          style={{ fontSize: 21, letterSpacing: "0.42em", textShadow: SHADOW }}
        >
          {kicker}
        </div>
        <hr className="rule" style={{ width: 190, margin: "34px auto 0" }} />
      </div>

      <div
        style={{
          position: "absolute",
          top: 330,
          bottom: 260,
          left: 95,
          right: 95,
          zIndex: 5,
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontFamily: "var(--cc-font-display)",
            fontSize: 41,
            lineHeight: 1.56,
            color: "var(--cc-ivory)",
            textAlign: "center",
            textShadow: SHADOW,
          }}
        >
          {text}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 130,
          left: 0,
          right: 0,
          zIndex: 5,
          textAlign: "center",
        }}
      >
        <div
          className="kicker"
          style={{ fontSize: 19, letterSpacing: "0.34em" }}
        >
          {withheld}
        </div>
      </div>
    </div>
  );
}

/** One question, set large on an open face. Nothing else on the slide. */
export function Question({
  src,
  focus,
  text,
}: {
  src: string;
  focus: Focus;
  text: ReactNode;
}) {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div className="pa-field">
        <Detail src={src} focus={focus} />
        <ArtTone />
        <div className="pa-scrim-question" />
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 150,
          left: 100,
          right: 100,
          zIndex: 5,
          textAlign: "center",
        }}
      >
        <hr className="rule" style={{ width: 150, margin: "0 auto 44px" }} />
        <div
          style={{
            fontFamily: "var(--cc-font-display)",
            fontSize: 62,
            lineHeight: 1.24,
            color: "var(--cc-ivory)",
            textShadow: SHADOW,
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
}

/** The close. The poster's twin, turned into the call to action, and the one
 *  slide that says out loud that the motions are being held back. */
export function Close({
  art,
  hero,
  oneLiner,
  lines,
  cta,
}: {
  art: { src: string; position?: string; className?: string };
  /** two lines, set at one size */
  hero: [string, string];
  oneLiner: ReactNode;
  lines: string[];
  cta: string;
}) {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div className="pa-field">
        <Art
          src={art.src}
          position={art.position}
          className={art.className ?? "art"}
        />
        <ArtTone />
        <div className="pa-scrim" />
      </div>

      <div
        style={{
          position: "absolute",
          top: 64,
          left: 0,
          right: 0,
          zIndex: 5,
          textAlign: "center",
        }}
      >
        <Lockup width={280} align="center" />
      </div>

      <div
        style={{
          position: "absolute",
          top: 742,
          left: 0,
          right: 0,
          zIndex: 5,
          textAlign: "center",
          fontFamily: "var(--cc-font-condensed)",
          fontWeight: 700,
          fontSize: 88,
          lineHeight: 1.06,
          letterSpacing: "0.004em",
          textTransform: "uppercase",
          color: "var(--cc-ivory)",
          textShadow: SHADOW,
        }}
      >
        {hero[0]}
        <br />
        {hero[1]}
      </div>

      <div
        style={{
          position: "absolute",
          top: 1000,
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
            fontSize: 32,
            lineHeight: 1.32,
            color: "var(--cc-parchment)",
            textAlign: "center",
            maxWidth: 800,
          }}
        >
          {oneLiner}
        </div>

        <div style={{ marginTop: 28, textAlign: "center" }}>
          {lines.map((line) => (
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
          style={{ marginTop: 26, fontSize: 20, letterSpacing: "0.34em" }}
        >
          {cta}
        </div>
      </div>
    </div>
  );
}
