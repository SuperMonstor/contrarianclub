# Debate #9, recapped

Twelve slide Instagram carousel: two motions on personal autonomy against
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

## The two facts on the motion slides

Both are checked, and both say the same thing in different registers: on each
of these motions somebody has already decided for you.

- **Motion one.** Alcohol is prohibited in Gujarat, Bihar, Mizoram, Nagaland
  and Lakshadweep. Article 47 of the Constitution (Directive Principles) asks
  states to bring about prohibition of intoxicating drinks, and those five have.
  An earlier cut of this slide led with Article 47 and never said the word
  alcohol, so the reader had to work out for themselves that a self destructive
  choice was under discussion. Name the thing, then the ruling.
- **Motion two.** The India Human Development Survey asked ever-married women
  aged 25 to 49 who chose their husband. 5% said they chose alone, and 37% said
  they chose jointly with their parents. The survey round is 2011-12, so the
  slide names the survey rather than a year, and a later round should be
  checked before this copy is reused.

Three facts that were on these slides and came off, kept here because they are
still true. Attempting suicide was a crime until Section 115 of the Mental
Healthcare Act, 2017 replaced the presumption of guilt with a presumption of
severe stress. Under the Maintenance and Welfare of Parents and Senior Citizens
Act, 2007, children owe their parents maintenance and abandoning a senior
citizen carries up to three months' imprisonment. And a Hindu Undivided Family
is a "person" under Section 2(31) of the Income Tax Act, 1961, with its own PAN
and its own return.

That last one came off because it is a fact about the family as a property and
tax unit, and the motion is about obligation and autonomy. Surprising is not
the same as relevant, and on a motion slide relevant wins.

## Everything on the odds and ends slide

Counted across the whole night rather than inside one round, which is why none
of it appears on a chart.

- 51 people voted at some point. 17 voted in all four rounds, and 2 of those
  finished with the answers they started with.
- 131 votes were cast in total. 9 of them were "too close to call", chosen by
  7 people.
- Motion one's pre-debate poll took ten minutes to fill; 90% of its
  post-debate votes landed within forty seconds of the first.
- The two motions were all but unrelated: the correlation between the opening
  votes of the 25 people who voted in both was 0.06. That is the verdict
  slide's footnote.
- On motion two, 10 matched voters opened at absolutely sure For. 3 stayed
  there and 2 finished on the other side. That is the second swing slide.

## Re-exporting

```
cd posters
npm run poster debate-9-recap
```

The distributions and percentages live in `spec.tsx`.
