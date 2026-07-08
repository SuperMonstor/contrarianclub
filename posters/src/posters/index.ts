import type { PosterSpec } from "../types";
import { communityOpenDebate } from "./community-open-debate";

// Registry of all posters. Add new specs here; the studio and the export CLI
// both read from this map. `npm run poster <id>` renders one by id.
export const POSTERS: Record<string, PosterSpec> = {
  [communityOpenDebate.id]: communityOpenDebate,
};

export const POSTER_LIST: PosterSpec[] = Object.values(POSTERS);
