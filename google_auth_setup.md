# Ticket: Enable Google Sign-In via Supabase (Staging + Production)

## Summary
Enable Google OAuth sign-in for CineCause users through Supabase Auth in both staging and production.

## Goal
Users can click "Continue with Google" on `/auth/sign-in`, complete OAuth with Google, and return authenticated to the app.

## Why
Google login is part of the planned auth migration and reduces sign-in friction compared to email/password-only auth.

## Scope
- In scope:
  - Supabase Auth provider setup (Google + Email/Password) in staging and production projects.
  - Google Cloud OAuth setup (consent screen + web OAuth clients).
  - Correct redirect/origin configuration for local, staging, and production app URLs.
  - Environment variable verification in local and Vercel.
  - End-to-end smoke test.
- Out of scope:
  - UI redesign of auth pages.
  - Advanced Google scopes beyond basic profile/email.

## Prerequisites
- Access to Supabase staging and production projects.
- Access to Google Cloud project (or permission to create one).
- App URLs available:
  - Local: `http://localhost:3000`
  - Staging app URL
  - Production app URL
- Project refs available for both Supabase projects.
- Existing env vars in place for Supabase client usage:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `SUPABASE_SECRET_KEY`

## Current App Behavior (Reference)
- Google OAuth starts from `/auth/sign-in` via `supabase.auth.signInWithOAuth({ provider: 'google' })`.
- The app passes `redirectTo: <origin>/auth/callback`.
- App callback handler is at `/auth/callback` and exchanges the code for a session.

Relevant files:
- `src/app/auth/sign-in/page.tsx`
- `src/app/auth/callback/route.ts`

Supabase docs relevant to this implementation:
- Google social login: [Login with Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
- Redirect allow-list and site URL: [Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
- Email/password provider behavior: [Password-based Auth](https://supabase.com/docs/guides/auth/passwords)
- OAuth call used by the app: [JavaScript `signInWithOAuth`](https://supabase.com/docs/reference/javascript/auth-signinwithoauth)
- SSR auth model used in this repo: [Server-Side Rendering Auth](https://supabase.com/docs/guides/auth/server-side)

## Implementation Plan

### 1. Enable auth providers in Supabase
For both staging and production Supabase projects:
- Go to `Authentication -> Providers`.
- Enable `Email` provider (email/password).
- Enable `Google` provider.

Supabase docs:
- [Password-based Auth](https://supabase.com/docs/guides/auth/passwords)
- [Login with Google](https://supabase.com/docs/guides/auth/social-login/auth-google)

Deliverable:
- Both providers enabled in both Supabase projects.

### 2. Configure Google OAuth consent screen
In Google Cloud Console:
- Open `Google Auth Platform` (or `APIs & Services -> OAuth consent screen`).
- Configure app details (name, support email, developer contact email).
- Select audience/user type as needed for your launch phase.
- Add authorized domain(s) used by staging/production.
- Add test users if app is not yet published externally.

Deliverable:
- OAuth consent screen configured and saved.

### 3. Create OAuth web client(s) in Google Cloud
Recommended approach:
- Create separate Web OAuth clients:
  - `cinecause-staging-web`
  - `cinecause-production-web`

For each client, set:
- Authorized JavaScript origins:
  - `http://localhost:3000`
  - staging app URL
  - production app URL
- Authorized redirect URIs:
  - Supabase callback URL of the corresponding project:
    - `https://<staging-project-ref>.supabase.co/auth/v1/callback`
    - `https://<prod-project-ref>.supabase.co/auth/v1/callback`

Notes:
- These redirect URIs point to Supabase, not directly to your app.
- Google will issue a `Client ID` and `Client Secret`.

Deliverable:
- Client ID and Secret for staging and production stored in password manager.

### 4. Populate Google provider settings in Supabase
For each Supabase project (`Authentication -> Providers -> Google`):
- `Client IDs`: paste project-appropriate Google client ID.
- `Client Secret (for OAuth)`: paste matching Google client secret.
- Keep these OFF unless you have a specific requirement:
  - `Skip nonce checks`
  - `Allow users without an email`
- Save changes.

Supabase docs:
- [Login with Google](https://supabase.com/docs/guides/auth/social-login/auth-google)

Deliverable:
- Google provider saved successfully in both Supabase projects.

### 5. Configure Supabase URL settings for app callback
For each Supabase project:
- Go to `Authentication -> URL Configuration`.
- Ensure `Site URL` is set appropriately for that environment.
- Add redirect allow-list entries:
  - `http://localhost:3000/auth/callback`
  - `https://<staging-domain>/auth/callback`
  - `https://<production-domain>/auth/callback`

Why:
- Supabase receives OAuth callback from Google at `/auth/v1/callback`.
- Supabase then redirects back to app callback `/auth/callback` (used by this codebase).

Supabase docs:
- [Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)

Deliverable:
- URL configuration includes all app callback URLs.

### 6. Verify environment variable mapping
Confirm env vars in each environment:
- Local + Vercel Preview use staging Supabase values.
- Vercel Production uses production Supabase values.

Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`

Database connection reminder:
- Runtime: `DATABASE_URL` = Supabase transaction pooler.
- Admin tasks: `DIRECT_URL` = Supabase direct Postgres.

Deliverable:
- Env vars present and aligned per environment matrix.

### 7. Smoke test end-to-end
Run in local and at least one deployed environment:
1. Open `/auth/sign-in`.
2. Click `Continue with Google`.
3. Complete Google auth.
4. Confirm redirect back to app (home page) with active session.
5. Sign out and repeat to verify stability.

Negative checks:
- No `redirect_uri_mismatch` error from Google.
- No "provider disabled"/"invalid provider configuration" in Supabase.
- No callback URL rejection in Supabase.

Deliverable:
- Successful Google sign-in flow with no OAuth errors.

Reference for app-side OAuth call:
- [JavaScript `signInWithOAuth`](https://supabase.com/docs/reference/javascript/auth-signinwithoauth)

## Acceptance Criteria
- Google sign-in works on local, staging, and production.
- Both Supabase projects have Google provider correctly configured.
- OAuth consent screen is configured and functional.
- Required origins and redirect URIs are registered in Google Cloud.
- Supabase redirect allow-list includes `/auth/callback` URLs.
- Environment mapping follows README and cutover checklist.

## Risks and Mitigations
- Risk: `redirect_uri_mismatch` from Google.
  - Mitigation: copy exact Supabase callback URL per project; no typos/trailing slash issues.
- Risk: OAuth works in one env but not another.
  - Mitigation: separate staging/prod OAuth clients and verify each env mapping.
- Risk: Wrong Supabase keys in Vercel environment.
  - Mitigation: verify Preview vs Production variables before deployment.

## Rollback
If enabling Google auth causes auth failures:
1. Temporarily disable Google provider in Supabase.
2. Keep Email/Password enabled for fallback login.
3. Re-verify URLs/client credentials and re-enable once fixed.

## Execution Checklist
- [ ] Enable Email/Password in staging and production Supabase projects.
- [ ] Enable Google provider in staging and production Supabase projects.
- [ ] Configure Google OAuth consent screen.
- [ ] Create staging + production OAuth web clients in Google Cloud.
- [ ] Add required origins and redirect URIs.
- [ ] Paste client IDs/secrets into Supabase Google provider for each project.
- [ ] Configure Supabase URL allow-list with `/auth/callback` URLs.
- [ ] Verify env vars in local, Vercel Preview, and Vercel Production.
- [ ] Run smoke tests and capture results.
