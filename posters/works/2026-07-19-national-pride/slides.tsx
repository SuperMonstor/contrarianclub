import type { ReactNode } from "react";
import type { SlideSpec } from "../../src/core/types";
import { Lockup } from "../../src/core/templates/Lockup";

// Hand-built slides for this carousel. No stock templates: each slide is
// designed for the job it does in the story, and the composition changes as
// the story turns.
//
// The grammar, so the nine slides feel like one object:
//
//   Hook and Invite   type sits INSIDE the painting, centred, ceremonial.
//                     These are the two covers of the thing.
//   Chapter openers   type still inside the painting, but driven hard to one
//                     corner. The case for leans left and gold; the case
//                     against leans right and wine. You feel the argument
//                     change sides before you read a word.
//   Beats             the painting is a plate ABOVE a hairline, the sentence
//                     is set below it on black, like a caption in a
//                     catalogue. Quieter than an opener, so the openers keep
//                     their weight.
//   Conflict          the plate splits in two.
//
// Accents: gold is the case for, wine is the case against. Nothing else in
// the deck uses wine, so it only ever means "the other side".

const GOLD = "var(--cc-gold)";
const WINE = "var(--cc-wine-bright)";

const SHADOW =
  "0 1px 2px rgba(0,0,0,0.92), 0 2px 14px rgba(0,0,0,0.8), 0 5px 44px rgba(0,0,0,0.66)";

/** The treated painting, used full-bleed or as a plate. */
function Art({
  src,
  position = "center 45%",
  className = "stmt-img",
}: {
  src: string;
  position?: string;
  className?: string;
}) {
  return <img className={className} src={src} alt="" style={{ objectPosition: position }} />;
}

/** A hairline with a gold or wine tick at its left. Used to open a text block. */
function Rule({ accent = GOLD, width = "100%" }: { accent?: string; width?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", width }}>
      <span style={{ width: 46, height: 2, background: accent, flexShrink: 0 }} />
      <span
        style={{
          flex: 1,
          height: 1,
          background: `linear-gradient(90deg, ${accent}, transparent)`,
          opacity: 0.42,
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 1 and 9. The covers. Type centred inside the painting, ceremonial.
// ---------------------------------------------------------------------------

export function Hook({ spec }: { spec: SlideSpec }) {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {spec.image && <Art src={spec.image.src} position={spec.image.position} />}
      <div className="stmt-tone" />
      <div className="stmt-scrim" />

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "104px 88px 96px",
          textShadow: SHADOW,
        }}
      >
        <Lockup width={252} align="center" />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 30,
          }}
        >
          <span
            className="kicker"
            style={{ fontSize: 19, letterSpacing: "0.42em", paddingLeft: "0.42em" }}
          >
            {spec.kicker}
          </span>

          <h1
            className="hero"
            style={{
              fontSize: 106,
              lineHeight: 1.0,
              letterSpacing: "-0.02em",
              margin: 0,
              maxWidth: "14ch",
            }}
          >
            {spec.title}
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 4 }}>
            <span style={{ width: 60, height: 1, background: GOLD, opacity: 0.5 }} />
            <span style={{ width: 5, height: 5, background: GOLD, transform: "rotate(45deg)" }} />
            <span style={{ width: 60, height: 1, background: GOLD, opacity: 0.5 }} />
          </div>

          {spec.oneLiner && (
            <p
              className="one-liner"
              style={{
                fontSize: 28,
                lineHeight: 1.5,
                margin: 0,
                maxWidth: "32ch",
                color: "var(--cc-parchment)",
              }}
            >
              {spec.oneLiner}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function Invite({ spec }: { spec: SlideSpec }) {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {spec.image && <Art src={spec.image.src} position={spec.image.position} />}
      <div className="stmt-tone" />
      <div className="invite-scrim" />

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "100px 82px 84px",
          textShadow: SHADOW,
        }}
      >
        <Lockup width={252} align="center" />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 20,
          }}
        >
          <span
            className="kicker"
            style={{ fontSize: 18, letterSpacing: "0.42em", paddingLeft: "0.42em" }}
          >
            {spec.kicker}
          </span>

          {/* The motion, in two weights. The because-clause is not a footnote:
              it is the half of the claim the debate actually turns on, so it
              is set in the same serif, in ivory, large enough to read at a
              glance. Gold lost against the pale sky behind it. */}
          <h1
            className="hero"
            style={{
              fontSize: 80,
              lineHeight: 1.03,
              letterSpacing: "-0.018em",
              margin: 0,
              maxWidth: "16ch",
            }}
          >
            {spec.title}
          </h1>
          {spec.oneLiner && (
            <p
              style={{
                fontFamily: "var(--cc-font-display)",
                fontStyle: "italic",
                fontSize: 48,
                lineHeight: 1.16,
                letterSpacing: "-0.012em",
                color: "var(--cc-ivory)",
                margin: "2px 0 0",
                maxWidth: "20ch",
              }}
            >
              {spec.oneLiner}
            </p>
          )}

          {/* the details, on a plate so they read as an invitation card */}
          <div
            style={{
              marginTop: 30,
              padding: "34px 44px 30px",
              border: "1px solid rgba(200,162,74,0.34)",
              background: "rgba(11,9,7,0.52)",
              display: "flex",
              flexDirection: "column",
              gap: 26,
              width: "100%",
              maxWidth: 760,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 20,
              }}
            >
              {(spec.details ?? []).slice(0, 3).map((d, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <span className="label" style={{ fontSize: 13, letterSpacing: "0.22em" }}>
                    {d.label}
                  </span>
                  <span className="value" style={{ fontSize: 27 }}>
                    {d.value}
                  </span>
                </div>
              ))}
            </div>

            {(spec.details ?? []).slice(3).map((d, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  paddingTop: 22,
                  borderTop: "1px solid rgba(200,162,74,0.2)",
                }}
              >
                <span className="label" style={{ fontSize: 13, letterSpacing: "0.22em" }}>
                  {d.label}
                </span>
                <span className="value" style={{ fontSize: 27 }}>
                  {d.value}
                </span>
              </div>
            ))}
          </div>

          {spec.closing && (
            <span
              className="closing"
              style={{ fontSize: 24, marginTop: 22, letterSpacing: "0.01em" }}
            >
              {spec.closing}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2 and 5. Chapter openers. Type inside the painting, driven to one corner.
// ---------------------------------------------------------------------------

export function ChapterOpen({
  spec,
  side,
  numeral,
}: {
  spec: SlideSpec;
  side: "for" | "against";
  numeral: string;
}) {
  const forSide = side === "for";
  const accent = forSide ? GOLD : WINE;
  const align = forSide ? "flex-start" : "flex-end";
  const text = forSide ? ("left" as const) : ("right" as const);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {spec.image && <Art src={spec.image.src} position={spec.image.position} />}
      <div className="stmt-tone" />
      <div className="stmt-scrim" />

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: align,
          textAlign: text,
          padding: "100px 88px 96px",
          textShadow: SHADOW,
        }}
      >
        <div style={{ alignSelf: forSide ? "flex-start" : "flex-end" }}>
          <Lockup width={214} />
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            alignItems: align,
            gap: 24,
            width: "100%",
          }}
        >
          {/* chapter mark: a roman numeral hairline-boxed, then the label */}
          <div
            style={{
              display: "flex",
              flexDirection: forSide ? "row" : "row-reverse",
              alignItems: "center",
              gap: 20,
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 56,
                height: 56,
                border: `1px solid ${accent}`,
                fontFamily: "var(--cc-font-display)",
                fontSize: 25,
                fontWeight: 600,
                color: accent,
                boxSizing: "border-box",
              }}
            >
              {numeral}
            </span>
            <span
              className="kicker"
              style={{ fontSize: 19, letterSpacing: "0.34em", color: accent }}
            >
              {spec.kicker}
            </span>
          </div>

          <h1
            style={{
              fontFamily: "var(--cc-font-condensed)",
              fontWeight: 700,
              textTransform: "uppercase",
              fontSize: 104,
              lineHeight: 0.93,
              letterSpacing: "-0.004em",
              color: "var(--cc-ivory)",
              margin: 0,
              maxWidth: "13ch",
            }}
          >
            {spec.title}
          </h1>

          {spec.oneLiner && (
            <p
              className="one-liner"
              style={{
                fontSize: 29,
                lineHeight: 1.48,
                margin: "6px 0 0",
                maxWidth: "26ch",
                color: "var(--cc-parchment)",
              }}
            >
              {spec.oneLiner}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3, 4, 6, 7. Beats. The painting is a plate; the sentence is set below it.
// ---------------------------------------------------------------------------

export function Beat({
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
  const accent = side === "for" ? GOLD : WINE;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        padding: "76px 76px 70px",
      }}
    >
      {/* masthead. On black, not on the art: it has to stay legible whatever
          painting is underneath. */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 34,
        }}
      >
        <Lockup width={176} />
        <div style={{ display: "flex", gap: 9 }}>
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              style={{
                width: 38,
                height: 2,
                background: i === index ? accent : "rgba(157,144,121,0.24)",
              }}
            />
          ))}
        </div>
      </header>

      {/* the plate */}
      <div
        style={{
          position: "relative",
          flex: "0 0 51%",
          overflow: "hidden",
          border: "1px solid rgba(200,162,74,0.26)",
        }}
      >
        {spec.image && (
          <Art
            src={spec.image.src}
            position={spec.image.position}
            className="plate-img"
          />
        )}
        <div className="plate-tone" />
      </div>

      {/* the caption */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          gap: 26,
          paddingTop: 38,
        }}
      >
        <Rule accent={accent} width="220px" />

        <h1
          className="hero"
          style={{
            fontSize: spec.title.length > 120 ? 52 : 60,
            lineHeight: 1.19,
            letterSpacing: "-0.008em",
            margin: 0,
            maxWidth: "26ch",
          }}
        >
          {spec.title}
        </h1>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 8. The conflict. The plate splits in two.
// ---------------------------------------------------------------------------

function Column({
  heading,
  body,
  align,
}: {
  heading: string;
  body: string;
  align: "left" | "right";
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        textAlign: align,
        alignItems: align === "left" ? "flex-start" : "flex-end",
      }}
    >
      <h2
        style={{
          fontFamily: "var(--cc-font-display)",
          fontWeight: 700,
          fontSize: 46,
          lineHeight: 1.08,
          letterSpacing: "-0.012em",
          color: "var(--cc-ivory)",
          margin: 0,
        }}
      >
        {heading}
      </h2>
      <p
        style={{
          fontFamily: "var(--cc-font-ui)",
          fontSize: 24,
          lineHeight: 1.5,
          color: "var(--cc-parchment)",
          margin: 0,
          maxWidth: "20ch",
        }}
      >
        {body}
      </p>
    </div>
  );
}

export function Conflict({ spec }: { spec: SlideSpec }): ReactNode {
  const [left, right] = spec.columns ?? [];

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {spec.image && <Art src={spec.image.src} position={spec.image.position} />}
      <div className="stmt-tone" />
      <div className="conflict-scrim" />

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "100px 76px 88px",
          textShadow: SHADOW,
        }}
      >
        <Lockup width={230} align="center" />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 22,
            width: "100%",
          }}
        >
          <span
            className="kicker"
            style={{ fontSize: 18, letterSpacing: "0.4em", paddingLeft: "0.4em" }}
          >
            {spec.kicker}
          </span>
          <h1
            className="hero"
            style={{
              fontSize: 72,
              lineHeight: 1.04,
              letterSpacing: "-0.018em",
              margin: 0,
              maxWidth: "16ch",
            }}
          >
            {spec.title}
          </h1>

          {/* the two answers, meeting at a seam */}
          <div
            style={{
              marginTop: 46,
              width: "100%",
              display: "grid",
              gridTemplateColumns: "1fr 1px 1fr",
              gap: 44,
              alignItems: "start",
              position: "relative",
            }}
          >
            {left && <Column heading={left.heading} body={left.points[0]} align="right" />}

            <div
              style={{
                alignSelf: "stretch",
                width: 1,
                background:
                  "linear-gradient(180deg, transparent, rgba(200,162,74,0.55) 22%, rgba(200,162,74,0.55) 78%, transparent)",
              }}
            />

            {right && <Column heading={right.heading} body={right.points[0]} align="left" />}

            <span
              style={{
                position: "absolute",
                left: "50%",
                top: 62,
                transform: "translate(-50%, -50%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 62,
                height: 62,
                borderRadius: "50%",
                background: "var(--cc-black)",
                border: "1px solid rgba(200,162,74,0.55)",
                fontFamily: "var(--cc-font-display)",
                fontStyle: "italic",
                fontSize: 26,
                color: GOLD,
                paddingBottom: 4,
                boxSizing: "border-box",
              }}
            >
              or
            </span>
          </div>
        </div>

        {spec.closing && (
          <span className="closing" style={{ fontSize: 26 }}>
            {spec.closing}
          </span>
        )}
      </div>
    </div>
  );
}
