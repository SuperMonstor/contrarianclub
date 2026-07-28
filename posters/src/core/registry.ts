import type { Work, WorkSpec } from "./types";

// Every folder under works/ that has a spec is a work. There is no list to
// maintain: drop the folder in and it shows up in the studio and in the export
// CLI. The folder name is the id, so works/2026-07-12-open-debate/ is exported
// with `npm run poster 2026-07-12-open-debate`.
//
// Specs render their own slides, so they are .tsx.
const modules = import.meta.glob<{ default: WorkSpec }>(
  "../../works/*/spec.{ts,tsx}",
  { eager: true },
);

function idFromPath(path: string): string {
  return path.split("/").at(-2)!;
}

export const WORKS: Record<string, Work> = Object.fromEntries(
  Object.entries(modules).map(([path, mod]) => {
    const id = idFromPath(path);
    return [id, { ...mod.default, id }];
  }),
);

/** Newest first, so the studio opens on what you are most likely working on. */
export const WORK_LIST: Work[] = Object.values(WORKS).sort((a, b) =>
  b.date.localeCompare(a.date),
);

/** What the export CLI reads. It cannot import specs directly (they import
 *  images, which only Vite can resolve), so it asks the running app instead. */
export interface WorkManifestEntry {
  id: string;
  title: string;
  date: string;
  formats?: string[];
  slides: {
    /** Photographic slides ship as JPEG: lossless PNG of a painting is four
     *  times the bytes for no visible gain. Flat typographic slides stay PNG. */
    hasImage: boolean;
  }[];
}

export const MANIFEST: WorkManifestEntry[] = WORK_LIST.map((w) => ({
  id: w.id,
  title: w.title,
  date: w.date,
  formats: w.formats,
  slides: w.slides.map((s) => ({ hasImage: Boolean(s.hasImage) })),
}));
