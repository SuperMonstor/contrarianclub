# ADR 0003: WhatsApp Marketing

## Context

The club collects attendee names, Indian mobile numbers, and notification
preferences in an Excel sheet after each debate. It needs one deduplicated list
for announcing future debates without coupling marketing work to live event
creation, voting, or presentation controls.

## Decision

Add a protected `/admin/whatsapp` section to the existing Next.js application.
It owns separate Supabase tables for subscribers, imports, campaigns, and
deliveries. Imports normalize Indian mobile numbers, apply the newest Yes or No
preference, and keep one subscriber per number. Every campaign snapshots all
active subscribers and sends one approved marketing template through Meta's
WhatsApp Cloud API in resumable batches.

Meta webhooks update delivery status and deactivate subscribers who reply with
an opt-out command. Meta credentials stay in server-only deployment secrets.
The system uses Meta directly, without Twilio or another messaging provider.

## Consequences

Marketing shares the existing deployment and admin authentication but remains
independent of debate records and publishing actions. Repeated imports and
retries cannot duplicate subscribers, and known successful deliveries are
never selected for retry. Indeterminate API outcomes require manual review
because Meta does not provide an application-level exactly-once guarantee.
Sending still depends on Meta account setup, template approval, a dedicated
phone number, changing Meta pricing, and continued compliance with Meta policy.
