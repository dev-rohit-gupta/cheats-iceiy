# Cheats App Plan

## Product Vision
Build a cheats dashboard where admins can store, organize, and publish useful learning material. Users land on a public root page that shows all cheats in a clean, searchable layout. Each cheat contains the drive link, title, branch, subject, notes about how to use it, and an access level that controls who can use it.

The app should feel fast, simple, and structured like a knowledge hub rather than a plain file list.

## Feature Plan
### Core Goals
- Let admins add and manage cheat material quickly.
- Let users browse public cheats from the root page without logging in.
- Let users unlock protected and private cheats with share codes instead of signup or login.
- Require OTP only for admin access.
- Support filtering and search so content is easy to find.
- Keep the data model flexible for future growth.
- Use Drizzle for database access and shadcn/ui for the interface.

### Auth Plan
- Admin sign in with email + OTP.
- Normal users sign up and sign in with Google.
- Normal users can set a password after account creation and later use either Google or password login.
- Use hashed passwords and account linking so Google and password methods map to the same user.
- Use NextAuth for normal-user Google sign-in and account linking.
- Generate share codes for protected/private cheats.
- Share codes should unlock access without creating an account.
- Keep auth and access state typed and reusable through a dedicated `types/declarations` folder.

### Admin Flow
- Admin enters email and receives OTP.
- Admin verifies OTP to access the dashboard.
- Admin can create, update, delete, and publish cheats after sign-in.
- Admin can generate, revoke, and refresh share codes from the dashboard.
- Admin activity should be tracked for future auditing.

### Share-Code Flow
- User opens a protected or private cheat.
- App prompts for a share code instead of login.
- App verifies the code on the server before exposing content.
- Successful unlock should create a temporary access session for that cheat or collection.
- Codes can be limited by expiry, use count, or cheat scope.
- Codes can be revoked at any time from the admin dashboard.

### Main User Roles
#### Admin
- Creates, edits, deletes, and organizes cheat entries.
- Uploads or pastes a Google Drive link.
- Writes notes for how to use the material.
- Marks content as public, protected, private, draft, published, or archived.

#### Share-Code User
- Uses a share code to access protected or private cheats without login.
- Can save favorites and revisit content later if the feature is enabled.

#### Normal User
- Signs up with Google and optionally sets a password after the first account is created.
- Can log in with Google or password after the password is set.
- Uses the public app and unlocks shared content through share codes when needed.

#### Visitor / User
- Views public cheats on the root page.
- Searches by title, subject, or branch.
- Opens details and follows the Drive link.
- Reads usage notes before accessing the material.

### Suggested Extra Features
- Favorites or bookmarks for frequently used cheats.
- Recently viewed cheats.
- Tags for exams, projects, notes, or revision.
- Share link or copy link action.
- Search suggestions and empty-state guidance.
- Admin activity log for visibility and content changes.
- Optional view tracking for future analytics.
- Import/export support for backup and migration.

### Core Functionality
#### Cheat Management
Each cheat record should store:
- Title
- Drive link
- Branch
- Subject
- Notes
- Access level
- Status
- Optional tags
- Created at / updated at timestamps

#### Access Levels
The app should support these visibility modes:
- Public: visible and usable without login or signup.
- Protected: visible only with a valid share code, but the content can be used by the person who has it.
- Private: hidden from public browsing and only accessible with a valid share code or admin override.

#### Access Rules
- Public cheats appear on the root page and in browse results.
- Protected cheats require a valid share code before the drive link or content actions are available.
- Private cheats require a valid share code and can optionally be time-limited or single-use.
- Admins can override access for maintenance and moderation.

#### Public Root Page
The root page should show:
- Featured cheats or recent cheats at the top
- Search bar
- Filters for branch and subject
- Cheat cards with title, subject, branch, access badge, and short notes preview
- Empty state when no cheats are available
- Only public cheats should be listed for anonymous visitors

#### Cheat Detail View
Each cheat should have a detail screen with:
- Full title
- Drive link button or share-code unlock prompt depending on visibility
- Branch and subject metadata
- Full notes
- Related cheats from the same branch or subject
- Copy link action
- Share-code gate message for protected and private content

#### Admin Dashboard
The dashboard should allow:
- Create new cheat entries
- Edit existing entries
- Delete entries with confirmation
- Toggle visibility between public, protected, and private
- Toggle lifecycle state between draft, published, and archived
- View cheat stats such as total items and recent updates
- Manage access rules for protected/private cheats
- Generate, revoke, and audit share codes

## Tech Plan
### Frontend
- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui components

### Backend / Data
- Drizzle ORM
- PostgreSQL later, since it fits auth and relational access control well
- Server actions or route handlers for CRUD operations
- NextAuth for normal-user Google login and auth session handling
- Credentials/password provider for normal user password login
- Email + OTP auth flow for admin login
- Share-code verification flow for user access
- Password hashing with a secure library such as Argon2 or bcrypt

### Drizzle Schema Plan
- cheats
- cheat_access_grants or share_codes
- share_code_uses for unlock tracking
- admin_sessions or auth tables required by NextAuth
- audit_logs for access and content changes
- favorites for future user personalization
- views for future analytics

### Validation / Safety
- Form validation for all cheat fields
- Input sanitization for link and text fields
- Confirmation dialog for destructive actions
- Permission checks for public, protected, and private cheats
- Route guarding and middleware checks for admin pages
- Shared auth/session typing through `types/declarations`

## Production Readiness
### Security
- Add rate limiting for login, OTP, and share-code verification.
- Store secrets in environment variables and validate them at startup.
- Hash passwords with Argon2 or bcrypt.
- Add CSRF protection where required and keep server-side permission checks authoritative.
- Audit role changes, share-code use, and admin actions.

### Reliability
- Add proper database migrations and seeding.
- Set up backups and restore testing for PostgreSQL.
- Add structured logging and error tracking.
- Add monitoring for auth failures, slow queries, and server errors.

### Product/UX
- Add loading, empty, and error states for all major screens.
- Add responsive behavior for mobile, tablet, and desktop.
- Add a clear account settings screen for password setup, password change, and linked providers.
- Add copy/share feedback, toasts, and confirmation dialogs.

### Operations
- Use a stable deployment target with preview and production environments.
- Add smoke tests for auth, share-code unlock, and cheat CRUD.
- Protect admin routes and admin APIs separately from public routes.
- Keep a rollback plan for database and application releases.

## Proposed Data Model
### cheats table
- id
- title
- driveLink
- branch
- subject
- notes
- accessLevel
- status
- tags
- createdAt
- updatedAt

### auth-related tables or fields
- users
- sessions
- roles
- permissions or access grants for private cheats
- share_codes
- share_code_uses
- audit_logs

### Optional tables for future scaling
- favorites
- cheat_views
- categories or topics if branch and subject become too broad

## Folder Structure Plan
Use a clean App Router structure:

```txt
app/
	layout.tsx
	page.tsx
	cheats/
		page.tsx
		[id]/page.tsx
	dashboard/
		page.tsx
		cheats/
			page.tsx
			new/page.tsx
			[id]/edit/page.tsx
	login/
		page.tsx
	auth/
		verify-otp/page.tsx
		unlock/page.tsx
		error/page.tsx
	api/
		cheats/
			route.ts
			[id]/route.ts

components/
	ui/
	cheats/
	dashboard/
	auth/

lib/
	db/
		schema.ts
		client.ts
	auth/
		middleware.ts
		options.ts
	validations/
	utils/

types/
	declarations/
		auth.d.ts
		user.d.ts
		session.d.ts
		index.d.ts

actions/
	cheats.ts
```

## UI Plan
### Shared Layout
- Top navigation with app name and dashboard link
- Search and filter controls in a sticky or prominent section
- Consistent spacing and card style across pages
- Clean, usable layout with a Google-like feel: neutral surfaces, strong typography, and clear spacing
- Dark mode built with Tailwind color tokens and system-friendly contrast
- Minimal motion only: subtle hover states, small transitions, no heavy animations

### Public UI
- Modern cheat cards
- Subject and branch badges
- Access badges for public, protected, and private content
- Readable notes preview
- Clear CTA to open the Drive link

### Admin UI
- Form page for create/edit
- Table or list for all cheats
- Status indicators
- Confirmation modals for delete actions
- Visibility controls for public, protected, and private states

### Auth UI
- Email input with OTP request button
- OTP verification screen
- Google sign-in button through NextAuth
- Access-denied screen for private content

## Page Breakdown
### `/`
- Public cheat catalog
- Search and filters
- Featured or recent content

### `/cheats`
- Full browse page with more controls

### `/cheats/[id]`
- Cheat detail page

### `/dashboard`
- Admin overview and quick stats

### `/dashboard/cheats`
- Manage all cheats

### `/dashboard/cheats/new`
- Create new cheat form

### `/dashboard/cheats/[id]/edit`
- Edit existing cheat form

### `/login`
- Admin sign-in entry point

### `/account`
- Normal user account settings and linked sign-in methods

### `/account/security`
- Password setup, password change, and provider linking for normal users

### `/auth/verify-otp`
- OTP verification screen for admin login

### `/unlock`
- Share-code entry screen for protected and private cheat access

### `/auth/error`
- Shared auth error and retry page

## Implementation Phases
### Phase 1: Foundation
- Set up Drizzle and database schema
- Install shadcn/ui
- Build layout and global UI shell
- Create base navigation and theme styling

### Phase 2: Core CRUD
- Add cheat creation, editing, and deletion
- Persist data through Drizzle
- Add form validation and error states
- Add access-level controls and visibility rules

### Phase 3: Public Experience
- Build the root catalog page
- Add search and filters
- Add detail page and link actions
- Hide protected and private content from anonymous users

### Phase 4: Admin Experience
- Build dashboard overview
- Add management table and forms
- Add status handling and confirmations
- Add access policy management for private and protected cheats

### Phase 5: Auth and App Safety
- Add admin authentication flow and session handling with email + OTP and Google sign-in
- Add share-code unlock flow for user access to protected/private cheats
- Add middleware to guard admin routes
- Add shared TypeScript declarations and module augmentation under `types/declarations`
- Add role-based access checks in server actions and route handlers

### Phase 6: Enhancements
- Favorites
- Recent activity
- Tags
- Backup export/import
- Optional auth and analytics

## Suggested Rules
- Use server-side data fetching for public pages where possible.
- Keep forms controlled and validated.
- Keep the UI minimal but polished.
- Store only stable cheat metadata in the main table.
- Put richer growth features like favorites and analytics in separate tables.
- Keep access rules in one shared policy layer so public, protected, and private behavior stays consistent.
- Add `types/declarations/` with module augmentation early if auth is introduced, so session and user objects stay typed across the app.
- Prefer middleware for coarse route protection and server-side checks for sensitive data access.

## Notes
- The app should be structured so the public experience works even before auth is added.
- Drive links should always be stored as full URLs.
- Notes should support plain text first, with markdown support later if needed.
- The schema should stay simple initially so the app can ship quickly and expand later.
- Avoid public admin signup entirely; create the first admin by bootstrap or seed, then allow only admin-created admin access.
- If auth is added, create declaration files for session/user augmentation and keep them in a dedicated `types/declarations` folder.

## Implementation Plan (Step-by-Step)
### Step 1: Project Setup and Configuration
1. Enable strict TypeScript in `tsconfig.json`:
   - Set `"strict": true`
   - Set `"noUnusedLocals": true` and `"noUnusedParameters": true`
   - Set `"exactOptionalPropertyTypes": true`
   - Set `"noImplicitAny": true`
2. Install core dependencies:
   - `next` (16.2+), `react`, `react-dom`, `typescript`
   - `tailwindcss@4`, `@tailwindcss/postcss`
   - `@radix-ui/*` and `shadcn-ui` CLI for component scaffolding
3. Set up environment variables:
   - `DATABASE_URL` for PostgreSQL
   - `NEXTAUTH_SECRET` and `NEXTAUTH_URL`
   - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
   - OTP provider credentials (e.g., Resend or similar)
4. Configure Tailwind for dark mode:
   - Use `darkMode: 'class'` in config
   - Add theme switcher component early in layout

### Step 2: Database Setup and Schema
1. Install dependencies:
   - `drizzle-orm`, `@drizzle-orm/postgres-js`, `postgres`
   - `drizzle-kit` for migrations
2. Create schema file `lib/db/schema.ts` with all tables:
   - `users` (id, email, passwordHash, name, googleId, createdAt, updatedAt)
   - `accounts` (id, userId, provider, providerAccountId, refresh_token)
   - `sessions` (id, sessionToken, userId, expires)
   - `cheats` (id, title, driveLink, branch, subject, notes, accessLevel, status, tags, createdAt, updatedAt, adminId)
   - `share_codes` (id, code, cheatId, expiresAt, usageLimit, usageCount, scope, status, createdAt, createdBy)
   - `share_code_uses` (id, codeId, ipAddress, accessedAt)
   - `audit_logs` (id, adminId, action, resource, details, createdAt)
   - `favorites` (id, userId, cheatId, createdAt)
3. Generate migrations:
   - `npx drizzle-kit generate:pg`
   - Review migrations for accuracy
4. Apply migrations to database
5. Create seed script `lib/db/seed.ts` to bootstrap first admin

### Step 3: Core Utilities and Types
1. Create `types/declarations/index.d.ts`:
   - Export types for `User`, `Session`, `Admin`, `ShareCode`, `Cheat`
2. Create `types/declarations/auth.d.ts`:
   - Declare NextAuth module augmentations
   - Add `User` and `Session` types with correct fields
3. Create `lib/auth/auth.ts`:
   - Initialize NextAuth with Google provider and Credentials provider
   - Handle callback logic for account linking and role checking
4. Create `lib/validations/index.ts`:
   - Add Zod schemas for forms: cheat creation, password setup, share code
5. Create `lib/utils/index.ts`:
   - Add helpers for hashing passwords (bcrypt or Argon2)
   - Add helpers for generating and validating share codes
   - Add helpers for rate limiting

### Step 4: Middleware and Auth Routes
1. Create `lib/auth/middleware.ts`:
   - Middleware to protect `/dashboard/*` routes
   - Middleware to inject session into request headers
2. Create `middleware.ts` in root:
   - Apply auth middleware to admin routes only
3. Create auth route handlers:
   - `app/auth/[...nextauth]/route.ts` for NextAuth
4. Create password setup flow:
   - `app/account/security/page.tsx` for password setup
   - `app/api/auth/password/set` POST handler
   - `app/api/auth/password/change` POST handler
5. Create admin OTP flow:
   - `app/api/auth/otp/request` POST handler (send OTP email)
   - `app/api/auth/otp/verify` POST handler (validate OTP)
   - `app/login/page.tsx` and `app/auth/verify-otp/page.tsx`

### Step 5: Share-Code System
1. Create share-code service `lib/auth/shareCode.ts`:
   - Function to generate random codes
   - Function to validate codes and check expiry/usage
   - Function to update usage count
2. Create API routes:
   - `app/api/share-codes/validate` POST (verify code, return access session)
   - `app/api/share-codes/generate` POST (admin only, create new code)
   - `app/api/share-codes/revoke` POST (admin only, revoke code)
3. Create unlock page:
   - `app/auth/unlock/page.tsx` with form for code entry
   - Client-side logic to set access cookie after successful verification
4. Add access-control service `lib/auth/accessControl.ts`:
   - Function to check if request has valid share code for cheat
   - Function to check if user is admin

### Step 6: Cheat CRUD and API Routes
1. Create cheat service `lib/db/cheats.ts`:
   - Functions: `getPublicCheats()`, `getCheatById()`, `createCheat()`, `updateCheat()`, `deleteCheat()`
   - All functions should filter by access level and verify admin role
2. Create API routes:
   - `app/api/cheats` GET (public, list public cheats)
   - `app/api/cheats` POST (admin only, create cheat)
   - `app/api/cheats/[id]` GET (public with access check)
   - `app/api/cheats/[id]` PATCH (admin only, update)
   - `app/api/cheats/[id]` DELETE (admin only, delete)
3. Create server actions in `actions/cheats.ts`:
   - Action to create cheat (calls API internally)
   - Action to update cheat
   - Action to delete cheat
   - All actions must verify admin role server-side

### Step 7: UI Components and Pages
1. Build layout components:
   - `components/layout/Header.tsx` (with dark mode toggle, nav links)
   - `components/layout/Footer.tsx`
   - Use shadcn Button, Input, Card components
2. Build public pages:
   - `app/page.tsx` (home, featured cheats, search bar)
   - `app/cheats/page.tsx` (browse all public cheats with filters)
   - `app/cheats/[id]/page.tsx` (detail view, share-code prompt for protected/private)
3. Build admin pages:
   - `app/dashboard/page.tsx` (overview, stats)
   - `app/dashboard/cheats/page.tsx` (table of all cheats, manage)
   - `app/dashboard/cheats/new/page.tsx` (create form)
   - `app/dashboard/cheats/[id]/edit/page.tsx` (edit form)
4. Build user account pages:
   - `app/account/page.tsx` (user profile, linked accounts)
   - `app/account/security/page.tsx` (password setup, change, linked providers)
5. Build auth pages:
   - `app/login/page.tsx` (admin OTP login)
   - `app/auth/verify-otp/page.tsx` (OTP verification)
   - `app/auth/unlock/page.tsx` (share code entry)
   - `app/auth/error/page.tsx` (error display)
6. Build cheat components:
   - `components/cheats/CheatCard.tsx` (displays cheat with badges)
   - `components/cheats/CheatTable.tsx` (admin table with actions)
   - `components/cheats/CheatForm.tsx` (reusable form for create/edit)
   - `components/cheats/ShareCodeModal.tsx` (unlock modal)

### Step 8: Testing and Validation
1. Add testing dependencies:
   - `@testing-library/react`, `@testing-library/jest-dom`
   - `jest`, `ts-jest`
   - `playwright` for e2e tests
2. Create unit tests:
   - Test share-code generation and validation
   - Test password hashing and comparison
   - Test access-control checks
3. Create integration tests:
   - Test user signup and Google login flow
   - Test admin OTP login
   - Test share-code unlock
   - Test cheat CRUD with admin role checks
4. Create e2e tests:
   - Test full user journey: public browse → unlock with code → view content
   - Test admin journey: login → create cheat → generate share code
5. Run tests before every commit

### Step 9: Security Hardening
1. Add rate limiting:
   - Install `@upstash/ratelimit` or similar
   - Apply to `/api/auth/otp/*` (max 5 requests per minute per email)
   - Apply to `/api/share-codes/validate` (max 10 requests per minute per IP)
2. Add CSRF protection:
   - Use Next.js built-in CSRF checks for server actions
3. Add logging:
   - Install `winston` or `pino` for structured logging
   - Log all auth events, share-code uses, and admin actions
   - Store audit logs in database
4. Add monitoring:
   - Set up error tracking (Sentry or similar)
   - Monitor database query performance
   - Alert on auth failures and rate-limit hits

### Step 10: Deployment and DevOps
1. Set up PostgreSQL:
   - Use managed service (AWS RDS, Neon, Supabase)
   - Enable automated backups
   - Test restore process
2. Set up environment management:
   - Use `.env.local` for local development
   - Use CI/CD to manage production secrets
   - Validate all required env vars at startup
3. Set up deployment pipeline:
   - Deploy to Vercel or similar with GitHub Actions
   - Run migrations before deployment
   - Keep staging environment for testing
4. Create deployment checklist:
   - Run all tests before deploy
   - Check environment variables
   - Run database migrations
   - Smoke test: verify public page loads, admin login works, share code works
   - Monitor error logs for 30 minutes post-deploy
5. Create rollback plan:
   - Database: keep backups, document restore procedure
   - Application: keep previous deployments available for quick rollback

## Implementation Order and Conflict Avoidance
- **Never skip steps**: Database schema must be done before API routes.
- **Separate concerns**: Auth (Step 4) is independent of CRUD (Step 6), but both depend on schema (Step 2).
- **Test as you go**: Write tests in Step 8, but run them after each step to catch conflicts early.
- **Type safety first**: TypeScript strict mode in Step 1 will catch most conflicts before they reach production.
- **Merge strategy**: Feature branches for each step, merge only after passing all tests.

## Code Standards for Production
- All functions must have explicit return types and parameter types.
- All API responses must validate with Zod schemas before returning.
- All database queries must be type-safe through Drizzle types.
- All admin actions must check role server-side, never client-side.
- All passwords must be hashed; plaintext passwords must never be logged or stored.
- All share codes must use cryptographically secure random generation.
- All error messages must be generic to users; detailed errors only in logs.
- All environment variables must be validated at startup.
