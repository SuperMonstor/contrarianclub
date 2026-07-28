import type { Format } from "../../src/core/formats";
import { Art, ArtTone, Lockup } from "../../src/core/kit";
import "./slides.css";

// The image-forward companion to the invite. Same night, opposite strategy:
// the invite is all type and no picture, this one is a full-bleed painting
// with the title cut across it in condensed caps.
//
// The grammar: everything is centred and stacked, lockup at the top, the
// whole message weighted to the bottom half where the scrim has taken the
// painting down to near-black. Type carries a heavy shadow because it sits on
// a busy canvas and legibility beats delicacy here.

export interface PromoCopy {
  kicker: string;
  title: string;
  oneLiner: string;
  details: { label: string; value: string }[];
  closing: string;
  image: { src: string; position?: string };
}

// The headline size was tuned for a short provocation. A full motion can run
// to 70+ characters, so long titles step down rather than swallowing the
// image.
function titleSize(title: string, short: boolean): number {
  if (title.length <= 34) return short ? 100 : 128;
  if (title.length <= 52) return short ? 84 : 104;
  return short ? 72 : 88;
}

export function Promo({ copy, format }: { copy: PromoCopy; format: Format }) {
  const short = format.height <= 1080;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Art src={copy.image.src} position={copy.image.position ?? "center 40%"} />
      <ArtTone />
      <div className="promo-scrim" />

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
          textShadow:
            "0 1px 2px rgba(0, 0, 0, 0.9), 0 2px 12px rgba(0, 0, 0, 0.8), 0 4px 36px rgba(0, 0, 0, 0.7)",
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
            {copy.kicker}
          </span>
          <h1
            style={{
              fontFamily: "var(--cc-font-condensed)",
              fontWeight: 700,
              textTransform: "uppercase",
              fontSize: titleSize(copy.title, short),
              lineHeight: 0.94,
              letterSpacing: "-0.005em",
              color: "var(--cc-ivory)",
              margin: 0,
              maxWidth: "16ch",
            }}
          >
            {copy.title}
          </h1>
          <p
            className="one-liner"
            style={{ fontSize: 27, lineHeight: 1.5, margin: "0 auto", maxWidth: "34ch" }}
          >
            {copy.oneLiner}
          </p>

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
            {copy.details.map((d, i) => (
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

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 18,
              marginTop: 6,
            }}
          >
            <hr className="rule" style={{ width: 70 }} />
            <span className="closing" style={{ fontSize: 22 }}>
              {copy.closing}
            </span>
            <hr className="rule" style={{ width: 70 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
