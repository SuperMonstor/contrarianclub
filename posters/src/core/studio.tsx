import { useMemo, useState } from "react";
import { FORMAT_LIST, FORMATS, type FormatId } from "./formats";
import { WORK_LIST } from "./registry";
import { PosterFrame } from "./templates/PosterFrame";
import { renderTemplate } from "./templates";

// Interactive preview. Pick a work, a slide (carousels have several) and a
// format; see it at true proportions, scaled to fit. Export happens via the
// CLI (`npm run poster <id>`).
export function Studio() {
  const [workId, setWorkId] = useState(WORK_LIST[0]?.id ?? "");
  const [slide, setSlide] = useState(0);
  const [formatId, setFormatId] = useState<FormatId>("ig-portrait");

  const work = useMemo(() => WORK_LIST.find((w) => w.id === workId), [workId]);
  const spec = work?.slides[Math.min(slide, work.slides.length - 1)];
  const format = FORMATS[formatId];

  // Fit the poster inside the preview stage.
  const maxH = 760;
  const maxW = 620;
  const scale = Math.min(maxH / format.height, maxW / format.width);

  function pickWork(id: string) {
    setWorkId(id);
    setSlide(0);
  }

  return (
    <div className="studio">
      <aside className="studio-panel">
        <div className="studio-brand">Contrarian · Poster Studio</div>

        <label className="studio-field">
          <span>Work</span>
          <select value={workId} onChange={(e) => pickWork(e.target.value)}>
            {WORK_LIST.map((w) => (
              <option key={w.id} value={w.id}>
                {w.title}
                {w.slides.length > 1 ? ` (${w.slides.length} slides)` : ""}
              </option>
            ))}
          </select>
        </label>

        {work && work.slides.length > 1 && (
          <label className="studio-field">
            <span>Slide</span>
            <select
              value={slide}
              onChange={(e) => setSlide(Number(e.target.value))}
            >
              {work.slides.map((s, i) => (
                <option key={i} value={i}>
                  {i + 1}. {s.title}
                </option>
              ))}
            </select>
          </label>
        )}

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
          Export every slide and format:
          <code>npm run poster {workId || "&lt;id&gt;"}</code>
        </div>
      </aside>

      <main className="studio-stage">
        {spec ? (
          <PosterFrame format={format} scale={scale}>
            {renderTemplate(spec, format)}
          </PosterFrame>
        ) : (
          <p>No work selected.</p>
        )}
      </main>
    </div>
  );
}
