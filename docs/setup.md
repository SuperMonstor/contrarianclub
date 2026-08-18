# Phase 1 Setup

## Supabase

1. Create a Supabase project.
2. Open the SQL editor.
3. Run these migrations in order:
   - `supabase/migrations/001_phase_one_live_poll.sql`
   - `supabase/migrations/002_admin_events.sql`
   - `supabase/migrations/003_debate_swing.sql`
   - `supabase/migrations/004_harden_vote_integrity.sql`
   - `supabase/migrations/005_scale_poll_format.sql`
   - `supabase/migrations/006_default_event.sql`
   - `supabase/migrations/007_scale_activity_labels.sql`
   - `supabase/migrations/008_presenter_swing_stage.sql`
   - `supabase/migrations/009_vote_indexes.sql`
   - `supabase/migrations/20260703143306_010_secure_vote_path.sql`
   - `supabase/migrations/20260703232112_011_speaker_challenge.sql`
   - `supabase/migrations/20260718000000_012_persistent_speaker_ballots.sql`
   - `supabase/migrations/20260808000000_013_two_topics_and_speaker_electorate.sql`
   - `supabase/migrations/20260808010000_014_live_speaker_voting.sql`
   - `supabase/migrations/20260808020000_015_refresh_all_live_speaker_rounds.sql`
   - `supabase/migrations/20260819000000_016_whatsapp_marketing_tables.sql`
   - `supabase/migrations/20260819010000_017_whatsapp_marketing_functions.sql`
4. Copy these values into `.env.local`:
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY`
5. Also set the browser-safe aliases:
   - `NEXT_PUBLIC_SUPABASE_URL` to the same value as `SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the same value as `SUPABASE_PUBLISHABLE_KEY`
6. Keep `SUPABASE_SECRET_KEY` server-only. Do not expose it in browser code.

Phase 1 intentionally uses public audience access for joining and voting. Admin controls require Supabase Auth and then use the service role key through server code. Later phases should add stricter row-level security.

Keep public self-service signups disabled. During this phase, every Supabase Auth user is treated as an admin, so only create Auth users you intend to trust with the host/admin console. Before adding Google login, attendee login, invite-based signup, or any non-admin Auth users, reintroduce an explicit admin allowlist.

## Admin Auth

Create an admin user in Supabase:

1. Open **Authentication**.
2. Open **Users**.
3. Click **Add user**.
4. Use an email and password you control.
5. Keep **Auto Confirm User** enabled if Supabase shows that option.

No app metadata or raw JSON edits are required. Use that email and password at `/admin/login`.

## Local Development

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`, sign in at `/admin`, create an event, and use the presenter and join links from the event dashboard.

## Vercel

1. Create a Vercel project from this repository.
2. Add the same environment variables from `.env.example`.
3. Set `NEXT_PUBLIC_SITE_URL` to the deployed production URL.
4. Set `PUBLIC_HOST` to `thecontrarian.club`.
5. Set `ADMIN_HOST` to `admin.thecontrarian.club`.
6. Deploy.

Preview deployments can use the same Supabase project during Phase 1. Before a real event, freeze changes and use the production deployment only.

## WhatsApp Marketing

The WhatsApp subscriber list and campaign tools are separate from live events.
Complete the Meta Business, dedicated number, template, webhook, and production
token setup in [`docs/whatsapp-setup.md`](whatsapp-setup.md) before attempting a
campaign. The application does not send any message during installation or
deployment.
