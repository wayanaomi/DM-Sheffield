# Design system

## Direction

Per the 9 Oct 2026 client meeting (overriding the PRD's earlier, brighter
"process-safety" theme — see `docs/DECISIONS.md` #2): white background, a
single navy/blue colour family in varied shades, restrained yellow/red brand
accents used sparingly, and dedicated signal colours reserved for the
simulator's process and alarm states. Benchmarked structurally against SLB
NEST Training's minimalist three-colour approach, with an original visual
identity (no copied assets, imagery, or text).

## Tokens (`apps/web/src/app/globals.css`)

Defined as CSS custom properties and re-exposed to Tailwind v4 via
`@theme inline`, so every token is available as a utility class
(`bg-navy`, `text-blue`, `border-border`, etc.) and as a raw CSS variable.

| Token | Value | Use |
|---|---|---|
| `--color-white` | `#ffffff` | Primary background |
| `--color-navy` | `#10233f` | Headings, primary text emphasis |
| `--color-blue` | `#1f5fae` | Links, primary actions, focus rings |
| `--color-blue-100` / `--color-blue-50` | light blues | Section separation, subtle fills |
| `--color-ink` | `#172b45` | Body text |
| `--color-muted` | `#5b6b81` | Secondary text |
| `--color-border` | `#dce4ee` | Thin borders throughout |
| `--color-accent-yellow` / `-red` | brand accents | Badges, warnings — never decorative |
| `--color-signal-normal/caution/alarm/critical/offline` | engineering signal colours | Simulator process/alarm states only |

Typography uses system font stacks (`-apple-system, Segoe UI, Roboto...`) for
body text and a monospace stack (`ui-monospace, SF Mono...`) for engineering
tags, instrument values and technical tables (`.font-tag` utility class) —
deliberately avoiding a network font dependency.

Radii are restrained (`--radius-sm/md/lg` = 4/8/12px) — not every element is
rounded.

## Components (`apps/web/src/components/ui`)

`Button`/`LinkButton` (primary/secondary/ghost/danger variants), `Badge`
(neutral/blue/yellow/red/success tones), `Card`/`CardBody`, `Container`,
`Input`/`Textarea`/`Label`/`FieldError`, `SectionHeading`, `EmptyState`,
`ProgressBar`. All components are plain, dependency-light React components
(no headless-UI library) so visual decisions stay centralised and
deliberate rather than framework-default.

## Accessibility

- Visible focus rings via a global `:focus-visible` outline using the blue
  token.
- `prefers-reduced-motion` is respected globally (animations collapsed to
  near-zero duration).
- Alarm/status indicators pair colour with text/icon cues (e.g. "ACKNOWLEDGED"
  label, not colour alone) per WCAG 2.2 AA non-colour-dependency guidance.
- Form inputs use associated `<Label>` elements; server-side validation
  errors are rendered as explicit `FieldError` text, not colour alone.

## Simulator-specific visual language

The P&ID symbol set (`components/simulator/symbols.tsx`) is a restrained,
original, simplified set "inspired by" ISA-5.1 conventions — see
`docs/DECISIONS.md` #8 for the licensing caveat. Equipment states (pump
on/off/tripped, valve open/closed/stuck) always pair colour with a text
label so meaning never depends on colour alone, satisfying the PRD's
"non-colour cues for alarms and process states" requirement.
