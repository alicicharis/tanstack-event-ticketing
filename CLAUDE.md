## Project Overview

Event ticketing web application built with TanStack Start (full-stack React meta-framework). Uses file-based routing, server-side rendering, and PostgreSQL for data persistence.

## Tech Stack

TanStack Start, React 19, TypeScript (strict), Prisma 7, Better Auth, Tailwind CSS 4, shadcn/ui, Vite 7, Vitest, ESLint + Prettier

## Project Structure

- `src/routes/` — File-based routes (TanStack Router)
- `src/generated/` — Prisma generated client (do not edit)
- `src/integrations/` — Third-party integration code (e.g. better-auth)
- `prisma/schema.prisma` — Database schema

## Commands

```bash
npm run dev              # Start dev server on port 3000
npm run build            # Production build
npm run test             # Run tests (vitest)
npm run check            # Fix lint + format issues
```

## Code Patterns

### Path Aliases

- Use `#/` or `@/` to import from `src/` (e.g. `import { db } from '#/db'`)

### Naming Conventions

- React components: PascalCase files and exports
- Routes: kebab-case file names following TanStack Router conventions
- Utilities: camelCase

## Reference Docs

Read these when working on the relevant topic:

| Topic                     | File                               |
| ------------------------- | ---------------------------------- |
| Styling and UI components | `.claude/docs/styling.md`          |
| Auth, roles, and balance  | `.claude/references/auth-and-roles.md` |

**IMPORTANT:** If you notice that a reference doc is outdated, missing information, or that a new topic warrants its own reference file, proactively suggest updating or creating the relevant `.claude/docs/` file.

## Error Handling

- Use TanStack Router's built-in `errorComponent` for route-level errors
- Throw `notFound()` from route loaders for missing resources
- Let server functions throw — TanStack Start serializes errors to the client automatically
- Validate user input at API boundaries with Zod; trust internal data

## Logging

- Use `console.error` for unexpected errors on the server
- Never log sensitive data (tokens, passwords, PII)
- Include contextual identifiers (userId, eventId) when logging errors
- Use structured log messages: include what happened, which entity, and the outcome (e.g. `"Created ticket for eventId=123, userId=456"`)
- Log at entry/exit of critical server functions to make request flows easy to follow during debugging

## Validation

```bash
npm run check && npm run test
```
