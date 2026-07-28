import { useEffect } from "react";
import { FORMATS, type FormatId } from "./formats";
import { WORKS } from "./registry";
import { PosterFrame } from "./kit/PosterFrame";
import { renderTemplate } from "./templates";

// Renders ONE slide at exact pixel size, no studio chrome. The export script
// navigates here and screenshots the #poster element. Signals readiness by
// setting data-ready on <body> once fonts have loaded.
export function BareRender({
  workId,
  slide = 0,
  formatId,
}: {
  workId: string;
  slide?: number;
  formatId?: string;
}) {
  const work = WORKS[workId];
  const spec = work?.slides[slide];
  const format = FORMATS[(formatId as FormatId) ?? "ig-portrait"];

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.background = "#0b0907";
    // Wait for fonts AND images (logo SVG, background art) before signalling.
    const imagesReady = () =>
      Promise.all(
        Array.from(document.images).map((img) =>
          img.complete ? Promise.resolve() : img.decode().catch(() => undefined),
        ),
      );
    Promise.all([document.fonts.ready, imagesReady()]).then(() => {
      document.body.setAttribute("data-ready", "true");
    });
  }, []);

  if (!work) return <pre style={{ color: "#fff" }}>Unknown work: {workId}</pre>;
  if (!spec)
    return (
      <pre style={{ color: "#fff" }}>
        {workId} has no slide {slide}
      </pre>
    );
  if (!format) return <pre style={{ color: "#fff" }}>Unknown format: {formatId}</pre>;

  return (
    <PosterFrame format={format}>{renderTemplate(spec, format)}</PosterFrame>
  );
}
