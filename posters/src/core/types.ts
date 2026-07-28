// What core knows about a poster, which is deliberately almost nothing.
//
// One folder under works/ is one Work: a poster is a Work with a single slide,
// a carousel is a Work with several. Nothing outside that folder needs editing
// to add one; the registry discovers it.
//
// Core does not define what a slide SAYS. There is no kicker here, no title,
// no details block. Those are layout vocabulary, and baking them in is what
// turns every new piece into a hunt for the nearest existing shape. A work
// declares its own content types in its own folder and hands core a function
// that draws pixels. Start from the output, not from a form to fill in.

import type { ReactNode } from "react";
import type { Format, FormatId } from "./formats";

/** One rendered surface. A poster has one of these; a carousel has several. */
export interface Slide {
  /** Draw this slide at the given format. The work owns everything inside:
   *  its copy, its layout, its treatment of the art. Reach into src/core/kit
   *  for the shared pieces, and build the rest in the work's own folder. */
  render: (props: { format: Format }) => ReactNode;

  /** How the studio's slide picker names this one. Falls back to its number. */
  label?: string;

  /** Whether this slide carries a photograph. The only thing core needs to
   *  know about the content, and only because it picks the file format: a
   *  lossless PNG of a painting is four times the bytes for no visible gain,
   *  while flat typographic slides stay PNG. */
  hasImage?: boolean;
}

export interface WorkSpec {
  /** what this is, in the studio picker and in the archive */
  title: string;
  /** ISO date of the event or the post. Sorts the archive. */
  date: string;

  /** One slide is a poster. Several, in order, is a carousel. */
  slides: Slide[];

  /** Which formats `npm run poster <id>` writes by default. Posters usually
   *  want the three feed sizes; carousels only want the slide size. */
  formats?: FormatId[];
}

/** A WorkSpec plus the id derived from its folder name. */
export interface Work extends WorkSpec {
  id: string;
}
