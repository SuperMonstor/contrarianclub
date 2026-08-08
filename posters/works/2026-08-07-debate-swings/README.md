# Debate swing results

Nine 16:9 slides for YouTube: how three debates moved the room.

Three slides per debate, in running order.

1. **Before**, where the room stood when it walked in
2. **After**, where it stood when it left
3. **The swing**, who changed their mind and which way

| Debate | Before | After | Swing |
| --- | --- | --- | --- |
| National Pride | 55% said pride is a barrier | 36% still did | 11 moved against, 4 toward, 7 held |
| Choice Feminism | 60% said it isn't real feminism | 77% ended there | 13 hardened, 7 softened, 10 held |
| Billionaires | 67% wanted the state to step in | 44% still did | 6 changed, every one the same way |

## Where the numbers come from

Straight from the live poll in Supabase (`activities`, `poll_options`, `votes`),
using the same matching the app itself uses: a voter counts toward the swing
only when the same device voted in both rounds.

National Pride and Choice Feminism ran on the seven point scale, so their
before and after slides plot the full `-3 .. +3` distribution rather than
collapsing it to two sides. The degree is the interesting part.

Billionaires ran as a plain multiple choice, so it has three categories and no
degree axis. Its before and after use every voter in that round (27, then 36),
while its swing uses only the 21 who voted in both, because movement cannot be
measured for someone who was there once. Each slide's caption says which.

## Re-exporting

```
cd posters
node works/2026-08-07-debate-swings/render.cjs
```

Edit `swing.html` to change copy or data. The `DEBATES` array near the top of
its script holds every number and every headline. Fonts (Playfair Display,
Inter) and the wordmark are inlined as data URIs, so the file renders
identically anywhere with no network access.

## Not a studio work

This one is a standalone HTML page, not a `spec.tsx` rendered by the Vite
studio in `posters/src/`. It is filed here because this is where the club's
published images live, but the studio does not know about it and will not list
it. Anything that needs the shared templates should be built as a normal work
instead.
