# Contrarian Club Live

A Menti-style live audience interaction app for debate events.

Phase 1 is the thinnest complete slice:

- create one event
- join by QR code or event code
- run one multiple-choice poll
- submit one vote per audience device
- show a presenter display
- hide or reveal results from the host dashboard
- sync with Supabase Realtime plus a polling fallback

## Stack

- Next.js App Router
- TypeScript
- Supabase Postgres and Realtime
- Vercel hosting
- Tailwind CSS

## Local Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Before creating an event, create a Supabase project and run:

```text
supabase/migrations/001_phase_one_live_poll.sql
```

Then fill in `.env.local`:

```bash
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

More setup notes are in `docs/setup.md`.

## Routes

- `/` creates the first live event.
- `/host/[code]` controls the poll.
- `/join/[code]` is the audience mobile view.
- `/present/[code]` is the projector view.

## Commands

```bash
npm run dev
npm run lint
npm run build
```

## Roadmap

See `roadmap.md` for the full phased plan.
