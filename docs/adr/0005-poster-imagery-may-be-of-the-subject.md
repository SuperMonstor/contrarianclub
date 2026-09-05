# ADR 0005: Poster Imagery May Be of the Subject

Extends the imagery rule in `docs/brand-guide.md` section 8 and in
`posters/README.md`. Does not change ADR 0004.

## Context

Every poster the club has made backs its type with a public-domain old-master
painting, and the rule as written says exactly that: chiaroscuro Baroque or
old-master, warm sepia, figures out of shadow.

That rule has been doing two jobs at once and only one of them well. It sets
the register, which is the point of it, and it also picks the subject, which
it is not equipped to do. There are no old-master paintings of Bangalore.

For a general motion the gap is harmless: Bruegel's Babel stands in for a
thing that outgrew its footing and nobody minds. For the debate 10 bookmarks
it stopped working. The motions are about this city specifically, and every
painting that fit the register had to be justified by a caption explaining
what it had to do with Bengaluru. A metaphor that needs a caption on a 2in
strip of card is not carrying the piece, it is being carried by it.

## Decision

The imagery rule is about register, not medium. Any public-domain image that
sits in the gallery-at-night world is allowed: old-master paintings as before,
and now also period photographs, prints and engravings, including ones of the
actual subject.

Old-master paintings stay the default. Reach for something else when the piece
is about a specific place, person or event and a painting would only be a
metaphor for it.

Everything else about imagery is unchanged. Public domain only, never
rights-encumbered art, and never a CC BY-SA file on a piece going to a press.
Sourcing is still Wikimedia Commons with the file URL and licence checked
through the API rather than trusted from the page. The work's own CSS still
carries the treatment.

One thing does change in the treatment. A painting can be darkened into a
near-black card; a wood engraving cannot, because the hatching is the whole
image and it goes when the picture goes down. An engraving is therefore set as
a light plate tipped into the dark sheet, on parchment rather than white, with
the scan multiplied onto the paper so the two are one sheet. That is the same
register as a printed plate in a catalogue, and it is the same move the
2026-08-22 bookmark already makes for its QR tile.

## Consequences

A poster can now show the thing it is about. The debate 10 bookmarks use two
Victorian wood engravings of Bangalore, from 1849 and 1856, both of which
carry the city's name printed on the plate.

The register is now enforced by judgment rather than by the medium, so a piece
can go wrong in a way the old rule prevented: a period photograph that is
merely documentary will read as a slide, not as the club. The test is whether
it looks like it came out of the same album as everything else after the
work's treatment, not whether it is old.

Two treatment families now exist and they are opposites: dark art bled or
windowed into the sheet, and light plates tipped onto it. Both live in the
work's own CSS. If a second piece wants the light plate, that is when it
graduates into the kit.

`docs/brand-guide.md` section 8 stays as written, because it scopes itself to
the website's presenter display, which is unaffected.
