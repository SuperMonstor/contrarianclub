# Phase 1 Setup

## Supabase

1. Create a Supabase project.
2. Open the SQL editor.
3. Run these migrations in order:
   - `supabase/migrations/001_phase_one_live_poll.sql`
   - `supabase/migrations/002_admin_events.sql`
   - `supabase/migrations/003_debate_swing.sql`
4. Copy these values into `.env.local`:
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY`
5. Also set the browser-safe aliases:
   - `NEXT_PUBLIC_SUPABASE_URL` to the same value as `SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the same value as `SUPABASE_PUBLISHABLE_KEY`
6. Keep `SUPABASE_SECRET_KEY` server-only. Do not expose it in browser code.

Phase 1 intentionally uses public audience access for joining and voting. Admin controls require Supabase Auth and then use the service role key through server code. Later phases should add stricter row-level security.

## Admin Auth

Create an admin user in Supabase:

1. Open **Authentication**.
2. Open **Users**.
3. Click **Add user**.
4. Use an email and password you control.
5. Keep **Auto Confirm User** enabled if Supabase shows that option.

Use that email and password at `/admin/login`.

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
4. Deploy.

Preview deployments can use the same Supabase project during Phase 1. Before a real event, freeze changes and use the production deployment only.
