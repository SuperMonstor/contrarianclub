# Choice Feminism vote

Two 16:9 slides: where the room stood on choice feminism before the debate,
and where it stood after.

1. **Before**, 60% said it isn't real feminism
2. **After**, 77% ended up there

Both plot the full seven point scale rather than collapsing it to two sides.
The degree is the interesting part: the room did not just lean further, it
hardened, and the "too close to call" middle emptied out almost completely.

## Where the numbers come from

Straight from the live poll in Supabase (event `AH5X79`, `activities`,
`poll_options`, `votes`), using the same matching the app itself uses.

Both rounds count only the 30 devices that voted before and after. 52 people
voted in the first round and 45 in the second, but they were not the same 52
and 45. Restricting to the overlap means the two slides describe one room
changing its mind instead of two different crowds, which is the only reading
that makes a before and after pair honest.

| | -3 | -2 | -1 | 0 | +1 | +2 | +3 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Before | 8 | 8 | 2 | 5 | 1 | 4 | 2 |
| After | 11 | 9 | 3 | 1 | 2 | 0 | 4 |

Negative is "isn't real feminism", positive is "can be real feminism". The two
big percentages on each slide are the wings only, so the line between them
names the share sitting at 0.

These are the same numbers as the Choice Feminism slides in
`2026-08-07-debate-swings`, which cut this debate together with two others for
YouTube. This work is the standalone pair.

There is a second event in Supabase with the same title (`MYFJDT`, created a
second after `AH5X79`) holding zero votes. It is a duplicate and is ignored.

## Re-exporting

```
cd posters
node works/2026-08-21-choice-feminism-vote/render.cjs
```

Edit `feminism.html` to change copy or data. The `DEBATE` object near the top
of its script holds every number and every headline. Fonts (Playfair Display,
Inter) and the wordmark are inlined as data URIs, so the file renders
identically anywhere with no network access.

## Not a studio work

Like the swing deck, this is a standalone HTML page, not a `spec.tsx` rendered
by the Vite studio in `posters/src/`. It is filed here because this is where
the club's published images live, but the studio does not know about it and
will not list it. Anything that needs the shared templates should be built as
a normal work instead.
