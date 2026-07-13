import { useMemo, useState } from "react";
import { FORMAT_LIST, FORMATS, type FormatId } from "./formats";
import { POSTER_LIST } from "../posters";
import { PosterFrame } from "./templates/PosterFrame";
import { renderTemplate } from "./templates";

// Interactive preview. Pick a poster + format; see it at true proportions,
// scaled to fit. Export happens via the CLI (`npm run poster <id>`).
export function Studio() {
  const [posterId, setPosterId] = useState(POSTER_LIST[0]?.id ?? "");
  const [formatId, setFormatId] = useState<FormatId>("ig-portrait");

  const spec = useMemo(
    () => POSTER_LIST.find((p) => p.id === posterId),
    [posterId],
  );
  const format = FORMATS[formatId];

  // Fit the poster inside the preview stage.
  const maxH = 760;
  const maxW = 620;
  const scale = Math.min(maxH / format.height, maxW / format.width);

  return (
    <div className="studio">
      <aside className="studio-panel">
        <div className="studio-brand">Contrarian · Poster Studio</div>

        <label className="studio-field">
          <span>Poster</span>
          <select value={posterId} onChange={(e) => setPosterId(e.target.value)}>
            {POSTER_LIST.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>

        <label className="studio-field">
          <span>Format</span>
          <select
            value={formatId}
            onChange={(e) => setFormatId(e.target.value as FormatId)}
          >
            {FORMAT_LIST.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label} · {f.width}×{f.height}
              </option>
            ))}
          </select>
        </label>

        <div className="studio-hint">
          Export all formats:
          <code>npm run poster {posterId || "&lt;id&gt;"}</code>
        </div>
      </aside>

      <main className="studio-stage">
        {spec ? (
          <PosterFrame format={format} scale={scale}>
            {renderTemplate(spec, format)}
          </PosterFrame>
        ) : (
          <p>No poster selected.</p>
        )}
      </main>
    </div>
  );
}
