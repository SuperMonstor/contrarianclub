// Output formats. The social formats all render inside a 1080-wide canvas, so
// one layout serves all of them.
//
// Print is a second family and it measures in inches, not pixels. A print
// format's canvas is its trim size at 300 px per inch, so 1px is 1/300in and
// type is sized the way a printer thinks: 12pt is 50px. Export renders at 2x,
// which lands a print piece at 600dpi. Trim only, no bleed.

export type FormatId =
  | "ig-square"
  | "ig-portrait"
  | "ig-story"
  | "carousel-slide"
  | "bookmark";

export interface Format {
  id: FormatId;
  label: string;
  width: number;
  height: number;
  /** Headed for paper rather than a feed. Print formats always export
   *  lossless: JPEG artefacts live in large flat dark areas, which is most of
   *  what a gallery-at-night piece is made of, and a press will find them. */
  print?: boolean;
}

export const FORMATS: Record<FormatId, Format> = {
  "ig-portrait": { id: "ig-portrait", label: "IG Portrait", width: 1080, height: 1350 },
  "ig-square": { id: "ig-square", label: "IG Square", width: 1080, height: 1080 },
  "ig-story": { id: "ig-story", label: "IG Story", width: 1080, height: 1920 },
  "carousel-slide": { id: "carousel-slide", label: "Carousel Slide", width: 1080, height: 1350 },
  // print: 2 x 6 in at 300px/in, ships at 1200x3600 (600dpi)
  bookmark: { id: "bookmark", label: "Bookmark (2x6in)", width: 600, height: 1800, print: true },
};

export const FORMAT_LIST: Format[] = Object.values(FORMATS);
