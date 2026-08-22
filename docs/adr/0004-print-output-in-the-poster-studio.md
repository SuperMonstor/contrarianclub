# ADR 0004: Print Output in the Poster Studio

## Context

Everything the club publishes as an image is made in `posters/`, and until now
every format was a screen format: three Instagram sizes and a carousel slide,
all 1080 wide. The club also wants physical pieces, starting with a bookmark
handed out at debates.

Print is not just another canvas size. It measures in inches at a resolution,
it has a trim edge that a guillotine cuts with a tolerance, and hairlines and
type sizes have to be judged in points rather than in screen pixels. Doing
this outside the repo would fork the brand surface again, which is the same
argument ADR 0002 made for the thumbnail pipeline.

## Decision

Print formats live in `src/core/formats.ts` beside the social ones, and are a
second family with their own unit convention: a print format's canvas is its
trim size at 300 px per inch, so `1px` is `1/300in` and type is sized the way
a printer thinks (12pt is 50px). Export already renders at 2x, so a print
piece ships at 600dpi with no change to `export.ts`.

The first one is `bookmark`, 600x1800 (2 x 6 in), shipping 1200x3600.

A print format is marked `print: true`, and the exporter writes PNG for it
whatever the slide carries. On screen a painting ships as JPEG because a
lossless PNG of one is four times the bytes for no visible gain; on paper that
reverses. JPEG artefacts live in large flat dark areas, which is most of what
a gallery-at-night piece is made of, and a press finds them.

A print export is stamped with its physical size (a PNG pHYs chunk) on the way
out. A screenshot ships tagged 72dpi, so a printer placing a bookmark would
get a 16 x 50 inch image and have to know to resize it. The pixels are right
either way; the file should say how big it is.

Print ships PNG, not PDF. A PDF with live type was the obvious thing to hand a
press, and Chrome's print path produced one at exact size. It also composited
the page differently from the screen path: CSS filters were dropped, a
mix-blend-mode layer flattened, and a layered text-shadow came out as an
opaque rectangle behind the words. The result was a different design. The
screenshot uses the same compositor as the studio preview, so it is the only
export that is what was approved, and it is what goes to the printer.

A format may carry a bleed: extra canvas outside the trim on every side, with
the layout staying exactly where it is and the surface running out past where
the guillotine lands. A piece that reaches its edges wants one, since a cut
drifts and a white sliver on a near-black card is the usual way a print run
comes back looking amateur. The bookmark's is an eighth of an inch rather than
a round 3mm, because Chrome rounds a PDF page to the nearest eighth and a 3mm
allowance would leave a hairline of white in the press-ready file.

Trim and bleed are separate formats, so a work ships both and hands the
printer whichever they ask for.

Still no crop marks and no CMYK conversion: both are per-run decisions and
belong to the printer, or to a prepress step once the run is booked.

Output splits by audience. The trim renders are the archive and are committed.
Anything press-ready (any bleed render, every PDF) lands in out/press/, which
is gitignored: it is derivable, an order of magnitude heavier, and regenerated
per print run.

Treatment for ink is the work's own, not core's. A screen treatment judged on
a monitor prints muddy: ink gains on paper and the shadows close up. A print
work therefore keeps its blacks off solid so a ramp has somewhere to go, runs
more grain than a social piece as dither against banding in long dark
gradients, and lifts its paintings above where they looked right on screen.
Those numbers are tuned per piece and live in the work's own CSS.

Print pieces are works like any other. They live in `works/<date>-<slug>/`,
preview in the studio and export with `npm run poster <id>`.

Core's poster surface stays screen-shaped. `.poster-border` sits 40px inside
the canvas, which is a sound frame at 1080 wide and far too close to the trim
edge at 600. A print work covers it with its own full-bleed sheet and draws
its own frame at a safe inset. If a second print piece wants the same sheet,
that is when it graduates into the kit.

## Consequences

Print pieces inherit the tokens, fonts, logo and export pipeline, and archive
under `works/` next to the posters.

Anything sent to a press needs a bleed and mark step outside the studio if the
printer asks for one, and a soft-proof, since the exports are sRGB. Near-black
surfaces want a rich black build rather than 100 percent K, and a proof on the
actual stock before the run.

Print exports are several megabytes each. Only the trim renders are committed,
so a print work costs more in the repo than a social one but not the hundred
megabytes a full press pack runs to.

Type sized for a 1080-wide social canvas is meaningless on a print canvas and
vice versa, so a work declares print or social formats, not both.
