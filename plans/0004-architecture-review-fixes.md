# 0004 Architecture Review Fixes

**Goal:** Fix the confirmed defects from the production readiness review that need no product decision. Each fix ships as its own commit with a test.

**Source:** Architecture and production readiness review, October 2026. Findings are numbered as in that review.

## In scope

1. **Private RPCs callable by `anon` (finding 1).** New migration revokes `execute` from `public, anon, authenticated` on every admin, WhatsApp and internal helper function, then grants `service_role` where the app calls it. Audience RPCs keep their existing grants.
2. **Campaign creation fails (finding 3).** New migration replaces `create_whatsapp_campaign` without the `on conflict (campaign_id, ...)` clause, which collides with the `campaign_id` output column. A brand new campaign cannot conflict.
3. **Queued sends ignore a later STOP (finding 4).** Add a `skipped` delivery status. `claim_whatsapp_deliveries` first marks pending deliveries whose subscriber is inactive as `skipped`, then claims only deliveries whose subscriber is still active. The snapshot stays as audience history; current consent decides whether to send.
4. **Interrupted sends reported complete (finding 9).** Each batch reports the campaign queue state (pending, in flight, awaiting review). The runner shows "complete" only when nothing is pending, in flight or awaiting review, and refreshes the server-rendered counters when it stops.
5. **Speaker requests stuck after joining before round 1 (finding 6).** `ChallengeVote` recovers participation whenever the speaker lifecycle changes (status or `voting_opens_at`), not only when the round number changes. This covers start, reset, pause and resume.
6. **Imports without a time column cannot reach the date input (finding 8).** Preview returns an incomplete result with the detected mapping and `sourceDateRequired` instead of throwing. Confirmation still enforces the date.

## Out of scope (need a decision first)

- Finding 2: poll edits after votes exist.
- Finding 5: precedence between replayed STOP events and later imports.
- Finding 7: recovering "already voted" after a poll reset.

## Verification

- Unit and component tests for each fix (`npm test`).
- Apply all migrations to a disposable local PostgreSQL with Supabase roles and legacy default grants, then confirm: `anon` cannot execute private functions, campaign creation succeeds, and inactive subscribers are skipped.
- `npm run build`.

## Release steps (manual)

- Check production grants with a read-only query before and after applying the migrations.
- Apply the new migrations to production with `supabase db push` or the SQL editor.
