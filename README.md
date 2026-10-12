# Cheats ICEIY

Next.js 16 + React 19 + Drizzle/PostgreSQL study resource platform. Includes resource browsing, share codes, admin tools, super-admin account management, and configurable advertisement placements.

## What's new

- **Password sign-in** for users, admins and super admins at `/login`. Admin email OTP was retired; no Gmail SMTP setup is required.
- **Protected super-admin role**. The owner can create individual admin accounts, reset existing admin passwords, promote password-enabled users, revoke admin access, and audit changes at `/dashboard/users`.
- **Ad settings dashboard** (`/dashboard/ads`) with master switch, placements and network controls. Ad scripts **default OFF** until the owner explicitly enables them.
- **Isolated ad frames**: approved ad scripts run in sandboxed iframes without permissions to open popups or navigate the top-level site. Networks may render differently when sandboxed.
- Improved login, account-security page, dashboard counts and searchable/filterable resource directory.

## Getting started

Prerequisites: Node.js 22+, PostgreSQL, npm.

1. Create `.env.local` (never commit it) based on `.env.example`. CLI scripts also read `.env.local`, then `.env`.
2. `npm ci`
3. Initialize the database:
   - **Fresh, empty DB**: `npm run db:migrate`
   - **Existing DB initially managed using `db:push`**: back up the database and use `npm run db:push` after review. **Do not** run `db:migrate` for the first time against a `db:push`-initialized database without baselining its migration history; migration `0000` tries to create existing tables.
   - **Existing DB with Drizzle migration history**: `npm run db:migrate`
4. Bootstrap the owner account: set `ADMIN_EMAIL`, and set `ADMIN_PASSWORD` when creating a new account or initializing an existing account that has no password; then `npm run admin:bootstrap`. If the account already has a password, its hash is preserved. Run against the intended DATABASE_URL. After first setup, remove the bootstrap password from the persistent environment.
5. `npm run dev` (production: `npm run build && npm run start`).
6. Sign in at `/login`, open `/dashboard/users` to create separate admin accounts or initialize passwords for OTP-only legacy admins and `/dashboard/ads` to control advertisements.

For production, configure the same environment variables on Vercel and apply DB changes before deploying this version. **Back up production before schema changes.** Existing login sessions must sign in again after this release.

## Authentication

- `super_admin`: owner; can create/revoke admins and change ad settings.
- `admin`: manages resources and share codes; cannot grant roles or change ad settings.
- `user`: browses permitted resources; may sign in with a password or Google OAuth (if configured).
- Google OAuth is **optional**. Administrators are not permitted to sign in using Google.
- Passwords are bcrypt-hashed. New admin passwords must have at least 12 characters, uppercase and a number. Send initial credentials through a secure private channel; the app does not email passwords.
- Existing passwords can only be changed by providing the current password. New sessions use `auth_version`, so role revocation and password change invalidate prior sessions.
- `app/api/auth/otp/*` returns HTTP 410; the unused old OTP/Nodemailer utilities remain only for backwards-source compatibility and can be removed later.

## Advertisement safety

The previous providers were embedded in multiple pages and could serve disruptive redirects. With the new implementation, all provider scripts are **off by default**. The super admin can enable banners, native or sidebar formats and approve each network separately. Each loaded script is isolated inside a sandboxed iframe (no top navigation or popups).

**No application-side flag can guarantee the behavior of a third-party network.** If a provider serves harmful content, disable that provider entirely. Set `ADS_EMERGENCY_OFF=true` on the server and redeploy to force all ads off regardless of database values.

The settings live in the new `site_settings` database table. `/api/ads/settings` only returns allowlisted booleans, never arbitrary HTML or URLs. Reload already-open resource pages to apply changed settings. Sandboxing may reduce ad fill or click tracking; verify provider terms before enabling it.

## Useful scripts

```sh
npm ci
npm run dev
npm run build
npm run lint
npm run typecheck
npm run db:push
npm run db:migrate
npm run admin:bootstrap
node --experimental-strip-types --test tests/ad-policy.test.mjs
```

## Key routes

- `/`, `/cheats`, `/cheats/[id]`: browse and open resources
- `/login`: password sign-in
- `/auth/signup`: optional Google sign-up
- `/account/security`: set initial password or change existing password
- `/dashboard`: admin metrics and navigation
- `/dashboard/users`: super-admin account management
- `/dashboard/ads`: super-admin advertisement settings

## Operational notes

- **Do not run the demo `db:seed` script on an existing production database.** It creates sample resources and a new owner and can encounter duplicates. Use `admin:bootstrap` instead.
- Set a strong unique `NEXTAUTH_SECRET` and `DATABASE_URL` before deployment. Optional: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`. Gmail SMTP credentials are **not** required.
- The original `info.md` is a historical implementation brief, not the current auth configuration.
- Never push `.env.local`, passwords or private database credentials to GitHub. Any previously disclosed credentials should be rotated.
