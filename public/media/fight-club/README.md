# Fight Club Bengaluru assets

Used by the Contrarian Club x Fight Club deck at `/partners/fight-club`.

Everything here except `sparring.jpg` came from the club itself.

| File | Used on |
|---|---|
| `logo.png` | The crest, in the hero lockup and the footer |
| `sparring.jpg` | Opening page, lower frame |
| `crowd.jpg` | "The two clubs" page, right panel |
| `neon.jpg` | "One roof" page |
| `fc-coaches.jpg` | "The room" page, top left |
| `fc-bags.jpg` | "The room" page, top right |
| `fc-seated.jpg` | "The room" page, bottom left |
| `fc-spar.jpg` | "The room" page, bottom right |
| `fc-floor.jpg` | The proposal page, beside the Contrarian frame |

## The crest

Its fade is baked into the pixels against the page's own near-black rather than
left transparent, because Chrome flattens image alpha when it exports the PDF.
Colour management then puts that baked black a shade off the CSS one, so the
element is clipped to a circle and the seam has no corner to show. It is also
marked `unoptimized`: the image optimiser kept serving a stale copy of it
through every cache clear.

Regenerating it means redoing the bake, not just re-cropping. Keep the fade and
the near-black, or the square comes back.

## The last placeholder

`sparring.jpg` is still a rough crop off their Instagram. Drop a real photograph
in under the same name and the deck picks it up with no code change.

## `_refs/`

Raw material, not served to anyone: the originals the crops above came from,
plus older Instagram grabs kept for reference.
