# Data model

Full source of truth: `apps/web/prisma/schema.prisma`. This document
summarises entities, relationships and key constraints.

## Engine note

This environment has no local PostgreSQL/Docker available, so the Prisma
datasource currently targets **SQLite** for local development (see
`docs/DECISIONS.md` #4 and `docs/SETUP.md` for switching to PostgreSQL for
staging/production). Because SQLite has no native `enum`, fields that would
be Postgres enums in production are plain `String` columns with the allowed
values documented in a `///` comment above the field and validated in the
application layer via Zod enums in `src/lib/enums.ts`. IDs use Prisma's
`cuid()` rather than a Postgres-native UUID for the same cross-engine
portability reason.

## Core entities

| Entity | Purpose | Key constraints |
|---|---|---|
| `User` | Account, role, MFA fields, lockout counters | `email` unique |
| `Organisation` / `Membership` | Phase 2 org accounts | `(userId, organisationId)` unique |
| `Course` / `Module` / `Lesson` | Course → Module → Lesson structure | `slug` unique on Course |
| `Asset` | Video/PDF/image metadata + processing status | — |
| `Enrollment` | Learner ↔ Course, with source & status | `(userId, courseId)` unique |
| `LessonProgress` | Per-lesson completion/position | `(enrollmentId, lessonId)` unique |
| `Assessment` / `Question` / `Attempt` | Quiz definitions and immutable submitted attempts | — |
| `Order` / `OrderItem` / `Payment` | Checkout, line items, verified payment events | `Payment.gatewayEventId` unique (webhook idempotency) |
| `Certificate` | Issued certificate + public verification | `publicId` unique, `enrollmentId` unique (one cert per enrollment) |
| `SimulationScenario` / `SimulationScenarioVersion` | DB-backed pointer to a bundled scenario JSON | `scenarioKey` unique; `(scenarioId, version)` unique |
| `SimulationAttempt` | A learner's run of a scenario, with full action log | — |
| `AuditLog` | Actor/action/entity trail for sensitive operations | — |
| `ContactMessage` | Public contact form submissions | — |
| `PasswordResetToken` / `VerificationToken` | Auth.js + custom password-reset flows | token unique |

## Notable integrity rules enforced

- A user cannot enrol in the same course twice (`Enrollment` unique
  constraint) — the free-enrol and paid-webhook paths both `upsert`/check
  this.
- Certificate issuance is idempotent (`checkAndIssueCertificate` checks for
  an existing certificate before creating one) and a course has at most one
  certificate per enrollment (`Certificate.enrollmentId` unique).
- Payment webhook events are idempotent via the unique
  `Payment.gatewayEventId` constraint — a retried webhook delivery throws on
  the duplicate insert, which is caught and treated as a no-op.
- Attempts (`Attempt`, `SimulationAttempt`) are write-once from the
  application's perspective: created with a result and never mutated
  afterwards, preserving historical integrity.
- Course content changes do not retroactively alter past `Attempt` records
  (questions are not currently versioned in this pass — `Question.version`
  exists as a placeholder for the Phase 2 item-bank versioning requirement).

## Switching to PostgreSQL

See `docs/SETUP.md` → "Moving to PostgreSQL in production" for the exact
schema changes (datasource provider, `@db.Uuid` + `gen_random_uuid()`, and
optionally promoting the string "enum" fields to native Prisma `enum` types).
