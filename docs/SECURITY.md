# Security

Target baseline: OWASP ASVS Level 2 / OWASP Top 10 awareness (per PRD
section 8.4). This document records what is implemented and what remains an
open risk to address before a public launch.

## Implemented

- **Password hashing**: bcrypt (`bcryptjs`), never plaintext or reversible
  encryption.
- **Account lockout**: 5 failed logins within a 10-minute window locks the
  account for 10 minutes and sends a notification email
  (`src/auth.ts`), satisfying the PRD's AUTH acceptance criterion.
- **RBAC enforced server-side**, never only in the UI:
  `lib/rbac.ts#requireRole` is called at the top of every admin/instructor
  server component and server action; `canManageCourse` additionally scopes
  instructors to their own authored courses. Middleware
  (`src/middleware.ts`) gates `/dashboard`, `/admin`, `/instructor`,
  `/organisation` at the edge as a defence-in-depth layer, not the only
  check.
- **Input validation**: Zod schemas at every server action and API route
  boundary (registration, contact form, course forms, scenario files,
  simulator attempt submission, webhook payloads).
- **CSRF**: Next.js Server Actions include built-in CSRF protection (origin
  checking) for all mutations in this app; no separate token management was
  needed.
- **Session handling**: Auth.js v5 JWT sessions; credentials provider does
  not expose session tokens to client JS beyond the httpOnly cookie Auth.js
  manages.
- **Payment webhook integrity**: HMAC-SHA512 signature verification against
  the raw request body (`lib/payments/paystack.ts#verifyPaystackSignature`)
  before any event is processed; idempotent via a unique
  `Payment.gatewayEventId` constraint.
- **No secrets in source control**: `.env` is gitignored; `.env.example`
  contains placeholders only.
- **Audit logging**: sensitive mutations (role changes, course publish/
  unpublish, user status changes, certificate issuance, payment
  verification, enrolment creation) write an `AuditLog` row with actor,
  action, entity, and timestamp.
- **Certificate verification minimal disclosure**: the public verification
  page exposes only learner name, course title, and dates — no email,
  internal IDs, or other personal data (PRD CERT-3).
- **Rate limiting (auth)**: implemented at the application layer via the
  account lockout counters described above. A dedicated IP-based rate
  limiter (e.g. at a reverse proxy/CDN) is **not** implemented in this pass
  and is recommended before public launch, particularly for
  `/api/webhooks/paystack` and `/contact`.

## Known gaps / remaining risk (tracked, not silently ignored)

- **MFA (TOTP) for admin/instructor accounts**: `User.mfaEnabled` /
  `mfaSecret` fields and the `otplib` dependency are in place, but the
  enrolment and verification UI is not yet built. Until it is, MFA is not
  actually enforced — do not claim it is.
- **Dedicated rate limiting / bot protection** on auth, search and checkout
  endpoints beyond the account-lockout mechanism above.
- **Dependency vulnerability scanning**: not run as part of this build
  (`npm audit` reports some advisories in transitive dependencies common to
  the Next.js/Prisma toolchain as of this writing — review before
  deployment).
- **Independent penetration test**: not performed; required before public
  launch per the PRD.
- **Data residency / Nigeria Data Protection Act 2023 compliance**: the
  privacy policy page is an explicit placeholder pending legal review (see
  `docs/DECISIONS.md` and the page's own in-app disclaimer).
- **Signed/expiring URLs for protected assets**: the `Asset` model has a
  `storageKey` field but no object-storage integration is wired up yet (see
  `docs/DECISIONS.md` #7), so signed-URL delivery for video/PDF is not yet
  implemented — nothing sensitive is currently served this way because no
  real assets have been uploaded.
- **Server-side re-scoring of high-stakes simulator attempts** (ADR-3): the
  client computes score/pass locally; the engine's `replay()` export
  supports server-side verification from the stored action log, but an
  automated re-verification job is not yet wired in. For a purely formative,
  non-certifying feature this is a low-severity gap today, but should be
  closed before simulator results are ever tied to a formal credential.

## Secrets handling

All configuration is read from environment variables (`.env`, documented in
`.env.example`). No real credentials are present in this repository.
