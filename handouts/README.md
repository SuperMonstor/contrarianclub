# Debate handout

One A4 sheet, printed both sides, handed out as people sit down.

The front is what the room needs before anyone speaks: the motion, the two or
three words the argument will otherwise be fought over, the one question the
evening actually turns on, the running order, and five numbered blocks to jot
a case into. The back is taken live: five rows of what the other side said
against what you will answer, and one line for the sentence you close on.

It is a form, so it is on white paper. The gallery-at-night palette is for
things people look at. This is a thing people write on, and a dark sheet is
unwritable, expensive to print and unreadable at arm's length in a dim room.
The brand carries in the black masthead, the gold hairlines and the Playfair
motion instead.

## Making one for a debate

```
cp -r handouts/template handouts/2026-09-13-some-motion   # first time only, see below
node handouts/build.cjs handouts/2026-09-13-some-motion --pdf
```

For the next debate in the calendar, just edit the template in place:

```
node handouts/build.cjs --pdf
```

**Edit the `DEBATE` object at the bottom of `handout.src.html` and nothing
else.** Everything that changes between debates lives there: the number, the
date and venue, the motion, the poles of the scale, the terms, the agreed
ground, the split, the running order, and how many writing blocks and
rebuttal rows to draw. The layout above it is not a per-event decision.

`build.cjs` inlines the fonts and the wordmark as data URIs and writes
`handout.html`, then `--pdf` renders `out/handout.pdf` at true A4. The built
HTML is self-contained: it renders identically on any machine and at any print
shop with no network and no sibling asset folder. Open `handout.html` and
print from Chrome if you would rather not run the PDF step.

Do not preview `handout.src.html` directly. Its fonts are still placeholders
at that point and the type will lie to you.

## Writing the copy

Three things decide whether this sheet is worth the paper.

**The terms.** Define them so that neither side would object to the wording
before the debate starts. A loaded definition settles the motion in advance
and the room can tell.

**Both sides agree.** Name the ground nobody is contesting. This is the line
that stops twenty minutes being spent proving something both sides already
grant.

**They split on.** One sentence, phrased as a question. If it takes two
sentences, the motion has two debates in it and one of them should be cut.

Three terms is the ceiling. Two is usually right.

## Printing

- A4, portrait, **double sided, flipped on the long edge**. Flipped on the
  short edge, the back page comes out upside down.
- Colour. The gold is a hairline accent and nothing load-bearing is set in it,
  so a mono photocopy still reads correctly, but it loses the thing that makes
  it look like ours.
- 100gsm or heavier if the shop offers it. 80gsm buckles under a ballpoint on
  a lap and the back page shows through the front.
- Print a handful more than the RSVP count. People take them home.
