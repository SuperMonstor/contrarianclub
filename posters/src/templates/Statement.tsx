import type { PosterSpec } from "../types";
import type { Format } from "../formats";
import { Lockup } from "./Lockup";

// Statement template — full-bleed treated portrait, huge condensed headline,
// CTA. Matches reference post 16 ("SHOULD TRILLIONAIRES EXIST?").

export function Statement({ spec, format }: { spec: PosterSpec; format: Format }) {
  const short = format.height <= 1080;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {spec.image && (
        <>
          <img className="stmt-img" src={spec.image.src} alt="" />
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
          padding: "110px 90px",
        }}
      >
        <Lockup size={0.92} align="center" />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            gap: 28,
            paddingBottom: 20,
          }}
        >
          <span className="kicker" style={{ fontSize: 18, letterSpacing: "0.34em" }}>
            {spec.kicker}
          </span>
          <h1
            style={{
              fontFamily: "var(--cc-font-condensed)",
              fontWeight: 700,
              textTransform: "uppercase",
              fontSize: short ? 100 : 128,
              lineHeight: 0.94,
              letterSpacing: "-0.005em",
              color: "var(--cc-ivory)",
              margin: 0,
              maxWidth: "16ch",
            }}
          >
            {spec.title}
          </h1>
          {spec.oneLiner && (
            <p
              className="one-liner"
              style={{ fontSize: 27, lineHeight: 1.5, margin: "0 auto", maxWidth: "34ch" }}
            >
              {spec.oneLiner}
            </p>
          )}
          {spec.details && spec.details.length > 0 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 56, marginTop: 18 }}>
              {spec.details.map((d, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span className="label" style={{ fontSize: 14, letterSpacing: "0.2em" }}>
                    {d.label}
                  </span>
                  <span className="value" style={{ fontSize: 25 }}>
                    {d.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
