import type { SlideSpec } from "../../src/core/types";
import type { Format } from "../../src/core/formats";
import { Lockup } from "../../src/core/templates/Lockup";

// Bespoke slides for this carousel. Deliberately not stock templates: the
// piece is a story, and a story needs the look to change as it goes.
//
// The arc, in surfaces:
//   1  painting, full bleed                 the question
//   2  parchment, hard cut to light         the motion
//   3-5 black, gold numerals                the case for
//   6-8 black, wine numerals, mirrored      the case against
//   9  split down the middle, light vs dark the core conflict
//   10 painting, full bleed                 the room
//
// Only two paintings, both carrying an idea rather than decorating one:
// Delacroix opens on pride at its most seductive, Friedrich closes on one
// figure deciding what to measure himself against.

const INK = "#0b0907";
const PARCHMENT = "#e8dcc0";

/** 1 & 10. A painting, full bleed, type sunk into the dark half. */
export function ArtSlide({ spec }: { spec: SlideSpec; format: Format }) {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {spec.image && (
        <>
          <img
            className="stmt-img"
            src={spec.image.src}
            alt=""
            style={{ objectPosition: spec.image.position ?? "center 38%" }}
          />
          <div className="stmt-tone" />
          <div className="stmt-scrim" />
        </>
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "104px 92px",
          textShadow:
            "0 1px 2px rgba(0,0,0,0.9), 0 2px 14px rgba(0,0,0,0.8), 0 4px 40px rgba(0,0,0,0.7)",
        }}
      >
        <Lockup width={250} align="center" />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            gap: 26,
            paddingBottom: 16,
          }}
        >
          <span className="kicker" style={{ fontSize: 18, letterSpacing: "0.34em" }}>
            {spec.kicker}
          </span>
          <h1
            className="hero"
            style={{
              fontSize: spec.title.length > 46 ? 88 : 104,
              lineHeight: 1.02,
              margin: 0,
              maxWidth: "15ch",
              alignSelf: "center",
            }}
          >
            {spec.title}
          </h1>
          {spec.oneLiner && (
            <p
              className="one-liner"
              style={{ fontSize: 27, lineHeight: 1.5, margin: "0 auto", maxWidth: "36ch" }}
            >
              {spec.oneLiner}
            </p>
          )}

          {spec.details && spec.details.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "24px 54px",
                maxWidth: 800,
                margin: "14px auto 0",
              }}
            >
              {spec.details.map((d, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span className="label" style={{ fontSize: 14, letterSpacing: "0.2em" }}>
                    {d.label}
                  </span>
                  <span className="value" style={{ fontSize: 26 }}>
                    {d.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {spec.closing && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 18,
                marginTop: 8,
              }}
            >
              <hr className="rule" style={{ width: 70 }} />
              <span className="closing" style={{ fontSize: 23 }}>
                {spec.closing}
              </span>
              <hr className="rule" style={{ width: 70 }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** 2. The motion. A hard cut to light: the one bright slide in the deck. */
export function MotionSlide({ spec }: { spec: SlideSpec; format: Format }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: PARCHMENT,
        display: "flex",
        flexDirection: "column",
        padding: "104px 96px",
      }}
    >
      <Lockup width={250} variant="light" />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 30,
        }}
      >
        <span
          style={{
            fontFamily: "var(--cc-font-ui)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.3em",
            fontSize: 19,
            color: "#8a6c2c",
          }}
        >
          {spec.kicker}
        </span>
        <h1
          style={{
            fontFamily: "var(--cc-font-display)",
            fontWeight: 700,
            fontSize: 96,
            lineHeight: 1.02,
            letterSpacing: "-0.015em",
            color: INK,
            margin: 0,
            maxWidth: "13ch",
          }}
        >
          {spec.title}
        </h1>
        {spec.oneLiner && (
          <p
            style={{
              fontFamily: "var(--cc-font-ui)",
              fontSize: 34,
              lineHeight: 1.4,
              color: "rgba(11,9,7,0.66)",
              margin: 0,
              maxWidth: "26ch",
            }}
          >
            {spec.oneLiner}
          </p>
        )}
      </div>

      {spec.closing && (
        <footer style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <hr
            style={{
              height: 1,
              border: 0,
              background: "rgba(11,9,7,0.22)",
              margin: 0,
            }}
          />
          <span
            style={{
              fontFamily: "var(--cc-font-display)",
              fontStyle: "italic",
              fontSize: 27,
              color: "rgba(11,9,7,0.72)",
            }}
          >
            {spec.closing}
          </span>
        </footer>
      )}
    </div>
  );
}

/** 3 to 8. One argument, one slide. A vast numeral does the visual work, and
 *  the side flips: the case for reads left and gold, the case against reads
 *  right and wine. Swiping, you feel the argument change sides. */
export function ArgumentSlide({
  spec,
  side,
  index,
  total,
}: {
  spec: SlideSpec;
  side: "for" | "against";
  index: number;
  total: number;
}) {
  const forSide = side === "for";
  const accent = forSide ? "var(--cc-gold)" : "var(--cc-wine-bright)";
  const align = forSide ? "flex-start" : "flex-end";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        padding: "104px 96px",
        alignItems: align,
        textAlign: forSide ? "left" : "right",
      }}
    >
      <div style={{ alignSelf: forSide ? "flex-start" : "flex-end" }}>
        <Lockup width={250} />
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: align,
          gap: 4,
          width: "100%",
        }}
      >
        {/* the numeral, huge and hollow, bleeding off the edge of the type */}
        <span
          style={{
            fontFamily: "var(--cc-font-condensed)",
            fontWeight: 700,
            fontSize: 300,
            lineHeight: 1,
            color: "transparent",
            WebkitTextStroke: `2px ${accent}`,
            opacity: 0.5,
            marginBottom: 34,
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        <span
          className="kicker"
          style={{ fontSize: 19, letterSpacing: "0.3em", color: accent }}
        >
          {spec.kicker}
        </span>

        <h1
          className="hero"
          style={{
            fontSize: spec.title.length > 100 ? 60 : 70,
            lineHeight: 1.14,
            margin: "18px 0 0",
            maxWidth: "20ch",
          }}
        >
          {spec.title}
        </h1>
      </div>

      {/* progress through this side's three points */}
      <footer
        style={{
          display: "flex",
          gap: 10,
          alignSelf: align,
        }}
      >
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            style={{
              width: 46,
              height: 3,
              background: i === index ? accent : "rgba(157,144,121,0.3)",
            }}
          />
        ))}
      </footer>
    </div>
  );
}

/** 9. The core conflict, split down the middle: the two answers as two
 *  surfaces, light against dark, meeting at a seam. */
export function ConflictSlide({ spec }: { spec: SlideSpec; format: Format }) {
  const [left, right] = spec.columns ?? [];

  const Half = ({
    heading,
    points,
    dark,
  }: {
    heading: string;
    points: string[];
    dark: boolean;
  }) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 26,
        padding: "0 46px",
        color: dark ? "var(--cc-ivory)" : INK,
      }}
    >
      <h2
        style={{
          fontFamily: "var(--cc-font-display)",
          fontWeight: 700,
          fontSize: 44,
          lineHeight: 1.1,
          margin: 0,
        }}
      >
        {heading}
      </h2>
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {points.map((p, i) => (
          <li
            key={i}
            style={{
              fontFamily: "var(--cc-font-ui)",
              fontSize: 24,
              lineHeight: 1.45,
              color: dark ? "var(--cc-parchment)" : "rgba(11,9,7,0.72)",
            }}
          >
            {p}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
      {/* header sits on the dark band */}
      <div style={{ padding: "104px 96px 0" }}>
        <Lockup width={250} />
        <div style={{ marginTop: 64, display: "flex", flexDirection: "column", gap: 22 }}>
          <span className="kicker" style={{ fontSize: 19, letterSpacing: "0.3em" }}>
            {spec.kicker}
          </span>
          <h1
            className="hero"
            style={{ fontSize: 66, lineHeight: 1.06, margin: 0, maxWidth: "18ch" }}
          >
            {spec.title}
          </h1>
        </div>
      </div>

      {/* the seam: two surfaces, meeting */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          marginTop: 70,
          position: "relative",
        }}
      >
        <div
          style={{
            background: PARCHMENT,
            display: "flex",
            alignItems: "center",
            paddingBottom: 40,
          }}
        >
          {left && <Half heading={left.heading} points={left.points} dark={false} />}
        </div>
        <div
          style={{
            background: "#100c08",
            display: "flex",
            alignItems: "center",
            paddingBottom: 40,
            borderLeft: "1px solid rgba(200,162,74,0.45)",
          }}
        >
          {right && <Half heading={right.heading} points={right.points} dark />}
        </div>

        {/* the "or" medallion, straddling the seam */}
        <span
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            transform: "translate(-50%, -50%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 82,
            height: 82,
            borderRadius: "50%",
            background: INK,
            border: "1px solid var(--cc-line-strong)",
            fontFamily: "var(--cc-font-display)",
            fontStyle: "italic",
            fontSize: 30,
            color: "var(--cc-gold)",
            paddingBottom: 5,
            boxSizing: "border-box",
            zIndex: 3,
          }}
        >
          or
        </span>
      </div>
    </div>
  );
}
