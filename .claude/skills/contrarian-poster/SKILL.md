---
name: contrarian-poster
description: >-
  Create posters and carousels for The Contrarian Debate Club events in the
  club's gallery-at-night aesthetic, using the standalone studio in `posters/`.
  Use when the user asks to make, design, or export a poster, carousel, flyer,
  invite, or social image for a Contrarian debate event, or to add a new poster
  template. Encodes the brand canon, voice rules, template choice, image
  treatment recipe, and export workflow so results stay on-brand session to
  session.
---

# Making a Contrarian Debate Club poster

The poster system lives in `posters/` (standalone Vite + React + TS project,
separate from the website). Read `posters/README.md` for commands and file
layout. This skill is the playbook: what to decide and the tacit craft that is
not obvious from the code.

## Workflow

1. **Get the brief**: event name, one-liner, date/time, entry line, any
   supporting points. Fill unknowns with the user, do not invent event facts.
2. **Pick a template** (see below).
3. **Write a spec** in `posters/src/posters/<id>.ts` and register it in
   `posters/src/posters/index.ts`. A spec is plain data (`PosterSpec` in
   `src/types.ts`).
4. **Preview and export**: `cd posters && npm run poster <id>` renders every
   format to `out/<id>/` at 2x. Then **look at the PNG** (Read the image) and
   iterate. Do not trust the code alone; these are visual artifacts.
5. Iterate on treatment/spacing until it reads well, then report the output
   paths.

## Voice (non-negotiable)

Short declaratives, dry and a little ceremonial. **No em dashes** (repo rule),
no exclamation marks, no emoji, no growth-speak. Split a clause that wants an
em dash into two short sentences, or use a colon.

## Template choice

- **`editorial`**: a printed-programme feel, text-forward, image optional. Use
  for detailed event announcements: kicker, hero title, one-liner, numbered
  points, a details block, ceremonial closing. Reference posts 13 and 14.
- **`statement`**: full-bleed treated image behind a huge condensed headline,
  logo centered up top, details low. Use for punchy promotion where the image
  carries the poster. Reference post 16.

If the copy is an event *name* with rich detail, lean editorial. If it is a
short provocation or a promo meant to stop the scroll, lean statement.

## Brand quick reference

Tokens are in `posters/src/brand/tokens.css`. Do not hardcode new colors;
use the `--cc-*` variables.

- Warm near-black surfaces, gold leaf (`--cc-gold #c8a24a`), ivory text.
- Fonts: Playfair Display (logo + editorial headlines), Inter (kickers, meta,
  body), Oswald (condensed statement headlines).
- Logo: use the real SVGs via `Lockup` (`logo-dark.svg` = gold+white for dark
  backgrounds; `logo-light.svg` = gold+black for light). Never re-typeset the
  wordmark. Because the logo already says "THE CONTRARIAN DEBATE CLUB", do not
  repeat the full club name in the kicker; use a short label like "Invite Only".

## Images: source and treatment

Backdrops are **public-domain old-master paintings** (the reference posters do
this; they are not the club's own photos). Pick art that fits the theme (for a
debate/assembly, a senate, forum, or orator scene works well).

Sourcing:
1. Query Wikimedia Commons for a high-res scan (prefer > ~2000px on the long
   edge). Use the API `imageinfo` to get the real file URL and size; the
   convenience redirect URLs are often tiny.
2. Download, convert to JPG (`sips -s format jpeg`), drop it in
   `posters/public/`, reference it as `/<file>.jpg`.
3. Downloading art is a file download: only do it for the user's own request.

Treatment (in the `.stmt-*` rules of `posters/src/brand/poster.css`): old-master
paintings are usually **too bright** for this dark palette. The tuned recipe:
- `filter: saturate(~0.82) contrast(~1.05) brightness(~0.86) sepia(~0.1)` to
  darken and warm without crushing the figures. If the image is still too
  light or too dark, adjust `brightness` first.
- a gentle warm gradient wash (`.stmt-tone`) to pull cool tones toward gold.
- a legibility scrim (`.stmt-scrim`): soft over the logo at top, an **open
  window** in the upper-middle so the subject shows, then ramp to near-black
  under the headline block.
- a layered `text-shadow` on the statement content so type separates from a
  busy painting.

The failure mode to avoid: over-darkening until the image disappears. The
subject should be clearly visible; only the text zones go near-black.

## Formats

`ig-portrait` (default, 1080x1350), `ig-square`, `ig-story`, `carousel-slide`.
One template reflows across all. For carousels, plan slides as hook, then one
argument per slide, then a CTA, sharing the header lockup. Check story (9:16)
crops separately: a wide painting gets a tight vertical slice there.

## Gotchas

- Run `npm` commands from inside `posters/` (the shell cwd can reset to repo
  root between calls).
- Export uses `channel: "chrome"`; it needs Google Chrome installed, not a
  Playwright-downloaded browser.
- Commit atomically as you go (repo convention).
