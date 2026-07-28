import type { SlideSpec } from "../types";
import type { Format } from "../formats";
import { Lockup } from "../kit/Lockup";

// Statement template, full-bleed treated portrait, huge condensed headline,
// CTA. Matches reference post 16 ("SHOULD TRILLIONAIRES EXIST?").

// The headline size was tuned for a short provocation ("SHOULD TRILLIONAIRES
// EXIST?"). A full motion can run to 70+ characters, so long titles step down
// rather than swallowing the image.
function titleSize(title: string, short: boolean): number {
  if (title.length <= 34) return short ? 100 : 128;
  if (title.length <= 52) return short ? 84 : 104;
  return short ? 72 : 88;
}

export function Statement({ spec, format }: { spec: SlideSpec; format: Format }) {
  const short = format.height <= 1080;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {spec.image && (
        <>
          <img className="stmt-img" src={spec.image.src} alt="" />
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
          padding: "110px 90px",
          // keep type legible over a busy painting
          textShadow: spec.image
            ? "0 1px 2px rgba(0, 0, 0, 0.9), 0 2px 12px rgba(0, 0, 0, 0.8), 0 4px 36px rgba(0, 0, 0, 0.7)"
            : undefined,
        }}
      >
        <Lockup width={260} align="center" />

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
              fontSize: titleSize(spec.title, short),
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
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "26px 56px",
                marginTop: 18,
                maxWidth: 780,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
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
          {spec.closing && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, marginTop: 6 }}>
              <hr className="rule" style={{ width: 70 }} />
              <span className="closing" style={{ fontSize: 22 }}>
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
