# Product scope

Source documents: `DM_LMS_Product_Requirements_Document`, pitch deck, and the
9 Oct 2026 meeting minutes. See `docs/DECISIONS.md` for how conflicts between
these documents were resolved.

## Implemented in this pass (MVP / P0, except where noted)

| Area | Status | Notes |
|---|---|---|
| Public site (home, catalogue, course detail, about, organisations, contact, legal) | ✅ | Empty-state-first, no fabricated data |
| Auth (register, email verification token, login, password reset, lockout, MFA field) | ✅ core | Google OAuth wired but requires `GOOGLE_CLIENT_ID/SECRET`; TOTP MFA enforcement UI not built, schema ready |
| RBAC (learner/instructor/org_manager/admin/support) | ✅ | Server-enforced via `requireRole`, never UI-only |
| Course delivery (Course → Module → Lesson, 5 lesson types, progress, sequential unlock) | ✅ | |
| Assessments (quiz types, auto-grading, attempts) | ✅ core | Formative only — see Decision #1 |
| Certificates (auto-issue, public verification, QR) | ✅ | |
| Learner dashboard | ✅ | Real data only, zero fabricated stats |
| Instructor/Admin console (course CRUD, publish states, users, audit log, contact messages) | ✅ core | Drag-and-drop authoring, content moderation/rollback are P1/P2 |
| Payments (Paystack boundary, webhook, orders) | ✅ boundary | No live credentials in this environment — see Decision #5 |
| P&ID Simulator (engine, 3 starter scenarios, SVG renderer, workspace, attempt persistence) | ✅ | The signature feature — see `docs/SIMULATOR.md` |
| Organisations (seats, assignments, manager reports) | 🚧 P1 | Data model present (`Organisation`, `Membership`); UI explains it is upcoming |
| Scenario authoring tool, HAZOP guide-word mode | 🚧 P1 | Scenarios are authored as JSON files in `packages/simulator/src/scenarios` |
| SSO (SAML/OIDC), SCORM/xAPI | 🚧 P2 | Not started |
| Video transcoding / S3 storage | 🚧 boundary | `Asset` model ready; lessons show an honest "not uploaded" state without it |

## Non-goals (per PRD section 1.3, unchanged)

- OPITO-accredited certification.
- Live classroom/video conferencing.
- Native mobile apps.
- Rigorous process simulation (CFD/thermodynamics) — the simulator is an
  explicitly simplified, deterministic educational model.
- Remote proctoring with video surveillance.

## Release priority key

P0 = MVP must-have (this pass), P1 = Phase 2, P2 = Phase 3, per the PRD's own
reading guide.
