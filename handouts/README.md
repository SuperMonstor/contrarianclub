# Handouts

What the club prints and gives people. Two sheets per motion, plus cards.

**The speaker handout**, one A4 printed both sides, for anyone who might be
drawn to argue. The front is the argument: the motion, the two or three words
it will otherwise be fought over, the one question the evening actually turns
on, where each bench starts, and five numbered blocks to jot a case into. The
back is the night: what a speaker is being asked to do, the running order with
room to write who is speaking, a rebuttal grid split by round, and one line
for the sentence you close on.

**The open floor handout**, one A4 side, for everyone. The same argument, then
the rules for taking the floor and somewhere to draft the question before the
hand goes up.

Both are forms, so they are on white paper. The gallery-at-night palette is
for things people look at. These are things people write on, and a dark sheet
is unwritable, expensive to print and unreadable at arm's length in a dim
room. The brand carries in the black masthead, the gold hairlines and the
Playfair motion instead.

## The shape of this thing

```
tokens.css     the palette, the type families, the reset. Every printed piece.
sheet.css      the A4 system: the masthead, the bands, the writing rules.
card.css       the A6 system: a wordmark, a rule, a line and a sentence.
render.js      the renderers for the parts that come from the motion.
sheets/        one file per kind of sheet. Layout and standing copy.
<motion>/      one folder per motion: its debate.js, its builds, its out/.
cards/         one-offs. A card brings its own layout and its own words.
```

The split is the point, and it is the same one `posters/` makes. A sheet type
is a form and every motion gets the identical form, so layouts live in
`sheets/` and never in a motion folder. A motion folder holds only what is
true of that motion, which means the motion is worded in exactly one place and
a reworded motion cannot disagree with itself across four sheets.

`build.cjs` tells the two kinds of folder apart by whether it holds a
`debate.js`. One that does is copy without a layout, and every sheet type is
built against it. One that does not holds its own `.src.html` files, which are
built where they sit.

Anything that is true of every debate, like the rules for taking the floor,
belongs to the sheet that prints it. Anything true of one night, like the
running order, belongs to `debate.js`.

## Making a motion's handouts

```
cp -r handouts/2026-08-16-debate-9-familial-obligation handouts/2026-09-13-some-motion
rm -rf handouts/2026-09-13-some-motion/out handouts/2026-09-13-some-motion/*.html
node handouts/build.cjs handouts/2026-09-13-some-motion --pdf
```

**Edit `debate.js` and nothing else.** The edition, the line under it, the
ritual formula, the claim, the poles of the scale, the terms, the agreed
ground, the split, where each bench starts, what a speaker is asked to do, the
running order, and how many writing blocks and rebuttal rows to draw.

`rounds` is the format itself. Each round is a label and its beats, and a beat
marked `true` gets a rule to write the speaker's name on. The beats are
numbered straight through every round, so "you speak fifth" means something.
`rows` mirrors it: one entry per round, and the number of exchanges to rule
under it. Change the format and both follow.

Every sheet in `sheets/` is built for the motion you name, and the results
land in that motion's folder: `handout.html` and `floor.html` to open and
print, `out/*.pdf` for the print shop. `build.cjs` with no folder lists the
motions that exist.

The built HTML is self-contained. Fonts, the wordmark, the stylesheet and the
renderers are all inlined, so it renders identically on any machine and at any
print shop with no network and no sibling assets. Do not preview a file in
`sheets/` directly: its fonts are still placeholders and the type will lie to
you.

The `when` field is free text, and is worth more as "Motion two of two" than
as a date: everybody holding one is already in the room.

## Cards

A6, one side, white. The wordmark, a short gold rule, who it is for and one
sentence. A card is the club saying one thing to one person, and anything more
than that stops being a card.

```
node handouts/build.cjs handouts/cards --pdf
```

There is no shared copy and no data file: each card is a one-off, so its words
live in its own `.src.html` next to the markup. Make another by copying one.

The bottom third is deliberately quiet. If a card is going to be signed by
hand, that is where the pen goes.

## Writing the copy

Three things decide whether a sheet is worth the paper.

**The terms.** Define them so that neither side would object to the wording
before the debate starts. A loaded definition settles the motion in advance
and the room can tell.

**Both sides agree.** Name the ground nobody is contesting. This is the line
that stops twenty minutes being spent proving something both sides already
grant.

**They split on.** One sentence, phrased as a question. If it takes two
sentences, the motion has two debates in it and one of them should be cut.

Three terms is the ceiling. Two is usually right. Spend the third on the word
doing the quiet work: "tolerate" is not "approve", and "move towards" is not
"replace".

`benches` states where each side starts, one sentence each. It is the most
useful thing on the sheet for anyone who might be drawn to argue, and it has
to be fair to both benches or it is campaigning. Delete the key and the band
does not draw.

## Fitting it

Every sheet is a fixed budget and none of them scroll. Long definitions and
five writing blocks do not both fit on the speaker front, more rebuttal rows
buy themselves out of the height of every line, and a three line motion costs
the floor sheet a draft slot. Rebuild and look at it. If the last rule sits
within a centimetre of the paper edge, or a writing line has dropped under
about 8mm, cut copy or cut a row. A line nobody can write on is not a line.

## Printing

- A4, portrait. The speaker handout is **double sided, flipped on the long
  edge**. Flipped on the short edge, the back page comes out upside down. The
  floor handout is single sided.
- Colour. The gold is a hairline accent and nothing load-bearing is set in it,
  so a mono photocopy still reads correctly, but it loses the thing that makes
  it look like ours.
- 100gsm or heavier if the shop offers it. 80gsm buckles under a ballpoint on
  a lap and the back page shows through the front. Cards want card: 300gsm,
  uncoated, so the gold does not sit on a shine.
- The floor handout is for the whole room, the speaker handout only for the
  drawn speakers and anyone who wants one. Print a handful more than the RSVP
  count either way. People take them home.
