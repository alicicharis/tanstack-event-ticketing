# Auth and Roles

## Overview

Authentication uses Better Auth with Prisma adapter, email/password flow, and a role-based system (CONSUMER/ORGANIZER). Balance is stored as integer cents to avoid serialization issues.

## Key Decisions

- **Balance stored as integer cents (not Decimal or Float)**
  - **Why**: Prisma's `Decimal` type and `Float` both produce `Decimal.js` objects through `@prisma/adapter-pg`, which cannot be `structuredClone`d. Better Auth internally calls `structuredClone` on user objects in `filterOutputFields`, causing `DataCloneError`.
  - **Alternatives considered**: `Decimal` (broke structuredClone), `Float` (also broke — adapter-pg wraps in Decimal.js), storing as plain `String` (loses numeric operations)
  - **Convention**: 100000 = $1000.00. Divide by 100 for display: `(balance / 100).toFixed(2)`

- **Better Auth additional fields for role and balance**
  - **Why**: Keeps user model extension co-located with auth config; Better Auth handles including these in session/user queries
  - `role`: `type: 'string'`, `input: false` (not settable via signup)
  - `balance`: `type: 'number'`, `input: false`

- **Role upgrade via server function, not Better Auth API**
  - **Why**: Better Auth doesn't have a built-in role mutation endpoint. Using `createServerFn` with `getRequest()` + `auth.api.getSession()` for auth, then direct Prisma update.

## Patterns & Conventions

- **Getting auth session in server functions**: Use `getRequest()` from `@tanstack/react-start/server` (not `getWebRequest` — that doesn't exist in this version)
- **Auth client typing**: Pass `typeof auth` generic to `createAuthClient<typeof auth>()` for typed session with additional fields
- **Auth page redirects**: After sign-up/sign-in, navigate to `/profile`. Profile page redirects to `/sign-in` if no session.

## Gotchas & Pitfalls

- **`structuredClone` + Prisma Decimal**: Any non-primitive type in the User model that Better Auth touches will be run through `structuredClone`. Prisma's Decimal.js objects (used by both `Decimal` and `Float` via `@prisma/adapter-pg`) are class instances with methods and cannot be cloned. Use `Int` for monetary values.
- **`@better-auth/core` wildcard exports + Vite 7**: The `"./utils/*"` export pattern in `@better-auth/core` isn't resolved correctly by Vite 7's dev style collector. Fix: add `ssr: { external: ['better-auth', '@better-auth/core'] }` to `vite.config.ts`.
- **`getWebRequest` vs `getRequest`**: TanStack Start exports `getRequest()`, not `getWebRequest()`. The function is in `@tanstack/react-start/server`.
- **Non-interactive Prisma migrations**: `prisma migrate dev` requires interactive terminal. In non-interactive environments, use `prisma db push` (with `--accept-data-loss` if needed) then create migration separately.

## Key Files

- `src/lib/auth.ts` — Better Auth server config with Prisma adapter, role/balance additional fields
- `src/lib/auth-client.ts` — Typed auth client for React
- `src/routes/sign-up.tsx` — Email/password registration
- `src/routes/sign-in.tsx` — Email/password login
- `src/routes/profile.tsx` — User profile with role display and upgrade-to-organizer action
- `src/integrations/better-auth/header-user.tsx` — Header auth state (sign in/up buttons or user menu)
- `prisma/schema.prisma` — User model with `Role` enum and `balance Int`
