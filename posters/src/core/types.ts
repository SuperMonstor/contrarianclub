// The data a template renders.
//
// One folder under works/ is one Work: a poster is a Work with a single slide,
// a carousel is a Work with several. Nothing outside that folder needs editing
// to add one; the registry discovers it.

import type { FormatId } from "./formats";

export type TemplateId = "editorial" | "statement" | "versus";

export interface DetailRow {
  label: string;
  value: string;
}

/** One side of a versus slide. */
export interface VersusColumn {
  heading: string;
  points: string[];
}

/** One rendered surface. A poster has one of these; a carousel has several. */
export interface SlideSpec {
  template: TemplateId;

  /** small gold uppercase tracked-out line above the title */
  kicker: string;
  /** the hero */
  title: string;
  /** one sentence directly under the title */
  oneLiner?: string;

  /** optional short list / row of supporting points */
  points?: string[];

  /** the details block (date, time, entry, …) */
  details?: DetailRow[];

  /** optional ceremonial closing line */
  closing?: string;

  /** the two sides of a versus slide (exactly two render side by side) */
  columns?: VersusColumn[];

  /** Optional treated background image. Import it from the work's own assets/
   *  folder rather than referencing a shared path:
   *    import hero from "./assets/hero.jpg";
   */
  image?: {
    src: string;
    /** how far the image bleeds in from the right (editorial) or fills (statement) */
    treatment?: "duotone" | "scrim" | "full";
  };
}

export interface WorkSpec {
  /** what this is, in the studio picker and in the archive */
  title: string;
  /** ISO date of the event or the post. Sorts the archive. */
  date: string;

  /** One slide is a poster. Several, in order, is a carousel. */
  slides: SlideSpec[];

  /** Which formats `npm run poster <id>` writes by default. Posters usually
   *  want the three feed sizes; carousels only want the slide size. */
  formats?: FormatId[];
}

/** A WorkSpec plus the id derived from its folder name. */
export interface Work extends WorkSpec {
  id: string;
}
