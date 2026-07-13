# Contrarian Poster Studio

A standalone tool for making posters and carousels for The Contrarian Debate
Club, in the club's "gallery-at-night" aesthetic. Separate from the website
(its own dependencies and dev server), but lives in the same repo.

Stack: Vite + React + TypeScript. Export is a headless screenshot via your
installed Google Chrome (no Chromium download).

## The shape of this thing

Two layers, and the split is the whole point.

```
src/core/     the design system. Brand tokens, templates, formats, the studio
              shell. Stable and event-agnostic. Rarely changes.

works/        the history. One folder per poster or carousel, holding its copy,
              its own images and its exports. Grows forever. Nothing in here is
              edited again once it has shipped.
```

**Never edit `src/core/` to solve one event's problem.** If a poster needs
something the templates cannot do, that is a template change, and it has to be
good for every future poster too. Otherwise it belongs in the work's own spec.

A work folder looks like this:

```
works/2026-07-12-community-open-debate-promo/
  spec.ts               the copy and the layout choices
  assets/hero.jpg       its images, belonging to it alone
  out/                  its exports, committed
```

The folder name is the id: date first, so the archive sorts chronologically.
Nothing registers a work. The studio and the export CLI find it by globbing
`works/*/spec.ts`, so **adding a poster means adding a folder** and no shared
file is touched.

## Quick start

```bash
cd posters
npm install          # first time only
npm run dev          # studio: pick a work, slide and format, live preview
npm run poster <id>  # export it to works/<id>/out/
```

The id is the folder name, and any unambiguous substring of it will do:
`npm run poster open-debate-promo` is enough. Pass formats to narrow the
export: `npm run poster open-debate-promo ig-portrait`.

## Make a new poster

1. Copy the nearest existing work folder to `works/<yyyy-mm-dd>-<slug>/`.
2. Edit `spec.ts`. It is plain data (`WorkSpec` in `src/core/types.ts`):

   ```ts
   import type { WorkSpec } from "../../src/core/types";
   import hero from "./assets/hero.jpg";

   const work: WorkSpec = {
     title: "My Event",
     date: "2026-08-04",
     slides: [
       {
         template: "editorial", // "editorial" | "statement"
         kicker: "Invite Only",
         title: "My Event Title",
         oneLiner: "One sentence under the title.",
         points: ["Short point", "Another point"], // editorial only
         details: [{ label: "Date", value: "Tuesday, 4 August" }],
         closing: "Our house. Open floor.",
         image: { src: hero, treatment: "full" }, // optional
       },
     ],
   };

   export default work;
   ```

3. Put images in the work's own `assets/` and import them. Do not reach for a
   shared image directory: the point of the folder is that it carries
   everything it needs.
4. `npm run dev` to preview, then `npm run poster <id>`.
5. **Look at the exported file.** These are visual artifacts and the code alone
   will not tell you whether they read well. Iterate, then commit the spec, the
   assets and `out/` together.

## Carousels

A carousel is the general case and a poster is a carousel with one slide, so
there is no second concept to learn. Give the work several `slides` and the
export numbers them (`ig-portrait-01.jpg`, `-02`, and so on). Set
`formats: ["carousel-slide"]` on the work so it does not also render the story
and square sizes it will never use.

Plan slides as a hook, then one argument per slide, then a close.

## Templates

- **`editorial`** (`src/core/templates/Editorial.tsx`) is a printed-programme
  layout: logo up top, hero title, one-liner, numbered points, a details
  block, ceremonial closing. Text-forward; image optional. Matches reference
  posts 13 and 14.
- **`statement`** (`src/core/templates/Statement.tsx`) is full-bleed: a treated
  image behind a huge condensed headline, with the logo centered up top and
  details low. Matches reference post 16.

## Formats

Defined in `src/core/formats.ts`. One template reflows across all of them.

| id               | size        | use                 |
| ---------------- | ----------- | ------------------- |
| `ig-portrait`    | 1080 x 1350 | feed (default)      |
| `ig-square`      | 1080 x 1080 | feed                |
| `ig-story`       | 1080 x 1920 | story / reel cover  |
| `carousel-slide` | 1080 x 1350 | carousel slides     |

Export renders at 2x (`SCALE` in `export.ts`), so a 1080-wide format ships at
2160 wide.

Slides with a background image are written as JPEG at quality 92, flat
typographic slides as PNG. A lossless PNG of a painting is four times the bytes
for no visible gain, and these exports live in git.

## Brand

Design tokens live in `src/core/brand/tokens.css`, ported from the website's
`globals.css` so the two stay visually identical. Keep them in sync by hand.

- Surfaces: warm near-black (`--cc-black #0b0907`).
- Gold leaf: `--cc-gold #c8a24a`, bright `#f0d36a`, deep `#8a6c2c`.
- Text: ivory `#f4ead2`, parchment `#ddceac`, muted `#9d9079`.
- Fonts (self-hosted via `@fontsource`, see `src/core/brand/fonts.ts`): Playfair
  Display (display serif, logo + editorial), Inter (UI: kickers, meta, body),
  Oswald (bold condensed, statement headlines).
- Logo: the real artwork SVGs, `src/core/brand/logo-dark.svg` (gold + white, for
  dark backgrounds) and `logo-light.svg` (gold + black, for light). Rendered by
  `src/core/templates/Lockup.tsx`.

## Voice

Short declaratives, dry and a little ceremonial. No em dashes, no exclamation
marks, no emoji, no growth-speak.

## Images

Backdrops are public-domain old-master paintings (like the reference posters).
Source high-resolution scans from Wikimedia Commons. Bright paintings get
darkened and warmed to sit in the palette; the treatment lives in the `.stmt-*`
rules in `src/core/brand/poster.css`. The failure mode is over-darkening until
the subject disappears: only the text zones should go near-black.

## How export works

`export.ts` boots a Vite dev server in-process. Specs import images, which only
Vite can resolve, so node cannot read a spec directly: the app publishes what
the CLI needs on `window.__CONTRARIAN_WORKS__` and the CLI reads it off the
page. It then opens `/?render=<id>&slide=<n>&format=<fmt>` (the `BareRender`
mode: one slide at exact pixels), waits for fonts and images to load, and
screenshots the `#poster` element with Playwright using `channel: "chrome"`
(your installed Chrome).
