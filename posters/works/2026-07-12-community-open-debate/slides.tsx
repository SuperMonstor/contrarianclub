import type { Format } from "../../src/core/formats";
import { Lockup } from "../../src/core/kit";

// The typographic invite. No image at all: the whole piece is the copy, set
// like a printed programme on heavy stock, so the hierarchy has to do all the
// work. Logotype up top, hero title, one sentence, the three things that make
// the night what it is, then the practical details and a closing line.
//
// The grammar: everything hangs off the left margin and the eye runs straight
// down it. The only horizontal rules are the two that separate the argument
// from the logistics, so the footer reads as a different kind of information
// from the body.

export interface InviteCopy {
  kicker: string;
  title: string;
  oneLiner: string;
  /** the three promises, numbered 01, 02, 03 */
  points: string[];
  details: { label: string; value: string }[];
  closing: string;
}

export function Invite({ copy, format }: { copy: InviteCopy; format: Format }) {
  // A little vertical breathing room scales with the canvas height.
  const tall = format.height >= 1600; // story
  const short = format.height <= 1080; // square

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        padding: tall ? "150px 110px" : "112px 100px",
      }}
    >
      <header>
        <Lockup width={300} />
      </header>

      {/* Body, vertically centered between header and footer */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: short ? 26 : 38,
          paddingTop: tall ? 60 : 24,
          paddingBottom: tall ? 40 : 16,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <span className="kicker" style={{ fontSize: 19, letterSpacing: "0.3em" }}>
            {copy.kicker}
          </span>
          <h1
            className="hero"
            style={{ fontSize: short ? 92 : 108, margin: 0, maxWidth: "13ch" }}
          >
            {copy.title}
          </h1>
          <p
            className="one-liner"
            style={{ fontSize: 29, lineHeight: 1.5, margin: 0, maxWidth: "30ch" }}
          >
            {copy.oneLiner}
          </p>
        </div>

        <hr className="rule-left" style={{ maxWidth: 560 }} />
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {copy.points.map((p, i) => (
            <li
              key={i}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 18,
                fontFamily: "var(--cc-font-ui)",
                fontSize: 25,
                color: "var(--cc-parchment)",
              }}
            >
              <span
                style={{
                  color: "var(--cc-gold)",
                  fontFamily: "var(--cc-font-display)",
                  fontSize: 20,
                  transform: "translateY(-2px)",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer, details + closing */}
      <footer style={{ display: "flex", flexDirection: "column", gap: tall ? 44 : 34 }}>
        <hr className="rule" />
        <dl style={{ display: "flex", flexWrap: "wrap", gap: "30px 72px", margin: 0 }}>
          {copy.details.map((d, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <dt className="label" style={{ fontSize: 15, letterSpacing: "0.2em" }}>
                {d.label}
              </dt>
              <dd className="value" style={{ fontSize: 30, margin: 0, lineHeight: 1.2 }}>
                {d.value}
              </dd>
            </div>
          ))}
        </dl>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <span className="closing" style={{ fontSize: 27 }}>
            {copy.closing}
          </span>
          <hr className="rule" style={{ flex: 1 }} />
        </div>
      </footer>
    </div>
  );
}
