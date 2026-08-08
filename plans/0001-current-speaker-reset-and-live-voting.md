# 0001 Fix Current Speaker Reset and Live Voting

## Summary

Add migration 014 to correct the deployed speaker behavior. Rehearsal reset
will keep every screen on Current Speaker. Audience members can join, vote,
and withdraw until the host advances. The threshold becomes a live indicator
rather than a voting cutoff.

## Implementation changes

- Add migration 014 that replaces the deployed speaker functions without
  altering migration 013.
- Add migration 015 after review because migration 014 was already deployed.
  Refresh every open speaker round when the event-wide electorate grows, and
  reconcile open rounds once when the migration is applied.
- Make rehearsal reset retain the Current Speaker activity, return it to
  draft, and set presentation mode to `poll`.
- Make the presenter prioritize Current Speaker over legacy `join` mode.
- Stop using `enrollment_cutoff` to decide current-round eligibility while
  preserving the column for migration compatibility.
- Recalculate the electorate, threshold, request count, and threshold status
  whenever someone joins, requests, or withdraws.
- Keep requests open after crossing the threshold. Close them only when
  paused, the event ends, or the host advances.
- Preserve the existing RPC signatures and remove the `threshold_reached`
  rejection.

## Tests and acceptance criteria

- Reset leaves admin, presenter, and audience on Current Speaker in the ready
  state.
- Joining before, during, or after protected time makes the user eligible for
  the current speaker.
- New requests and withdrawals continue working after the threshold is
  reached.
- The threshold indicator always reflects the current electorate and request
  count.
- Advancing starts a fresh round and rejects stale requests for the previous
  round.
- Reset clears speaker rounds and requests while preserving event enrollment.
- Run `npm test`, `npm run lint`, and `npm run build`, then verify the three
  views locally without triggering external CI.

## Assumptions

- The threshold remains half of eligible voters, rounded up.
- Crossing the threshold advises the host but never advances automatically.
- Pausing temporarily prevents requests without removing eligibility.
- Withdrawals remain available and may turn the live threshold indicator off.
