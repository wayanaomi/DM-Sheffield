# Decisions and assumptions

This document records product and technical ambiguities encountered while
building the DM Sheffield LMS, and the decision taken for each. Where the
source documents conflicted, the most recent explicit client decision wins.

## 1. Grading vs certification (PRD vs meeting minutes)

**Conflict:** The PRD (`DM_LMS_Product_Requirements_Document`) describes
automatic assessment grading and weighted simulator scoring as core,
certification-relevant features (ASM-6, SIM-8). The meeting minutes of
9 Oct 2026 state plainly: *"Grading is removed from the workflow;
certification only."*

**Decision:** The meeting minutes are the later, explicit client decision and
take precedence.

- Assessments (quizzes) are still implemented and auto-graded, but the score
  is **formative feedback only**. Attempting an assessment (not passing it)
  satisfies lesson-completion/progress requirements by default.
- Certificates (`checkAndIssueCertificate` in `lib/certificates.ts`) are
  issued based on **lesson completion**, not assessment score.
- `Course.requireAssessmentPass` is a configurable, **off-by-default** flag an
  instructor can enable if a specific course genuinely needs a passed
  assessment before certification — this keeps the rule explicit and
  reviewable rather than silently inventing a policy.
- The simulator computes an internal objective score (SIM-8 is retained as
  useful learner feedback) but it is explicitly labelled "practice score,
  feedback only, not a formal grade" everywhere it is shown, and it is never
  used to gate certification.

## 2. Visual theme (PRD vs meeting minutes)

**Conflict:** The PRD's "Design and UX requirements" section specifies a
brighter "process-safety visual theme: navy, safety orange, signal yellow,
safety green and mandatory blue." The meeting minutes direct the opposite:
tone down colours for an older audience, use one colour family in varied
shades, and follow a white-background/blue-accent benchmark (SLB NEST
Training was cited as the reference).

**Decision:** Followed the meeting minutes. The design system
(`docs/DESIGN_SYSTEM.md`, `app/globals.css`) uses white backgrounds with a
navy/blue family as the primary palette, restrained yellow and red brand
accents used sparingly (eyebrow labels, alarm/critical states), and reserves
full "safety colour" semantics for the simulator's process/alarm states only
— never for decorative UI chrome.

## 3. DM Sheffield logo and hero photography

The supplied Instagram profile and reference photographs could not be
fetched or processed in this environment (no network access to Instagram from
the sandbox, and no image-generation tool was available to produce an
AI-enhanced portrait from the two supplied reference photos).

**Decision:**
- A plain text/wordmark placeholder (`components/layout/logo.tsx`) is used
  throughout instead of inventing or approximating an official logo.
- No hero portrait was generated. The homepage hero uses a schematic
  "live process" illustration instead of a photographic hero, so nothing on
  the public site misrepresents client photography as a finished asset.
- **Action required from the client/team:** supply the official logo file
  (SVG/PNG) and an approved hero image, and replace `Logo` and the homepage
  hero section accordingly.

## 4. Database engine (PostgreSQL vs SQLite)

The architecture section of the PRD specifies PostgreSQL as the system of
record. This sandbox has no PostgreSQL server, Docker, or Homebrew available,
so a locally runnable Postgres instance could not be provisioned.

**Decision:** `prisma/schema.prisma` uses the **SQLite** connector for local
development in this environment so the application is genuinely runnable and
testable end-to-end. See `docs/SETUP.md` for the exact changes needed to
switch to PostgreSQL for staging/production (datasource provider, UUID
defaults, and re-enabling Prisma's native `enum` type, which SQLite does not
support — string-typed fields validated through `lib/enums.ts` work
identically on both engines in the meantime).

## 5. Payments (Paystack/Flutterwave)

No live gateway credentials are available in this environment. Per the
instruction to never simulate a successful production payment, the checkout
flow (`/checkout/[slug]`) detects whether `PAYSTACK_SECRET_KEY` is configured
and, if not, shows an explicit "payments are not configured" notice rather
than faking a successful purchase. The webhook route
(`/api/webhooks/paystack`) implements full HMAC-SHA512 signature
verification and idempotent processing (unique `Payment.gatewayEventId`) so
it is ready to go live the moment real credentials are supplied.

## 6. Email delivery

No SMTP provider is configured. `lib/email.ts` logs outgoing transactional
email (verification links, password resets, lockout notices) to the server
console in development rather than silently dropping them or pretending to
send them. Wiring a real provider only requires implementing the `send`
branch in that one file.

## 7. Video/PDF asset pipeline

Full video transcoding (FFmpeg → HLS renditions) and S3-compatible object
storage are out of scope for this environment (no cloud credentials, no
FFmpeg binary assumed present). The data model (`Asset`) and lesson player
are built to support them, but lessons without an attached asset show an
honest "not yet uploaded" empty state rather than a broken player or
placeholder stock content.

## 8. P&ID symbol set and licensing

The simulator's SVG symbols (`components/simulator/symbols.tsx`) are an
original, simplified set "inspired by" ISA-5.1 conventions (circles for
instruments, bowtie shapes for valves, etc.) — they are not a licensed or
verbatim reproduction of the ISA-5.1 standard symbol library, and this should
not be presented as a fully compliant ISA-5.1 implementation without a
licensing review.

## 9. Organisations, SSO, coupons, scenario authoring tool (Phase 2/3 items)

Per the PRD's own release plan, these are explicitly Phase 2/3. They are
documented in `docs/PRODUCT_SCOPE.md` with their data-model placeholders
(`Organisation`, `Membership` tables exist) but are not fully built out in
this MVP pass; the `/organisations` public page explains this honestly
instead of presenting unfinished functionality as complete.
