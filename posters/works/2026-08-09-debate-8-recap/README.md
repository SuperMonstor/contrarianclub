# Debate #8, recapped

Ten slide Instagram carousel: two motions, and what each one did to the room.

## Where the numbers come from

The live poll for event `AS25UE` in Supabase (`activities`, `poll_options`,
`votes`), read with the same matching the app itself uses on the night.

- The **before** and **after** slides count everyone who voted in that round.
- The **swing** slides count only the devices that voted in both rounds, so the
  averages there differ slightly from the two slides before them. Movement
  cannot be measured for someone who was there once. Each slide names its own
  population in the footnote.

| Motion | Before | After | Swing (matched) |
| --- | --- | --- | --- |
| Children | 30 votes, avg -1.5 | 32 votes, avg -0.4 | 26 voters: -1.5 to -0.4. 58% toward Agree, 19% toward Disagree, 23% held |
| Age gap | 26 votes, avg +0.8 | 22 votes, avg +0.4 | 19 voters: +0.7 to +0.1. 16% toward Agree, 42% toward Disagree, 42% held |

Vote counts are deliberately absent from the slides. Movement is given as a
share of the matched voters, which is the only denominator that survives an
audience that grew between rounds.

## Re-exporting

```
cd posters
npm run poster debate-8-recap
```

The distributions and percentages live in `spec.tsx`. If a late vote lands
before the post-debate polls are closed, recompute from Supabase rather than
editing the numbers by hand.
