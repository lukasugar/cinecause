# CineCause
![CineCause banner](public/images/cinecause-big.png)

CineCause is a movie-and-TV inspired giving platform.

## Motivation

Movies and shows can hit hard. A story can change how you see people, community, or the world, and leave you wanting to do something real after the credits roll.

Most of the time, there is no direct way to "give back" to the creators in that moment. CineCause turns that emotional momentum into action by making it easy to donate to a charity because of the film or show that moved you.

It is built for people who want to convert inspiration into measurable impact.

## How To Use CineCause

1. Browse trending movies and TV shows, or search for a title.
2. Open a title page and click donate.
3. Pick a nonprofit (or use a suggested one) and complete checkout on Every.org.
4. Return to CineCause and see donation impact reflected on the leaderboard.

## Login and Accounts

You do not need an account to use CineCause. Creating an account unlocks additional features and a more personalized experience.

With an account, users can:

1. Sign in with email and password.
2. Create a new account.
3. Confirm their email after signing up.
4. Reset a forgotten password.
5. View donation history.
6. Manage privacy settings.
7. Update account and security settings.

## Technical Details (if you want to contribute)

### Local Setup

1. Copy env template:
```bash
cp .env.example .env.local
```
2. Fill required values in `.env.local`:
- `DATABASE_URL` (Supabase Postgres pooler URL)
- `DIRECT_URL` (Supabase direct Postgres URL for migration/admin tasks)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (safe for public/browser use)
- `SUPABASE_SECRET_KEY` (server-only, never expose to client code)
- `TMDB_API_KEY`
- `EVERY_ORG_API_KEY`
- `EVERY_ORG_SEARCH_API_BASE_URL` (optional, defaults to `https://partners.every.org`)
- `EVERY_ORG_WEBHOOK_TOKEN`
- `NEXT_PUBLIC_SITE_URL`
3. Install dependencies and start:
```bash
npm install
npm run dev
```

### Supabase Auth Setup (Google + Email/Password)

#### Supabase dashboard

1. Create separate projects for staging and production.
2. In each project:
- Enable Email provider (email/password).
- Enable Google provider.

#### Google OAuth configuration

In Google Cloud Console OAuth client:

- Authorized JavaScript origins:
- `http://localhost:3000`
- Your staging app URL
- Your production app URL

- Authorized redirect URIs:
- `https://<staging-project-ref>.supabase.co/auth/v1/callback`
- `https://<prod-project-ref>.supabase.co/auth/v1/callback`

#### Environment mapping

- Local + Vercel Preview should use staging Supabase values.
- Vercel Production should use production Supabase values.
- `SUPABASE_SECRET_KEY` must only be configured as a server-side secret.
  Never expose this key in client bundles or `NEXT_PUBLIC_*` variables.

### Environment Matrix

| Environment | DATABASE_URL | NEXT_PUBLIC_SUPABASE_URL | NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY |
|---|---|---|---|
| Local | Staging Supabase | Staging project URL | Staging publishable key |
| Vercel Preview | Staging Supabase | Staging project URL | Staging publishable key |
| Vercel Production | Production Supabase | Production project URL | Production publishable key |

### Database

Connection guidance:
- Runtime app traffic (Next.js on Vercel/serverless) should use pooler via `DATABASE_URL`.
- Admin tasks (`db:push`, schema migrations, other direct DB admin operations) should use direct Postgres via `DIRECT_URL`.

Push schema:
```bash
npm run db:push
```

Push schema using direct connection for this command only:
```bash
DATABASE_URL="$DIRECT_URL" npm run db:push
```

Inspect DB:
```bash
npm run db:studio
```

Inspect DB using direct connection for this command only:
```bash
DATABASE_URL="$DIRECT_URL" npm run db:studio
```

Neon -> Supabase data migration:
```bash
./scripts/migrate-neon-to-supabase.sh --source "$NEON_DATABASE_URL" --target "$SUPABASE_DATABASE_URL"
```

Dry run:
```bash
./scripts/migrate-neon-to-supabase.sh --source "$NEON_DATABASE_URL" --target "$SUPABASE_DATABASE_URL" --dry-run
```

### Verification Commands

```bash
npm run lint
npm run typecheck
npm run build
npm run test:run
```

### Account Deletion Smoke Test

Run after deploying env vars and database changes:

1. Sign in as a test user and create at least one donation intent and completed donation.
2. Delete the account from `/profile`.
3. Verify `profiles.deleted_at` is set for that user.
4. Verify linked donations are anonymized:
   - `donations.user_id = NULL`
   - `donations.donor_first_name = NULL`
   - `donations.public_testimony = NULL`
5. Verify media aggregate totals are unchanged.
6. Verify deleted user can no longer sign in.

### Rollback

If cutover has a critical issue:

1. Set `DATABASE_URL` back to the previous Neon value.
2. Redeploy the app.
3. Keep Supabase auth env vars unchanged unless auth itself is the issue.
4. Re-run smoke checks (`/leaderboard`, `/profile`, webhook endpoint auth behavior).
