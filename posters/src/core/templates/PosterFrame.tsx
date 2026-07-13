import type { ReactNode } from "react";
import type { Format } from "../formats";

// The fixed canvas. Renders at exact pixel dimensions (what the export screen-
// shots). Pass `scale` < 1 to shrink for on-screen preview in the studio.
export function PosterFrame({
  format,
  scale = 1,
  bordered = true,
  children,
}: {
  format: Format;
  scale?: number;
  bordered?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        width: format.width * scale,
        height: format.height * scale,
        overflow: "hidden",
      }}
    >
      <div
        id="poster"
        className="poster"
        style={{
          width: format.width,
          height: format.height,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {bordered && <div className="poster-border" />}
        {children}
      </div>
    </div>
  );
}
