import { useEffect } from "react";
import { FORMATS, type FormatId } from "./formats";
import { POSTERS } from "../posters";
import { PosterFrame } from "./templates/PosterFrame";
import { renderTemplate } from "./templates";

// Renders ONE poster at exact pixel size, no studio chrome. The export script
// navigates here and screenshots the #poster element. Signals readiness by
// setting data-ready on <body> once fonts have loaded.
export function BareRender({
  posterId,
  formatId,
}: {
  posterId: string;
  formatId?: string;
}) {
  const spec = POSTERS[posterId];
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

  if (!spec) return <pre style={{ color: "#fff" }}>Unknown poster: {posterId}</pre>;
  if (!format) return <pre style={{ color: "#fff" }}>Unknown format: {formatId}</pre>;

  return (
    <PosterFrame format={format}>{renderTemplate(spec, format)}</PosterFrame>
  );
}
