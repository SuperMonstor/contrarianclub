# 0004 - Contrarian x Fight Club Bengaluru collaboration deck

## Context

We had a conversation with a prospective sponsor who is interested in the
intersection of intellectually minded and fitness minded people. Contrarian
runs debate nights; Fight Club Bengaluru is a striking and sparring community
that meets mornings at Concept01 Koramangala, runs numbered volumes, and drills
themes like "Aggression and Composure in Striking" before sparring. A
co-branded night sits exactly on that intersection, and the sponsor is the
audience for the deck.

The existing partner system (`/partners/<slug>`, `src/content/partner-decks.ts`,
`src/app/partners/partner-brief.tsx`) renders one shared Contrarian brief plus
two bespoke pages. It assumes a single club talking to a brand. This deck has a
different spine: two clubs, one combined audience, one sponsor. Bending the
shared brief to carry a second club's identity would compromise it for every
other partner, so this is a separate route that reuses the visual language.

## Decision

Add a standalone co-branded deck at `/partners/fight-club`, built as its own
route and component, styled with its own CSS module modelled on
`src/app/partners/page.module.css` (same paper-and-ink palette, same brand
tokens, same A4 landscape print scaffold and PDF export button).

Not an ADR: this introduces no architectural, data, provider, or distribution
change. It is one more marketing page.

### Pages

1. **Hero** - co-branded lockup (Contrarian x Fight Club Bengaluru), headline on
   body and mind in one room, one line on what the collaboration is.
2. **The two rooms** - Contrarian (the argument) beside Fight Club (the ring):
   what each community is and who it draws.
3. **The format** - how a joint night runs: train and spar together first, then
   debate a motion drawn from that world (competition, aggression, discipline,
   risk, self-optimisation). Contrarian spine kept: vote, debate, vote, measure
   the opinion swing.
4. **Who is in the room** - the intersection demographic, as a profile grid.
   This is the sponsor's actual target: people who train their body and their
   argument with the same seriousness.
5. **Combined reach** - both audiences plus Contrarian's content engine, as a
   stats band.
6. **What we would build** - two or three blocks for the sponsor: presence in
   the room, integration into the content, product fit.
7. **Footer** - both marks, contact.

### Assets

Fight Club imagery to be supplied by the club and dropped in
`public/media/fight-club/`:

- `sparring.jpg` - hero, a wide training or sparring frame
- `community.jpg` - the two-rooms right panel, the group together
- `training.jpg` - the format page
- `logo-light.svg` - their wordmark for dark backgrounds

Contrarian side reuses existing `public/media/*`. The page renders even if a
Fight Club asset is missing (broken image, not a crash), so the deck can be
reviewed before the assets land.

## Consequences

- `/partners/fight-club` is a static route that shadows the `[partner]` dynamic
  segment for that slug. `partner-decks.ts` is untouched, so no generic
  partner brief is generated for Fight Club.
- The new CSS module duplicates the print scaffold from `page.module.css`
  rather than importing it. The two can drift; that is the price of keeping the
  shared brief unaffected by changes made for this deck.
- Copy about Fight Club's size and history is placeholder until the club
  confirms real numbers.
