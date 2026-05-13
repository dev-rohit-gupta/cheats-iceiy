# Cheats Dashboard

A full-stack Next.js app to manage and consume learning resources ("cheats") with role-based access, share-code unlocks, and admin operations.

## Highlights

- Public catalog and cheat detail pages
- Admin dashboard for CRUD operations on cheats
- Access levels: public, protected, private
- Share code generation, validation, and revocation
- Admin OTP login flow
- User signup/login with Google and password support
- Drizzle ORM + PostgreSQL schema and seed flow
- Strict TypeScript setup with Next.js App Router

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- NextAuth (Google + credentials-based flows)
- Drizzle ORM + drizzle-kit
- PostgreSQL (Neon-compatible)
- Zod validation
- Nodemailer (OTP emails)

## Project Structure

- App routes: [app](app)
- API routes: [app/api](app/api)
- Database layer: [lib/db](lib/db)
- Auth layer: [lib/auth](lib/auth)
- Validation schemas: [lib/validations](lib/validations)
- Type augmentation: [types/declarations/auth.d.ts](types/declarations/auth.d.ts)
- Proxy route protection: [proxy.ts](proxy.ts)

## Prerequisites

- Node.js 20+ (Node 22 is fine)
- npm
- PostgreSQL database URL
- Google OAuth client credentials
- Gmail account with App Password (for OTP email flow)

## Environment Setup

1. Copy [\.env.local.example](.env.local.example) to your local env file.
2. Fill all required values.

Required variables:

- DATABASE_URL
- NEXTAUTH_URL
- NEXTAUTH_SECRET
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GMAIL_USER
- GMAIL_APP_PASSWORD
- GMAIL_FROM
- ADMIN_EMAIL
- ADMIN_PASSWORD
- ADMIN_NAME

Note:

- This project currently reads from [.env](.env) in scripts and server runtime.
- For local Next.js development, you can also use .env.local. Keep one source of truth to avoid confusion.

## Installation

1. Install dependencies.

	npm install

2. Push schema to database.

	npm run db:push

3. Seed initial data.

	npm run db:seed

4. Start development server.

	npm run dev

Open http://localhost:3000.

## Scripts

- npm run dev: start dev server
- npm run build: production build
- npm run start: run production server
- npm run lint: run eslint
- npm run db:generate: generate Drizzle migrations
- npm run db:migrate: run migration script
- npm run db:push: push schema to DB
- npm run db:seed: seed admin + sample cheat + sample share code

## Authentication and Access Model

### Roles

- Admin: dashboard access, cheat management, share-code management
- User: public usage + account settings
- Visitor: public content access

### Sign-in Paths

- Admin OTP: request OTP, then verify to sign in
- User Google OAuth: sign in via Google provider
- User Credentials: email/password flow for non-admin users

### Cheat Visibility

- public: directly accessible
- protected: requires valid share code to unlock content
- private: restricted, unlock via share code/admin access

## Google OAuth Setup (Critical)

If you see redirect_uri_mismatch, your Google OAuth callback URL does not match what NextAuth is sending.

For local development with NEXTAUTH_URL=http://localhost:3000, set in Google Cloud Console:

- Authorized JavaScript origin:
  - http://localhost:3000
- Authorized redirect URI:
  - http://localhost:3000/api/auth/callback/google

For production, add your domain equivalents.

## OTP Email Setup

- Use a Gmail account and create a Gmail App Password.
- Set GMAIL_USER and GMAIL_APP_PASSWORD.
- Set GMAIL_FROM with a valid sender format.

## Database Seeding Behavior

Seed script file: [lib/db/seed.ts](lib/db/seed.ts)

It creates:

- Admin user from ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME
- One sample cheat
- One sample share code

If seed fails due to duplicate unique values, either clear existing seed data or update admin seed env values.

## Route Overview

### Public pages

- /: landing/catalog
- /cheats: browse
- /cheats/[id]: cheat detail
- /unlock: share-code unlock page

### Auth/account pages

- /login
- /auth/signup
- /auth/verify-otp
- /account
- /account/security

### Admin pages

- /dashboard
- /dashboard/cheats
- /dashboard/cheats/new
- /dashboard/cheats/[id]/edit
- /dashboard/share-codes

### API endpoints

- /api/auth/[...nextauth]
- /api/auth/otp/request
- /api/auth/otp/verify
- /api/auth/password/set
- /api/auth/password/change
- /api/cheats
- /api/cheats/[id]
- /api/admin/cheats
- /api/admin/cheats/[id]
- /api/share-codes/generate
- /api/share-codes/validate
- /api/share-codes/revoke

## Build and Production

1. Build:

	npm run build

2. Start:

	npm run start

3. Ensure production env vars are set in your host.

## Troubleshooting

### Error: redirect_uri_mismatch (Google)

Cause:

- OAuth redirect URI in Google Console does not exactly match NEXTAUTH_URL callback path.

Fix:

- Add exact callback URI shown above.
- Restart dev server after env changes.

### Error: DATABASE_URL environment variable is not set

Cause:

- Missing or unreadable DATABASE_URL in runtime environment.

Fix:

- Set DATABASE_URL in active env file and restart server.

### Seed script loader error with Node 22

Cause:

- Using node -r tsx with ESM loader edge cases.

Fix:

- Use npx tsx for db scripts (already configured in [package.json](package.json)).

## Security Notes

- Never commit real secrets.
- Rotate any leaked secrets immediately:
  - GOOGLE_CLIENT_SECRET
  - NEXTAUTH_SECRET
  - DATABASE_URL credentials
  - GMAIL_APP_PASSWORD
- Keep env files out of version control.

## Current Status

- TypeScript build passes
- App routes and API routes are in place
- Proxy-based route guarding is configured in [proxy.ts](proxy.ts)

## License

Private project.
