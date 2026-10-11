# P&ID Simulator

The signature feature of DM Sheffield LMS: an interactive, deterministic,
physics-informed process simulator. This document covers the engineering
assumptions, scenario format, and how the engine maps to the UI.

**This is an educational simulator with deliberately simplified physics. It
is not a rigorous process simulator, CFD tool, or industrial digital twin,
and must never be presented or relied on as one.**

## Engine design (`packages/simulator`)

- **Fixed time step**: `scenario.timeStepMs` (default 100ms, per PRD SIM-3).
  The engine never uses wall-clock delta time for physics — `step(1)`
  advances exactly one fixed step, however often it's called. The UI drives
  real-time pacing with `setInterval(tick, timeStepMs)`.
- **Deterministic**: given the same scenario, seed, and ordered action log,
  `replay()` reproduces an identical final state and score (verified by the
  "deterministic replay" test). A seeded PRNG (`mulberry32`) is included for
  any future randomised event timing, though the 3 bundled scenarios use
  scripted (non-random) events.
- **No executable code in scenario files**: objectives, alarms and trip
  conditions are structured JSON (`{tag, property, op, value|min/max}`)
  evaluated by a small, fixed set of comparison operators in the engine —
  never `eval`-ed strings. This keeps scenario authoring safe even for
  future user-authored content (SIM-11).

### Flow model

A connection's flow uses a simplified orifice-style relation:

```
Q = position · Cv · sign(ΔP) · sqrt(|ΔP|)      (forward flow only)
```

A stopped or tripped pump is modelled as blocking forward flow entirely (a
standard check-valve simplification for a non-running centrifugal pump).

**Pumps in series** (a suction connection and a discharge connection sharing
one physical pump) are solved as a single flow shared across both legs,
using the two valves' conductances combined as resistances in series:

```
ΔP_total = (Q / C_suction)² + (Q / C_discharge)²
Q = sqrt(ΔP_total / (1/C_suction² + 1/C_discharge²))
```

This avoids a naive independent-per-connection calculation, which would
otherwise double-count the pump's pressure boost and produce zero flow at
the suction side (a bug caught and fixed by the engine's own test suite
during development — see the "decreases the upstream vessel level" test).

A general iterative network solver for arbitrary branching topologies is
explicitly out of scope; the engine assumes a simple directed chain, true
for all three starter scenarios and most introductory line-ups.

### Vessel level dynamics

```
dLevelFraction/dt = netVolumetricFlow / capacity
```

Derivation: vessel height = capacity / crossSectionArea. Liquid height =
levelFraction × vesselHeight. Differentiating and substituting shows the
cross-sectional-area term cancels, leaving level-fraction dynamics in terms
of capacity alone. `crossSectionArea` is retained in the schema for a
future absolute-height readout but does not affect the level-fraction
calculation in this version.

### Pressure model

- Vessel: `pressure = basePressureBar + levelPressureGainBar × level`
  (a simplified static-head relationship).
- Pump: `dischargePressure = suctionPressure + headBar` when running (a flat
  shutoff-head simplification — no real pump curve vs flow rate).
- `"ENV"` endpoints use a fixed per-connection `envPressureBar` (e.g. a
  supply header or atmosphere).

### Controllers

Simplified PI control: `output = kp·error + (kp/ti)·∫error·dt`, clamped to
`[0, 1]` with integral anti-windup. No derivative term, no bumpless
auto/manual transfer — documented simplifications, not industrial-grade
controller fidelity (per PRD section 5.2 guidance).

## Scenario file format (v1)

Validated with Zod (`packages/simulator/src/schema.ts`). Top-level fields:
`schemaVersion`, `id`, `title`, `seed`, `timeStepMs`, `timeLimitSeconds`,
`equipment[]`, `connections[]`, `instruments[]`, `controllers[]`,
`alarms[]`, `events[]`, `tasks[]` (objectives), `passMark`,
`completionFeedback`, `safetyConstraints[]`. `parseScenario()` returns
`{valid: false, errors: [...]}` for malformed input rather than throwing or
silently coercing — exercised by the "invalid scenario rejection" tests.

## The three starter scenarios (SIM-10)

| Scenario | File | Objective |
|---|---|---|
| Pump and vessel fundamentals | `pump-vessel-fundamentals.json` | Line up valves, start the pump, transfer liquid between two vessels |
| Separator level control | `separator-level-control.json` | Recover and hold level within 40–60% after a transmitter fault, without a high-high trip |
| HAZOP deviation: loss of flow | `hazop-loss-of-flow.json` | Investigate a scripted pump trip ("No Flow"), acknowledge the alarm, clear the trip, restore flow |

Each ships with its own instrument set, alarms (where relevant), a scripted
event, and weighted objectives with a 70% pass mark — matching the PRD's own
worked example almost verbatim for scenario 2.

## Engine ↔ UI mapping

| Engine concept | UI component |
|---|---|
| `EngineSnapshot.equipment` | `DiagramCanvas` (vessel/pump/valve symbols), `InspectorPanel` |
| `EngineSnapshot.controllers` | `ControllerBox` symbol, `InspectorPanel` auto/manual + setpoint |
| `EngineSnapshot.connectionFlows` | `FlowLine` colour (blue = flowing, grey dashed = static) |
| `EngineSnapshot.instrumentReadings` + `faultedInstrumentTags` | `InstrumentBubble` |
| `EngineSnapshot.alarms` | `AlarmPanel` (acknowledge/shelve) |
| `EngineSnapshot.tasks` | `ObjectivesPanel`, `RunSummary` |
| `EngineSnapshot.eventLog` / `actionLog` | Event log list; `actionLog` is what gets persisted for replay |

Equipment screen positions are intentionally **not** part of the engine's
domain model (process state) — they live in
`components/simulator/scenario-layouts.ts`, a small per-scenario lookup
table, keeping the renderer and the physics cleanly separated per the PRD's
"separate the process model from the diagram renderer" requirement.

## Persistence and replay (SIM-9)

A full ordered `actionLog` (`{atMs, action}[]`) is persisted with every
`SimulationAttempt`. The engine's exported `replay(scenario, actionLog,
durationMs)` function can reconstruct the exact final state from this log —
useful for instructor review and automated regression tests. A dedicated
instructor-facing replay viewer UI was not built in this pass (tracked as
future work); the data needed for it is already captured.

## Automated test coverage (`packages/simulator/src/__tests__/engine.test.ts`)

17 tests, all passing: valve open/close affecting flow, flow stopping when a
path is closed, pump on/off blocking flow, pump trip via scripted event (not
firing early), restart blocked while tripped + `clearTrip` recovery, vessel
level increasing/decreasing with net flow, instrument readings reflecting
process state plus configured drift, controller response to a setpoint
change, alarm activation at a threshold crossing, scenario reset to initial
state, deterministic replay producing an identical score, objective
completion (`atLeastOnce`/`holdWithinWindow`/`neverViolate` modes), and
rejection of malformed/invalid scenario JSON.

Run with `npm test --workspace=@dm-sheffield/simulator`.
