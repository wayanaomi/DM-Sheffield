# Setup

## Prerequisites

- Node.js 20+ (tested with Node 24) and npm.
- No external services are required to run the app locally in its current
  configuration (SQLite datasource, console-log email transport, Paystack
  unconfigured by default).

## Install and run

```bash
# from the repository root
npm install

# build the simulator package first (web app imports its compiled dist/)
npm run build --workspace=@dm-sheffield/simulator

cd apps/web
cp .env.example .env     # defaults work out of the box for local dev
npx prisma migrate dev   # creates/updates apps/web/prisma/dev.db (SQLite)
npm run dev               # http://localhost:3000
```

From the repository root you can also run `npm run dev` (equivalent to the
`apps/web` dev script) and `npm run build` (builds the simulator package then
the web app).

## Running tests

```bash
# simulator engine unit tests (17 tests)
npm test --workspace=@dm-sheffield/simulator

# web app build (acts as the type-check + compile gate)
npm run build
```

## Environment variables (`apps/web/.env.example`)

| Variable | Purpose | Required for local dev? |
|---|---|---|
| `DATABASE_URL` | SQLite file path (`file:./dev.db`) locally | Yes (defaulted) |
| `AUTH_SECRET` | Auth.js session signing secret | Yes — generate a real random value before any shared/staging use |
| `NEXTAUTH_URL` | Base URL for Auth.js callbacks | Yes (defaulted) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional Google sign-in | No — leave blank to disable |
| `SMTP_*`, `EMAIL_FROM` | Transactional email | No — console-log transport used when blank |
| `PAYSTACK_*` | Paystack checkout + webhook | No — checkout shows an "unconfigured" notice when blank |
| `S3_*` | Object storage for assets/certificates | No — not yet wired to any upload pipeline |
| `NEXT_PUBLIC_SITE_URL` | Used for certificate QR codes and payment callback URLs | Yes (defaulted to localhost:3000) |

**Never commit a real `.env` file.** `.env` is gitignored; only
`.env.example` (placeholders) is tracked.

## Moving to PostgreSQL in production

This sandbox has no PostgreSQL/Docker/Homebrew available, so local
development uses SQLite (see `docs/DECISIONS.md` #4). To move to the
documented production target:

1. In `apps/web/prisma/schema.prisma`, change:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Set `DATABASE_URL` to a real Postgres connection string.
3. (Optional, recommended) Promote the string "enum-like" fields documented
   with `///` comments (e.g. `User.role`, `Course.status`) to native Prisma
   `enum` types — SQLite doesn't support them, but Postgres does, and native
   enums give you a DB-level constraint in addition to the existing
   application-layer Zod validation in `src/lib/enums.ts`.
4. (Optional) Switch `id` fields from `@default(cuid())` to
   `@default(dbgenerated("gen_random_uuid()")) @db.Uuid` if true UUIDs are
   required.
5. Delete the existing `prisma/migrations` folder (it was generated against
   SQLite) and run `npx prisma migrate dev --name init` fresh against the
   Postgres database.

## Known environment limitations encountered during this build

- No Docker, Homebrew, or local PostgreSQL binary was available — documented
  above.
- No image-generation tool was available to produce the AI-enhanced client
  hero portrait requested in the brief — see `docs/DECISIONS.md` #3.
- No network access to fetch the client's Instagram profile/logo — see
  `docs/DECISIONS.md` #3.
- No live Paystack or SMTP credentials — both have clean, documented
  "unconfigured" fallbacks rather than fake success paths.
