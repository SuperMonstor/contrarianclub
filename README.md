# Contrarian Club Live

A Menti-style live audience interaction app for debate events.

Phase 1 is the thinnest complete slice:

- create one event
- join by QR code or event code
- run multiple-choice or debate-scale polls
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

Before creating an event, create a Supabase project and run the migrations:

```text
supabase/migrations/001_phase_one_live_poll.sql
supabase/migrations/002_admin_events.sql
supabase/migrations/003_debate_swing.sql
supabase/migrations/004_harden_vote_integrity.sql
supabase/migrations/005_scale_poll_format.sql
supabase/migrations/006_default_event.sql
supabase/migrations/007_scale_activity_labels.sql
supabase/migrations/008_presenter_swing_stage.sql
supabase/migrations/009_vote_indexes.sql
supabase/migrations/20260703143306_010_secure_vote_path.sql
supabase/migrations/20260703232112_011_speaker_challenge.sql
supabase/migrations/20260718000000_012_persistent_speaker_ballots.sql
supabase/migrations/20260808000000_013_two_topics_and_speaker_electorate.sql
supabase/migrations/20260808010000_014_live_speaker_voting.sql
supabase/migrations/20260808020000_015_refresh_all_live_speaker_rounds.sql
supabase/migrations/20260819000000_016_whatsapp_marketing_tables.sql
supabase/migrations/20260819010000_017_whatsapp_marketing_functions.sql
```

Then fill in `.env.local`:

```bash
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
PUBLIC_HOST=thecontrarian.club
ADMIN_HOST=admin.thecontrarian.club
```

The WhatsApp marketing variables are documented in
[`docs/whatsapp-setup.md`](docs/whatsapp-setup.md). Keep all Meta credentials
server-only.

More setup notes are in `docs/setup.md`.

Create admin users manually in Supabase Auth, then sign in at `/admin/login`.
Keep public self-service signups disabled; every Auth user is treated as an
admin until attendee/user auth is added.

To give an editor access, invite their email in Supabase Auth with
`https://admin.thecontrarian.club/set-password` as the redirect URL. Add that
URL to the Supabase Auth redirect allow list first. The editor chooses a
password from the invitation link, then signs in at `/admin/login`. They can
open `/admin`, choose the
hamburger menu on the debate, and select **Generate assets**. Once every
motion has closed, revealed before and after scale polls, the page downloads
one ZIP with three PNG cards per motion. The cards use only voters who voted
in both rounds of that motion. Reload the page before exporting if votes may
have changed since the displayed read time.

## Routes

- `/` lets audience members enter an event code.
- `/admin` lists events for authenticated admins.
- `/admin/events/new` creates an event.
- `/admin/events/[code]` controls the poll.
- `/admin/events/[code]/assets` previews and exports vote cards for every motion.
- `/admin/set-password` lets invited admins choose a password.
- `/admin/whatsapp` manages the independent WhatsApp subscriber list and campaigns.
- `/admin/whatsapp/import` previews and imports `.xlsx` guest lists.
- `/join/[code]` is the audience mobile view.
- `/present/[code]` is the projector view.
- `/api/whatsapp/webhook` receives signed Meta delivery and opt-out events.

## Commands

```bash
npm run dev
npm run lint
npm test
npm run build
```

## Roadmap

See `roadmap.md` for the full phased plan.
