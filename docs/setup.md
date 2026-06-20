# Phase 1 Setup

## Supabase

1. Create a Supabase project.
2. Open the SQL editor.
3. Run `supabase/migrations/001_phase_one_live_poll.sql`.
4. Copy these values into `.env.local`:
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY`
5. Also set the browser-safe aliases:
   - `NEXT_PUBLIC_SUPABASE_URL` to the same value as `SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the same value as `SUPABASE_PUBLISHABLE_KEY`
6. Keep `SUPABASE_SECRET_KEY` server-only. Do not expose it in browser code.

Phase 1 intentionally uses public audience access for joining and voting. Host controls use the service role key through server code. Later phases should add host auth and stricter row-level security.

## Local Development

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`, create an event, open the host link, and use the presenter and join links from the host dashboard.

## Vercel

1. Create a Vercel project from this repository.
2. Add the same environment variables from `.env.example`.
3. Set `NEXT_PUBLIC_SITE_URL` to the deployed production URL.
4. Deploy.

Preview deployments can use the same Supabase project during Phase 1. Before a real event, freeze changes and use the production deployment only.
