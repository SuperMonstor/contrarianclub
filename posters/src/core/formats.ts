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
  | "bookmark"
  | "bookmark-bleed";

export interface Format {
  id: FormatId;
  label: string;
  width: number;
  height: number;
  /** Headed for paper rather than a feed. Print formats always export
   *  lossless: JPEG artefacts live in large flat dark areas, which is most of
   *  what a gallery-at-night piece is made of, and a press will find them. */
  print?: boolean;

  /** Extra canvas outside the trim, in px, on every side. The layout does not
   *  move: the surface runs out past where the guillotine lands so a cut that
   *  drifts still lands in ink. A piece that reaches its edges wants this; one
   *  with a white border does not. */
  bleed?: number;
}

export const FORMATS: Record<FormatId, Format> = {
  "ig-portrait": { id: "ig-portrait", label: "IG Portrait", width: 1080, height: 1350 },
  "ig-square": { id: "ig-square", label: "IG Square", width: 1080, height: 1080 },
  "ig-story": { id: "ig-story", label: "IG Story", width: 1080, height: 1920 },
  "carousel-slide": { id: "carousel-slide", label: "Carousel Slide", width: 1080, height: 1350 },
  // print: 2 x 6 in at 300px/in, ships at 1200x3600 (600dpi)
  bookmark: { id: "bookmark", label: "Bookmark (2x6in)", width: 600, height: 1800, print: true },
  // the same piece with 1/8in (3.175mm) of bleed on every side. An eighth
  // rather than a round 3mm because Chrome rounds a PDF page to the nearest
  // eighth: at 3mm the page comes out 0.25mm larger than the artwork and the
  // press-ready file carries a hairline of white at two edges.
  "bookmark-bleed": {
    id: "bookmark-bleed",
    label: "Bookmark (2x6in + 1/8in bleed)",
    width: 675,
    height: 1875,
    print: true,
    bleed: 37.5,
  },
};

export const FORMAT_LIST: Format[] = Object.values(FORMATS);
