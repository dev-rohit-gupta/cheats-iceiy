# Validation notes for the October 2026 lint/build hotfix

This ZIP fixes the errors reproduced in the supplied Windows `npm run lint`, `npx tsc --noEmit`, and `npm run build` output.

- Removed the unrelated `tsc` package from package.json and package-lock.json; `npm run typecheck` now invokes the `typescript` compiler.
- Validated `NEXTAUTH_SECRET` before calling `getToken` in `proxy.ts`.
- Replaced internal HTML anchors with Next.js `Link`, and implemented a CSRF-safe NextAuth sign-out button.
- Updated user-list loading and theme hydration to avoid synchronous effect state updates.
- Replaced `any` with validated unknown inputs, escaped JSX apostrophe, and removed the reported unused variables.

## Local recheck (Node.js 22+)

```sh
npm ci
npm run lint
npm run typecheck
npm run build
npm audit
```

This environment does not have access to npm registry packages, so a fresh dependency install, complete ESLint run, TypeScript project check, and Next production build could not be performed here. Please run all commands locally and send any subsequent errors before production deployment.

The npm audit warnings are **not** automatically fixed. Inspect `npm audit` output, prioritize production-reachable critical/high advisories, and avoid `npm audit fix --force` without reviewing breaking changes.

Do not deploy until the database-migration and super-admin bootstrap steps in README.md are completed and verified on a staging database.
