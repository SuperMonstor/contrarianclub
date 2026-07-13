// The data a template renders.
//
// One folder under works/ is one Work: a poster is a Work with a single slide,
// a carousel is a Work with several. Nothing outside that folder needs editing
// to add one; the registry discovers it.

import type { FormatId } from "./formats";


import type { ReactNode } from "react";
import type { Format } from "./formats";

export type TemplateId = "editorial" | "statement" | "versus" | "panel";

/** A work can render a slide itself instead of naming a stock template. Use
 *  this when a piece wants a bespoke layout: it keeps one-off design out of
 *  src/core, where everything has to be right for every future poster. */
export type SlideRenderer = (props: {
  spec: SlideSpec;
  format: Format;
}) => ReactNode;

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
  /** a stock template by name, or the work's own renderer */
  template: TemplateId | SlideRenderer;

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
    /** CSS object-position for the crop, e.g. "center 62%". Each painting
     *  wants its own band; the template default is a sane middle crop. */
    position?: string;
    /** Panel slides: this slide shows slice `index` of `of` from one image
     *  shared across consecutive slides, so swiping pans the painting. */
    pane?: { index: number; of: number };
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
