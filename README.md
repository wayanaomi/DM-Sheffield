# DM Sheffield Learning Management System

A professional engineering-training platform for process safety, offshore
safety, piping and instrumentation design, and HAZOP — built around a
genuinely interactive, physics-informed P&ID simulator.

Built from `DM_LMS_Product_Requirements_Document`, the pitch deck, and the
9 Oct 2026 project review minutes. See [`docs/DECISIONS.md`](docs/DECISIONS.md)
for how conflicts between those sources were resolved.

## What's here

- A full public website: catalogue, course detail, about, organisational
  training, contact, legal pages, auth (register/sign-in/verify-email/
  password reset), and public certificate verification.
- A real LMS: course delivery (video/PDF/rich-text/quiz/simulation lessons),
  progress tracking, sequential unlocking, assessments, auto-issued
  certificates, a learner dashboard, and an admin/instructor console
  (course CRUD, publishing workflow, user management, audit log).
- A payments boundary (Paystack) that never fakes a successful payment.
- **The signature feature**: an interactive, deterministic P&ID simulator
  with three starter scenarios, a physics-informed engine package with 17
  passing unit tests, an SVG renderer with pan/zoom, and full attempt
  persistence — see [`docs/SIMULATOR.md`](docs/SIMULATOR.md).

## Quick start

```bash
npm install
npm run build --workspace=@dm-sheffield/simulator
cd apps/web && cp .env.example .env && npx prisma migrate dev
npm run dev
```

Open <http://localhost:3000>. See [`docs/SETUP.md`](docs/SETUP.md) for full
environment variable documentation and the PostgreSQL migration path (this
sandbox had no local Postgres/Docker available, so local dev uses SQLite —
fully documented, not hidden).

## Project structure

```
apps/web/            Next.js 16 application (public site, LMS, admin, API)
packages/simulator/   @dm-sheffield/simulator — framework-independent P&ID engine
docs/                 Product, architecture, design, data model, simulator,
                       security and decisions documentation
```

## Documentation index

- [`docs/PRODUCT_SCOPE.md`](docs/PRODUCT_SCOPE.md) — what's built vs Phase 2/3
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — system design and module boundaries
- [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) — tokens, typography, components
- [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) — entities, relationships, constraints
- [`docs/SIMULATOR.md`](docs/SIMULATOR.md) — physics assumptions, scenario format, test coverage
- [`docs/SECURITY.md`](docs/SECURITY.md) — implemented controls and open risks
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — resolved ambiguities and assumptions
- [`docs/SETUP.md`](docs/SETUP.md) — environment variables and local development

## Status and honest limitations

This is a genuinely working, empty-state-first implementation — **no demo
users, courses, orders, or certificates are seeded into the database.** A
freshly migrated database shows intentional empty states throughout, and an
admin/instructor can create and publish real content through the admin
console.

What is **not** fully built, and why, is documented rather than hidden:

- No live Paystack/SMTP credentials were available — both have explicit
  "unconfigured" states instead of simulated success (`docs/DECISIONS.md`).
- No PostgreSQL/Docker was available in this environment — SQLite is used
  for local dev, with a documented migration path to Postgres.
- No logo/hero asset could be sourced (no network access to the client's
  Instagram, no image-generation tool available) — a placeholder wordmark
  is used and documented as needing replacement.
- Organisations, SSO, and the scenario-authoring tool are Phase 2/3 per the
  PRD's own release plan and are not built out in this pass.
- TOTP MFA enrolment UI is not yet built (schema/dependency are in place).

## Verification performed

- `packages/simulator`: 17 automated unit tests, all passing
  (`npm test --workspace=@dm-sheffield/simulator`).
- Full monorepo build (`npm run build`) passes cleanly, including Next.js's
  TypeScript type-checking pass across the whole app.
- The simulator was manually exercised end-to-end in a live browser session:
  registering an account, signing in, operating a scenario's valves and
  pump, observing physically-driven flow/level changes and automatic
  objective completion, ending the run, saving the attempt, and confirming
  it appears correctly on the learner dashboard.
