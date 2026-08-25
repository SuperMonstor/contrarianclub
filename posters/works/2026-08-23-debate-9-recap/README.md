# Debate #9, recapped

Eleven slide Instagram carousel: two motions on personal autonomy against
social obligation, and what each one did to the room.

## Where the numbers come from

The live poll for event `8SRKJQ` in Supabase (`activities`, `poll_options`,
`votes`), read with the same matching the app itself uses on the night.

- The **before** and **after** slides count everyone who voted in that round.
- The **swing** and **verdict** slides count only the devices that voted in
  both rounds, so their averages differ slightly from the two slides before
  them. Movement cannot be measured for someone who was there once. Each slide
  names its own population in the footnote.

| Motion | Before | After | Swing (matched) |
| --- | --- | --- | --- |
| Self destruction | 40 votes, avg -0.10 | 32 votes, avg -0.06 | 27 voters: -0.11 to -0.07. 37% toward For, 26% toward Against, 37% held |
| Familial obligation | 29 votes, avg +1.52 | 30 votes, avg +0.53 | 23 voters: +1.30 to +0.52. 22% toward For, 52% toward Against, 26% held |

Two figures on the swing slides are not in that table, and both are counted off
the matched voters for motion one: 17 of the 27 answered differently the second
time (63%), and 10 of them crossed the middle. One went from absolutely sure
Against to absolutely sure For, the full width of the scale.

The room voted on the scale the app ships, Opposition at -3 and Proposition at
+3. The slides say against and for, because a reader who was not in the room
has not been told which team wore which name.

Vote counts are deliberately absent from the swing slides. Movement is given as
a share of the matched voters, which is the only denominator that survives an
audience that changed between rounds.

**The post-debate poll on motion two was still open in Supabase when these
numbers were read.** If a late vote lands, recompute rather than editing the
numbers by hand.

## Re-exporting

```
cd posters
npm run poster debate-9-recap
```

The distributions and percentages live in `spec.tsx`.
