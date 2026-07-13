import type { PosterSpec } from "../core/types";
import { communityOpenDebate } from "./community-open-debate";
import { communityOpenDebatePromo } from "./community-open-debate-promo";

// Registry of all posters. Add new specs here; the studio and the export CLI
// both read from this map. `npm run poster <id>` renders one by id.
export const POSTERS: Record<string, PosterSpec> = {
  [communityOpenDebate.id]: communityOpenDebate,
  [communityOpenDebatePromo.id]: communityOpenDebatePromo,
};

export const POSTER_LIST: PosterSpec[] = Object.values(POSTERS);
