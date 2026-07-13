import type { SlideSpec } from "../types";
import type { Format } from "../formats";
import { Lockup } from "./Lockup";

// Panel template, one sentence of an argument over a slice of a painting.
// Consecutive panels share one image via image.pane {index, of}, so swiping
// through a carousel pans across the artwork: the visual carries the reader
// from one point to the next.

// The sentence is the hero. Long sentences step down so the image keeps room.
function sentenceSize(text: string): number {
  if (text.length <= 76) return 62;
  if (text.length <= 116) return 54;
  return 47;
}

export function Panel({ spec, format }: { spec: SlideSpec; format: Format }) {
  const pane = spec.image?.pane ?? { index: 0, of: 1 };

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {spec.image && (
        <>
          <img
            className="panel-img"
            src={spec.image.src}
            alt=""
            style={{
              width: `${pane.of * 100}%`,
              transform: `translateX(-${(pane.index / pane.of) * 100}%)`,
              objectPosition: spec.image.position ?? "center 60%",
            }}
          />
          <div className="panel-scrim" />
        </>
      )}

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          padding: format.height >= 1600 ? "130px 110px" : "100px 96px",
          textShadow:
            "0 1px 2px rgba(0, 0, 0, 0.9), 0 2px 12px rgba(0, 0, 0, 0.8), 0 4px 36px rgba(0, 0, 0, 0.6)",
        }}
      >
        <Lockup width={210} align="center" />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            gap: 30,
            paddingBottom: 10,
          }}
        >
          <span className="kicker" style={{ fontSize: 19, letterSpacing: "0.3em" }}>
            {spec.kicker}
          </span>
          <h1
            className="hero"
            style={{
              fontSize: sentenceSize(spec.title),
              lineHeight: 1.14,
              margin: 0,
              maxWidth: "22ch",
            }}
          >
            {spec.title}
          </h1>

          {/* where this slide sits in its run of panes */}
          {pane.of > 1 && (
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              {Array.from({ length: pane.of }, (_, i) => (
                <span
                  key={i}
                  style={{
                    width: 34,
                    height: 2,
                    background:
                      i === pane.index ? "var(--cc-gold)" : "rgba(200, 162, 74, 0.28)",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
