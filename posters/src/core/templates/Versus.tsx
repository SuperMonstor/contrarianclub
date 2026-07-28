import type { SlideSpec } from "../types";
import type { Format } from "../formats";
import { Lockup } from "../kit/Lockup";

// Versus template, the shape of a debate: one question up top, two answers
// side by side, a hairline and a small "or" medallion between them. Built for
// core-conflict slides but general to any two-sided compare.

function Column({ heading, points }: { heading: string; points: string[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
      <h2
        style={{
          fontFamily: "var(--cc-font-display)",
          fontWeight: 600,
          fontSize: 40,
          lineHeight: 1.12,
          letterSpacing: "-0.01em",
          color: "var(--cc-ivory)",
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
          gap: 24,
        }}
      >
        {points.map((p, i) => (
          <li
            key={i}
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 16,
              fontFamily: "var(--cc-font-ui)",
              fontSize: 23,
              lineHeight: 1.45,
              color: "var(--cc-parchment)",
            }}
          >
            {/* a small engraved tick instead of a numeral: the columns are
                parallel answers, not an ordered list */}
            <span
              aria-hidden="true"
              style={{
                flexShrink: 0,
                width: 16,
                height: 1,
                background: "var(--cc-gold)",
                transform: "translateY(-7px)",
              }}
            />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Versus({ spec, format }: { spec: SlideSpec; format: Format }) {
  const tall = format.height >= 1600; // story
  const [left, right] = spec.columns ?? [];

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {spec.image && (
        <>
          <img
            className="versus-img"
            src={spec.image.src}
            alt=""
            style={{ objectPosition: spec.image.position ?? "center 30%" }}
          />
          <div className="versus-scrim" />
        </>
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          padding: tall ? "150px 110px" : "112px 100px",
          textShadow: spec.image
            ? "0 1px 2px rgba(0, 0, 0, 0.9), 0 2px 10px rgba(0, 0, 0, 0.75)"
            : undefined,
        }}
      >
      <header>
        <Lockup width={300} />
      </header>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 54,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <span className="kicker" style={{ fontSize: 19, letterSpacing: "0.3em" }}>
            {spec.kicker}
          </span>
          <h1
            className="hero"
            style={{
              fontSize: spec.title.length > 44 ? 64 : 76,
              margin: 0,
              maxWidth: "20ch",
            }}
          >
            {spec.title}
          </h1>
          {spec.oneLiner && (
            <p
              className="one-liner"
              style={{ fontSize: 27, lineHeight: 1.5, margin: 0, maxWidth: "34ch" }}
            >
              {spec.oneLiner}
            </p>
          )}
        </div>

        {left && right && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 90px 1fr",
              alignItems: "start",
            }}
          >
            <Column heading={left.heading} points={left.points} />

            {/* the divider: a vertical hairline broken by an "or" medallion */}
            <div
              style={{
                alignSelf: "stretch",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 18,
              }}
            >
              <span
                style={{
                  flex: 1,
                  width: 1,
                  background:
                    "linear-gradient(180deg, transparent, var(--cc-line-strong))",
                }}
              />
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 54,
                  height: 54,
                  borderRadius: "50%",
                  border: "1px solid var(--cc-line-strong)",
                  fontFamily: "var(--cc-font-display)",
                  fontStyle: "italic",
                  fontSize: 24,
                  color: "var(--cc-gold)",
                  paddingBottom: 4,
                  boxSizing: "border-box",
                }}
              >
                or
              </span>
              <span
                style={{
                  flex: 1,
                  width: 1,
                  background:
                    "linear-gradient(180deg, var(--cc-line-strong), transparent)",
                }}
              />
            </div>

            <Column heading={right.heading} points={right.points} />
          </div>
        )}
      </div>

        <footer style={{ display: "flex", flexDirection: "column", gap: 34 }}>
          <hr className="rule" />
          {spec.closing && (
            <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
              <span className="closing" style={{ fontSize: 27 }}>
                {spec.closing}
              </span>
              <hr className="rule" style={{ flex: 1 }} />
            </div>
          )}
        </footer>
      </div>
    </div>
  );
}
