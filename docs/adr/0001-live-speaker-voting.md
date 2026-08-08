# ADR 0001: Live Speaker Voting

## Context

Speaker rounds currently freeze the eligible audience when the speaker starts
and close requests when the threshold is reached. Late audience members cannot
request the next speaker even while that speaker remains active.

## Decision

The active speaker round uses the event's live enrolled audience. Joining,
requesting, and withdrawing recalculate the threshold. Reaching the threshold
is an advisory signal to the host, and requests remain open until the host
advances, pauses the round, or ends the event.

## Consequences

Late audience members can participate immediately after protected time. The
threshold indicator can turn on or off as enrollment and requests change. The
existing RPC signatures and round schema remain compatible.
