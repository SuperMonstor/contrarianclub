# Contrarian Poster Studio

A standalone tool for making posters and carousels for The Contrarian Debate
Club, in the club's "gallery-at-night" aesthetic. Separate from the website
(its own dependencies and dev server), but lives in the same repo.

Stack: Vite + React + TypeScript. Export is a headless screenshot via your
installed Google Chrome (no Chromium download).

## Quick start

```bash
cd posters
npm install          # first time only
npm run dev          # studio: pick a poster + format, live preview
npm run poster <id>  # export every format to out/<id>/
```

`npm run poster community-open-debate-promo` writes `ig-portrait.png`,
`ig-square.png`, and `ig-story.png` (all @2x) to `out/community-open-debate-promo/`.
Pass explicit formats to narrow it: `npm run poster <id> ig-portrait`.

## Make a new poster

1. Copy an existing spec in `src/posters/` to a new file, e.g.
   `src/posters/my-event.ts`. A spec is just data (see `src/types.ts`):

   ```ts
   export const myEvent: PosterSpec = {
     id: "my-event",          // must match the filename-ish; used by the CLI
     template: "editorial",   // "editorial" | "statement"
     kicker: "Invite Only",
     title: "My Event Title",
     oneLiner: "One sentence under the title.",
     points: ["Short point", "Another point"],       // editorial only
     details: [{ label: "Date", value: "Sunday, 12 July" }],
     closing: "Our house. Open floor.",
     image: { src: "/hero.jpg", treatment: "full" }, // statement / optional
   };
   ```

2. Register it in `src/posters/index.ts` (add the import + an entry in
   `POSTERS`).
3. `npm run dev` to preview, then `npm run poster my-event` to export.

## Templates

- **`editorial`** (`src/templates/Editorial.tsx`) is a printed-programme
  layout: logo up top, hero title, one-liner, numbered points, a details
  block, ceremonial closing. Text-forward; image optional. Matches reference
  posts 13 and 14.
- **`statement`** (`src/templates/Statement.tsx`) is full-bleed: a treated
  image behind a huge condensed headline, with the logo centered up top and
  details low. Matches reference post 16.

## Formats

Defined in `src/formats.ts`. One template reflows across all of them.

| id               | size        | use                 |
| ---------------- | ----------- | ------------------- |
| `ig-portrait`    | 1080 x 1350 | feed (default)      |
| `ig-square`      | 1080 x 1080 | feed                |
| `ig-story`       | 1080 x 1920 | story / reel cover  |
| `carousel-slide` | 1080 x 1350 | carousel slides     |

Export renders at 2x (`SCALE` in `export.ts`), so a 1080-wide format ships as
a 2160-wide PNG for crispness.

## Brand

Design tokens live in `src/brand/tokens.css`, ported from the website's
`globals.css` so the two stay visually identical. Keep them in sync by hand.

- Surfaces: warm near-black (`--cc-black #0b0907`).
- Gold leaf: `--cc-gold #c8a24a`, bright `#f0d36a`, deep `#8a6c2c`.
- Text: ivory `#f4ead2`, parchment `#ddceac`, muted `#9d9079`.
- Fonts (self-hosted via `@fontsource`, see `src/brand/fonts.ts`): Playfair
  Display (display serif, logo + editorial), Inter (UI: kickers, meta, body),
  Oswald (bold condensed, statement headlines).
- Logo: the real artwork SVGs, `src/brand/logo-dark.svg` (gold + white, for
  dark backgrounds) and `logo-light.svg` (gold + black, for light). Rendered
  by `src/templates/Lockup.tsx`.

## Voice

Short declaratives, dry and a little ceremonial. No em dashes, no exclamation
marks, no emoji, no growth-speak.

## Images

Backdrops are public-domain old-master paintings (like the reference posters),
put in `public/` and referenced as `/filename.jpg`. Source high-resolution
scans from Wikimedia Commons. Bright paintings get darkened and warmed to sit
in the palette; the treatment lives in the `.stmt-*` rules in
`src/brand/poster.css`.

## How export works

`export.ts` boots a Vite dev server in-process, opens
`/?render=<id>&format=<fmt>` (the `BareRender` mode: just the poster at exact
pixels), waits for fonts and images to load, and screenshots the `#poster`
element with Playwright using `channel: "chrome"` (your installed Chrome).
`out/` is gitignored.
