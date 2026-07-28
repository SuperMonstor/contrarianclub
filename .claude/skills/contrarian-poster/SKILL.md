---
name: contrarian-poster
description: >-
  Create posters and carousels for The Contrarian Debate Club events in the
  club's gallery-at-night aesthetic, using the standalone studio in `posters/`.
  Use when the user asks to make, design, or export a poster, carousel, flyer,
  invite, or social image for a Contrarian debate event. Encodes the brand
  canon, voice rules, the design-first working method, the image treatment
  recipe, and the export workflow so results stay on-brand session to session.
---

# Making a Contrarian Debate Club poster

The poster system lives in `posters/` (standalone Vite + React + TS project,
separate from the website). Read `posters/README.md` for commands and file
layout. This skill is the playbook: what to decide and the tacit craft that is
not obvious from the code.

## Design the output first

There are no templates to choose from. This is deliberate.

Start from what the piece has to do, in the room where someone will see it,
and design backwards to the layout. What is the one thing a person scrolling
past has to come away with? Where does the eye land first, then second? Does
this piece want to whisper or shout? Answer that, sketch the composition it
implies, and only then reach into `src/core/kit/` for the shared pieces and
build the rest yourself in the work's own folder.

Do not open an existing work to copy its layout. Read one to learn the
grammar, then design this one. The pieces in `works/` are finished answers to
questions that were not this question.

**Never edit `src/core/` to solve one event's problem.** Core is the brand
surface and the kit: the canvas, the type roles, the hairlines, the standard
art treatment, formats, export. It has to be right for every poster the club
will ever make. A scrim tuned for one painting is not that, and belongs in the
work folder. Something only graduates into the kit when a second piece wants
it and its shape has stopped moving. If you think core genuinely needs a
change, say so explicitly rather than sneaking a one-off in.

## Workflow

1. **Get the brief**: event name, one-liner, date/time, entry line, any
   supporting points. Fill unknowns with the user, do not invent event facts.
2. **Decide what the piece is doing** before writing any layout code. For a
   carousel, plan the argument first: a hook, one move per slide, then a
   close. State the visual grammar you are going to hold across the slides.
3. **Make a folder**: `posters/works/<yyyy-mm-dd>-<slug>/` containing
   `spec.tsx` (default-exporting a `WorkSpec` from `src/core/types.ts`),
   `slides.tsx` (the layout and the copy types this piece defines for itself),
   `slides.css` if it needs its own scrims, and its images in `assets/`.
   Nothing registers a work: the studio and the CLI glob `works/*/spec.tsx`,
   and the folder name is the id.
4. **Write the grammar down** at the top of `slides.tsx`: which composition
   each slide type uses and what each accent color means. Bespoke design
   without a stated grammar produces nine unrelated slides instead of one
   object. `works/2026-07-19-national-pride/slides.tsx` is the model.
5. **Preview and export**: `cd posters && npm run poster <id>` renders to
   `works/<id>/out/` at 2x. Then **look at the exported image** (Read it) and
   iterate. Do not trust the code alone; these are visual artifacts.
6. Iterate on treatment and spacing until it reads well, then commit the spec,
   the slides, the assets and `out/` together, and report the paths.

A poster is a one-slide work; a carousel is the same thing with several
slides, plus `formats: ["carousel-slide"]`. There is no second concept.

## What core gives you

`src/core/kit/` is the whole of what a work should import:

- **`PosterFrame`**: the fixed canvas at exact pixel size.
- **`Lockup`**: the real logo artwork. Never re-typeset the wordmark.
- **`Art`, `ArtTone`**: the standard darken-and-warm painting treatment.

Plus the type roles in `brand/poster.css` (`.kicker`, `.hero`, `.one-liner`,
`.label`, `.value`, `.closing`, `.rule`) and the `--cc-*` tokens. Everything
else you build.

A `Slide` is a `render` function plus two facts: `hasImage` (so the export
picks JPEG over PNG) and `label` (how the studio names it). Core does not know
what your slide says, so there is no field list to fill in and no shape to
conform to.

## Voice (non-negotiable)

Short declaratives, dry and a little ceremonial. **No em dashes** (repo rule),
no exclamation marks, no emoji, no growth-speak. Split a clause that wants an
em dash into two short sentences, or use a colon.

## Brand quick reference

Tokens are in `posters/src/core/brand/tokens.css`. Do not hardcode new colors;
use the `--cc-*` variables.

- Warm near-black surfaces, gold leaf (`--cc-gold #c8a24a`), ivory text.
- Fonts: Playfair Display (logo, serif headlines), Inter (kickers, meta,
  body), Oswald (condensed headlines).
- Logo: `logo-dark.svg` is gold+white for dark backgrounds, `logo-light.svg`
  gold+black for light. Because the logo already says "THE CONTRARIAN DEBATE
  CLUB", do not repeat the full club name in the kicker; use a short label
  like "Invite Only".

## Images: source and treatment

Backdrops are **public-domain old-master paintings** (the reference posters do
this; they are not the club's own photos). Pick art that fits the theme.

Sourcing:

1. Query Wikimedia Commons for a high-res scan (prefer > ~2000px on the long
   edge). Use the API `imageinfo` to get the real file URL and size; the
   convenience redirect URLs are often tiny.
2. Download, convert to JPG (`sips -s format jpeg`), drop it in the work's own
   `assets/` folder and `import` it in `spec.tsx`. Images belong to the work,
   not to a shared pile.
3. Downloading art is a file download: only do it for the user's own request.

Treatment. Old-master paintings are usually **too bright** for this dark
palette, so the kit's `.art` rule darkens and warms them:
`filter: saturate(0.82) contrast(1.05) brightness(0.86) sepia(0.1)`. If the
image is still too light or too dark, adjust `brightness` first, in your own
work-local class rather than in core.

That standard treatment is not always right. A painting that is dark to begin
with (an ink landscape) needs a **lift**, not a darkening, or the slide reads
as plain black in the feed. See `.np-conflict-img` in the national pride work
for that case.

Then layer, in your own `slides.css`:

- a warm gradient wash (`ArtTone`) to pull cool tones toward gold,
- a **legibility scrim** you tune to this painting: soft over the logo, an
  open window where the subject is, then a ramp to near-black under the text,
- a layered `text-shadow` on content sitting over a busy painting.

The failure mode to avoid: over-darkening until the image disappears. The
subject should be clearly visible; only the text zones go near-black.

## Formats

`ig-portrait` (default, 1080x1350), `ig-square`, `ig-story`, `carousel-slide`.
Your layout receives the `format` and should reflow across all the ones the
work declares. Check story (9:16) crops separately: a wide painting gets a
tight vertical slice there.

## Gotchas

- Run `npm` commands from inside `posters/` (the shell cwd can reset to repo
  root between calls).
- Export uses `channel: "chrome"`; it needs Google Chrome installed, not a
  Playwright-downloaded browser.
- Export is not byte-reproducible (film grain and antialiasing vary slightly
  run to run). Compare exports by eye or by pixel metric, never by checksum.
- Work-local CSS classes share one global namespace, so prefix them per work
  (`.np-plate-img`).
- Commit atomically as you go (repo convention).
