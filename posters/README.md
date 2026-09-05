# Contrarian Poster Studio

A standalone tool for making posters and carousels for The Contrarian Debate
Club, in the club's "gallery-at-night" aesthetic. Separate from the website
(its own dependencies and dev server), but lives in the same repo.

Stack: Vite + React + TypeScript. Export is a headless screenshot via your
installed Google Chrome (no Chromium download).

## The shape of this thing

Two layers, and the split is the whole point.

```
src/core/     the brand surface and the kit. The canvas, the type roles, the
              logo, the standard art treatment, the formats, the export
              pipeline. Stable and event-agnostic. Rarely changes.

works/        the archive. One folder per poster or carousel, holding its
              copy, its layout, its own images and its exports. Grows forever.
              Nothing in here is edited again once it has shipped.
```

**Never edit `src/core/` to solve one event's problem.** Core has to be right
for every poster the club will ever make. A scrim tuned for one painting is
not that, and belongs in the work folder. Something graduates into the kit
only when a second piece wants it and its shape has stopped moving.

A work folder looks like this:

```
works/2026-07-19-national-pride/
  spec.tsx              the copy, and which renderer draws each slide
  slides.tsx            the layout, and the copy types this piece defines
  slides.css            its own scrims, if it needs them
  assets/liberty.jpg    its images, belonging to it alone
  out/                  its exports, committed
```

The folder name is the id: date first, so the archive sorts chronologically.
Nothing registers a work. The studio and the export CLI find it by globbing
`works/*/spec.tsx`, so **adding a poster means adding a folder** and no shared
file is touched.

## Quick start

```bash
cd posters
npm install          # first time only
npm run dev          # studio: pick a work, slide and format, live preview
npm run poster <id>  # export it to works/<id>/out/
```

The id is the folder name, and any unambiguous substring of it will do:
`npm run poster national-pride` is enough. Pass formats to narrow the export:
`npm run poster national-pride carousel-slide`.

## Make a new poster

**Start from the output, not from an existing poster.**

There is no template to pick and no shape to fill in. Work out what the piece
has to do first: what the one thing a person scrolling past should come away
with is, where the eye lands first and second, whether it wants to whisper or
shout. Design the composition that answers that, then build it.

Read an existing work to learn the grammar if you like. Do not copy its
layout. The pieces in `works/` are finished answers to questions that were not
this question, and pouring new copy into an old shape is how posters start
looking like forms.

1. Make `works/<yyyy-mm-dd>-<slug>/`.
2. Write `slides.tsx`: the layout, plus whatever copy types this piece needs.
   Import the shared pieces from `src/core/kit`, and build the rest here.

   ```tsx
   import type { Format } from "../../src/core/formats";
   import { Art, ArtTone, Lockup } from "../../src/core/kit";
   import "./slides.css";

   export interface Copy {
     kicker: string;
     motion: string;
     // whatever this piece actually needs. It is your type.
   }

   export function Motion({ copy, format }: { copy: Copy; format: Format }) {
     return <div style={{ position: "absolute", inset: 0 }}>…</div>;
   }
   ```

3. Write `spec.tsx`: the copy, and which renderer draws each slide.

   ```tsx
   import type { WorkSpec } from "../../src/core/types";
   import hero from "./assets/hero.jpg";
   import { Motion } from "./slides";

   const work: WorkSpec = {
     title: "My Event",
     date: "2026-08-04",
     slides: [
       {
         label: "Motion",
         hasImage: true,
         render: ({ format }) => <Motion copy={{ … }} format={format} />,
       },
     ],
   };

   export default work;
   ```

4. Put images in the work's own `assets/` and import them. Do not reach for a
   shared image directory: the point of the folder is that it carries
   everything it needs.
5. `npm run dev` to preview, then `npm run poster <id>`.
6. **Look at the exported file.** These are visual artifacts and the code
   alone will not tell you whether they read well. Iterate, then commit the
   spec, the slides, the assets and `out/` together.

## What core knows about a slide

Almost nothing, on purpose:

```ts
interface Slide {
  render: (props: { format: Format }) => ReactNode;
  label?: string;     // how the studio's picker names it
  hasImage?: boolean; // picks JPEG over PNG on export
}
```

There is no `kicker` here, no `title`, no details block. That vocabulary
belonged to one layout, and having core impose it on every piece is what made
each new poster start as a hunt for the nearest existing shape.

## The kit

`src/core/kit/` is what a work may import:

- **`PosterFrame`**: the fixed canvas at exact pixel size.
- **`Lockup`**: the real logo artwork, dark or light variant. Never re-typeset
  the wordmark.
- **`Art`, `ArtTone`**: the standard darken-and-warm painting treatment.

Plus the type roles in `brand/poster.css` (`.kicker`, `.hero`, `.one-liner`,
`.label`, `.value`, `.closing`, `.rule`, `.rule-left`) and the `--cc-*`
tokens.

## Carousels

A carousel is the general case and a poster is a carousel with one slide, so
there is no second concept to learn. Give the work several `slides` and the
export numbers them (`carousel-slide-01.jpg`, `-02`, and so on). Set
`formats: ["carousel-slide"]` so it does not also render the story and square
sizes it will never use.

Plan the argument before the layout: a hook, one move per slide, then a close.
Then **write the visual grammar down** at the top of `slides.tsx`: which
composition each slide type uses, what each accent color means, and why. Nine
individually-designed slides with no stated grammar are nine unrelated images.
`works/2026-07-19-national-pride/slides.tsx` is the model.

## Formats

Defined in `src/core/formats.ts`. Your layout receives the `format` and should
reflow across the ones the work declares.

| id               | size        | use                |
| ---------------- | ----------- | ------------------ |
| `ig-portrait`    | 1080 x 1350 | feed (default)     |
| `ig-square`      | 1080 x 1080 | feed               |
| `ig-story`       | 1080 x 1920 | story / reel cover |
| `carousel-slide` | 1080 x 1350 | carousel slides    |

Print is a second family and it measures in inches. A print canvas is its trim
size at 300 px per inch, so 12pt type is 50px and the 2x export lands on paper
at 600dpi with its physical size stamped into the file.

| id               | size        | use                       |
| ---------------- | ----------- | ------------------------- |
| `bookmark`       | 2 x 6 in    | trim, what `out/` keeps   |
| `bookmark-bleed` | 2.25 x 6.25 | press, 1/8in on all sides |

Anything with bleed is written to `works/<id>/out/press/`, which is gitignored:
it is derivable, an order of magnitude heavier, and regenerated per print run.
A design that runs ink to its edges cannot go to a press as the trim render, so
run the bleed format before sending anything off:

```bash
npm run poster <id> bookmark-bleed
```

Export renders at 2x (`SCALE` in `export.ts`), so a 1080-wide format ships at
2160 wide.

Slides with a background image are written as JPEG at quality 92, flat
typographic slides as PNG. A lossless PNG of a painting is four times the
bytes for no visible gain, and these exports live in git.

## Brand

Design tokens live in `src/core/brand/tokens.css`, ported from the website's
`globals.css` so the two stay visually identical. Keep them in sync by hand.

- Surfaces: warm near-black (`--cc-black #0b0907`).
- Gold leaf: `--cc-gold #c8a24a`, bright `#f0d36a`, deep `#8a6c2c`.
- Text: ivory `#f4ead2`, parchment `#ddceac`, muted `#9d9079`.
- Fonts (self-hosted via `@fontsource`, see `src/core/brand/fonts.ts`):
  Playfair Display (display serif, logo + serif headlines), Inter (UI:
  kickers, meta, body), Oswald (bold condensed headlines).
- Logo: the real artwork SVGs, `src/core/brand/logo-dark.svg` (gold + white,
  for dark backgrounds) and `logo-light.svg` (gold + black, for light).

## Voice

Short declaratives, dry and a little ceremonial. No em dashes, no exclamation
marks, no emoji, no growth-speak.

## Images

Backdrops are public-domain old-master paintings (like the reference posters).
Source high-resolution scans from Wikimedia Commons.

The kit's `.art` rule is the standard treatment: bright paintings get darkened
and warmed to sit in the palette. It is not always right. A painting that is
dark to begin with needs a lift instead, in the work's own class (see
`.np-conflict-img`). The legibility scrim on top is always the work's own: it
says where type is allowed to sit on *this* picture, so it cannot be shared.

The failure mode is over-darkening until the subject disappears: only the text
zones should go near-black.

Work-local CSS shares one global namespace, so prefix classes per work
(`.np-plate-img`).

## How export works

`export.ts` boots a Vite dev server in-process. Specs import images, which
only Vite can resolve, so node cannot read a spec directly: the app publishes
what the CLI needs on `window.__CONTRARIAN_WORKS__` and the CLI reads it off
the page. It then opens `/?render=<id>&slide=<n>&format=<fmt>` (the
`BareRender` mode: one slide at exact pixels), waits for fonts and images to
load, and screenshots the `#poster` element with Playwright using
`channel: "chrome"` (your installed Chrome).

Export is not byte-reproducible: film grain and antialiasing vary slightly run
to run. Compare exports by eye, or with a pixel metric, never by checksum.
