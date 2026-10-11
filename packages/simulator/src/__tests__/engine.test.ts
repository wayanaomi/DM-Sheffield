import { describe, expect, it } from "vitest";
import { SimulationEngine, replay } from "../engine.js";
import { parseScenario, ScenarioDefinition } from "../schema.js";
import { starterScenarios } from "../index.js";

function baseScenario(overrides: Partial<ScenarioDefinition> = {}): ScenarioDefinition {
  const scenario = {
    schemaVersion: "1.0" as const,
    id: "test-scenario",
    title: "Test scenario",
    description: "",
    category: "fundamentals" as const,
    learningObjectives: [],
    guideWords: [],
    seed: 1,
    timeStepMs: 100,
    equipment: [
      {
        tag: "V-101",
        type: "vessel" as const,
        level: 0.8,
        crossSectionArea: 4,
        capacity: 10,
        basePressureBar: 1.0,
        levelPressureGainBar: 0.4,
      },
      { tag: "P-101", type: "pump" as const, state: "off" as const, headBar: 2.5 },
      { tag: "MV-101", type: "manual_valve" as const, position: 1, cv: 25, stuck: false },
      { tag: "MV-102", type: "manual_valve" as const, position: 1, cv: 25, stuck: false },
      {
        tag: "V-102",
        type: "vessel" as const,
        level: 0.1,
        crossSectionArea: 4,
        capacity: 10,
        basePressureBar: 1.0,
        levelPressureGainBar: 0.4,
      },
    ],
    connections: [
      { id: "LINE-1", from: "V-101", to: "P-101", valve: "MV-101", envPressureBar: 0 },
      { id: "LINE-2", from: "P-101", to: "V-102", valve: "MV-102", envPressureBar: 0 },
    ],
    instruments: [
      { tag: "LT-101", type: "level_transmitter" as const, measures: "V-101.level", drift: 0 },
      { tag: "LT-102", type: "level_transmitter" as const, measures: "V-102.level", drift: 0 },
      { tag: "FT-101", type: "flow_transmitter" as const, measures: "LINE-2.flow", drift: 0 },
    ],
    controllers: [],
    alarms: [],
    events: [],
    tasks: [
      {
        id: "t1",
        text: "Establish flow",
        weight: 100,
        mode: "atLeastOnce" as const,
        check: { tag: "FT-101", property: "pv" as const, op: "gt" as const, value: 0.5 },
        within: 60,
      },
    ],
    passMark: 70,
    completionFeedback: { onPass: "ok", onFail: "fail" },
    safetyConstraints: [],
  };
  return { ...scenario, ...overrides } as ScenarioDefinition;
}

describe("SimulationEngine - valves and flow", () => {
  it("has zero flow when the discharge valve is closed", () => {
    const scenario = baseScenario();
    scenario.equipment.find((e) => e.tag === "MV-102" && e.type === "manual_valve")!.position = 0;
    const engine = new SimulationEngine(scenario);
    engine.start();
    engine.applyAction({ type: "setPumpState", tag: "P-101", state: "on" });
    engine.runFor(2000);
    const snap = engine.getSnapshot();
    expect(snap.connectionFlows["LINE-2"]).toBe(0);
  });

  it("establishes flow once valves are open and the pump is running", () => {
    const scenario = baseScenario();
    const engine = new SimulationEngine(scenario);
    engine.start();
    engine.applyAction({ type: "setPumpState", tag: "P-101", state: "on" });
    engine.runFor(2000);
    const snap = engine.getSnapshot();
    expect(snap.connectionFlows["LINE-2"]).toBeGreaterThan(0);
  });

  it("stops flow immediately when a relevant valve is closed mid-run", () => {
    const scenario = baseScenario();
    const engine = new SimulationEngine(scenario);
    engine.start();
    engine.applyAction({ type: "setPumpState", tag: "P-101", state: "on" });
    engine.runFor(1000);
    expect(engine.getSnapshot().connectionFlows["LINE-2"]).toBeGreaterThan(0);
    engine.applyAction({ type: "setValvePosition", tag: "MV-102", position: 0 });
    engine.step(1);
    expect(engine.getSnapshot().connectionFlows["LINE-2"]).toBe(0);
  });
});

describe("SimulationEngine - pump state", () => {
  it("blocks flow entirely while the pump is off (check-valve simplification)", () => {
    const scenario = baseScenario();
    const engine = new SimulationEngine(scenario);
    engine.start();
    engine.runFor(2000);
    expect(engine.getSnapshot().connectionFlows["LINE-2"]).toBe(0);
  });

  it("stops and restarts cleanly via setPumpState", () => {
    const scenario = baseScenario();
    const engine = new SimulationEngine(scenario);
    engine.start();
    engine.applyAction({ type: "setPumpState", tag: "P-101", state: "on" });
    expect((engine.getSnapshot().equipment["P-101"] as { state: string }).state).toBe("on");
    engine.applyAction({ type: "setPumpState", tag: "P-101", state: "off" });
    expect((engine.getSnapshot().equipment["P-101"] as { state: string }).state).toBe("off");
  });
});

describe("SimulationEngine - vessel level dynamics", () => {
  it("increases the downstream vessel level when inflow exceeds outflow", () => {
    const scenario = baseScenario();
    const engine = new SimulationEngine(scenario);
    engine.start();
    const before = (engine.getSnapshot().equipment["V-102"] as { level: number }).level;
    engine.applyAction({ type: "setPumpState", tag: "P-101", state: "on" });
    engine.runFor(5000);
    const after = (engine.getSnapshot().equipment["V-102"] as { level: number }).level;
    expect(after).toBeGreaterThan(before);
  });

  it("decreases the upstream vessel level as it is pumped out", () => {
    const scenario = baseScenario();
    const engine = new SimulationEngine(scenario);
    engine.start();
    const before = (engine.getSnapshot().equipment["V-101"] as { level: number }).level;
    engine.applyAction({ type: "setPumpState", tag: "P-101", state: "on" });
    engine.runFor(5000);
    const after = (engine.getSnapshot().equipment["V-101"] as { level: number }).level;
    expect(after).toBeLessThan(before);
  });
});

describe("SimulationEngine - instruments and controllers", () => {
  it("reflects process state through the instrument reading, including drift", () => {
    const scenario = baseScenario();
    scenario.instruments[0].drift = 0.05;
    const engine = new SimulationEngine(scenario);
    engine.start();
    engine.step(1);
    const snap = engine.getSnapshot();
    const vesselLevel = (snap.equipment["V-101"] as { level: number }).level;
    expect(snap.instrumentReadings["LT-101"]).toBeCloseTo(vesselLevel + 0.05, 5);
  });

  it("moves a control valve in response to a controller setpoint change", () => {
    const scenario = baseScenario({
      equipment: [
        {
          tag: "V-101",
          type: "vessel",
          level: 0.5,
          crossSectionArea: 5,
          capacity: 10,
          basePressureBar: 1.2,
          levelPressureGainBar: 0.3,
        },
        { tag: "MV-100", type: "manual_valve", position: 0.6, cv: 22, stuck: false },
        { tag: "LV-101", type: "control_valve", position: 0.4, cv: 22, mode: "auto", stuck: false },
      ],
      connections: [
        { id: "LINE-IN", from: "ENV", to: "V-101", valve: "MV-100", envPressureBar: 2.5 },
        { id: "LINE-OUT", from: "V-101", to: "ENV", valve: "LV-101", envPressureBar: 0 },
      ],
      instruments: [
        { tag: "LT-101", type: "level_transmitter", measures: "V-101.level", drift: 0 },
      ],
      controllers: [
        { tag: "LIC-101", type: "pid_controller", pv: "LT-101", out: "LV-101", sp: 0.5, mode: "auto", kp: 2.0, ti: 30 },
      ],
      tasks: [
        {
          id: "t1",
          text: "hold",
          weight: 100,
          mode: "holdWithinWindow",
          check: { tag: "LT-101", property: "pv", op: "between", min: 0.4, max: 0.6 },
          holdSeconds: 5,
          within: 120,
        },
      ],
    });
    const engine = new SimulationEngine(scenario);
    engine.start();
    engine.runFor(3000);
    const positionBefore = (engine.getSnapshot().equipment["LV-101"] as { position: number }).position;
    engine.applyAction({ type: "setControllerSetpoint", tag: "LIC-101", sp: 0.8 });
    engine.runFor(3000);
    const positionAfter = (engine.getSnapshot().equipment["LV-101"] as { position: number }).position;
    expect(positionAfter).not.toBeCloseTo(positionBefore, 2);
  });
});

describe("SimulationEngine - alarms, events and trips", () => {
  it("activates a high alarm once the threshold is crossed", () => {
    const scenario = baseScenario({
      alarms: [
        { tag: "LAH-101", source: "LT-101", priority: "high", condition: "high", threshold: 0.7 },
      ],
    });
    const engine = new SimulationEngine(scenario);
    engine.start();
    // V-101 starts at level 0.8, above the 0.7 threshold; alarms are evaluated on step.
    engine.step(1);
    const afterHigh = engine.getSnapshot().alarms.find((a) => a.tag === "LAH-101")!;
    expect(afterHigh.active).toBe(true);

    engine.applyAction({ type: "reset" });
    const scenarioLow = baseScenario({
      alarms: [
        { tag: "LAH-101", source: "LT-101", priority: "high", condition: "high", threshold: 0.95 },
      ],
    });
    const engineLow = new SimulationEngine(scenarioLow);
    engineLow.start();
    engineLow.step(1);
    expect(engineLow.getSnapshot().alarms.find((a) => a.tag === "LAH-101")!.active).toBe(false);
  });

  it("trips the pump via a scripted event at the correct elapsed time, not before", () => {
    const scenario = baseScenario({
      events: [{ id: "ev1", at: 1, type: "pump_trip", target: "P-101" }],
    });
    const engine = new SimulationEngine(scenario);
    engine.start();
    engine.applyAction({ type: "setPumpState", tag: "P-101", state: "on" });
    engine.step(5); // 0.5s elapsed, event should not have fired yet
    expect((engine.getSnapshot().equipment["P-101"] as { state: string }).state).toBe("on");
    engine.runFor(600); // now past t=1s
    expect((engine.getSnapshot().equipment["P-101"] as { state: string }).state).toBe("tripped");
    // cannot restart while tripped
    engine.applyAction({ type: "setPumpState", tag: "P-101", state: "on" });
    expect((engine.getSnapshot().equipment["P-101"] as { state: string }).state).toBe("tripped");
    // clear the trip, then restart succeeds
    engine.applyAction({ type: "clearTrip", tag: "P-101" });
    engine.applyAction({ type: "setPumpState", tag: "P-101", state: "on" });
    expect((engine.getSnapshot().equipment["P-101"] as { state: string }).state).toBe("on");
  });
});

describe("SimulationEngine - reset, determinism and objectives", () => {
  it("returns to the initial state on reset", () => {
    const scenario = baseScenario();
    const engine = new SimulationEngine(scenario);
    engine.start();
    engine.applyAction({ type: "setPumpState", tag: "P-101", state: "on" });
    engine.runFor(3000);
    engine.applyAction({ type: "reset" });
    const snap = engine.getSnapshot();
    expect(snap.elapsedMs).toBe(0);
    expect((snap.equipment["P-101"] as { state: string }).state).toBe("off");
    expect((snap.equipment["V-101"] as { level: number }).level).toBeCloseTo(0.8, 5);
  });

  it("produces identical results when replaying the same action log", () => {
    const scenario = baseScenario();
    const engine = new SimulationEngine(scenario);
    engine.start();
    engine.applyAction({ type: "setPumpState", tag: "P-101", state: "on" });
    engine.runFor(2000);
    engine.applyAction({ type: "setValvePosition", tag: "MV-102", position: 0.5 });
    engine.runFor(3000);
    const original = engine.getSnapshot();

    const replayed = replay(scenario, engine.getActionLog(), original.elapsedMs);
    expect(replayed.elapsedMs).toBe(original.elapsedMs);
    expect((replayed.equipment["V-101"] as { level: number }).level).toBeCloseTo(
      (original.equipment["V-101"] as { level: number }).level,
      9
    );
    expect((replayed.equipment["V-102"] as { level: number }).level).toBeCloseTo(
      (original.equipment["V-102"] as { level: number }).level,
      9
    );
    expect(replayed.score).toBe(original.score);
  });

  it("marks an objective satisfied once its condition is met", () => {
    const scenario = baseScenario();
    const engine = new SimulationEngine(scenario);
    engine.start();
    expect(engine.getSnapshot().tasks[0].satisfied).toBe(false);
    engine.applyAction({ type: "setPumpState", tag: "P-101", state: "on" });
    engine.runFor(3000);
    expect(engine.getSnapshot().tasks[0].satisfied).toBe(true);
    expect(engine.getSnapshot().score).toBe(100);
    expect(engine.getSnapshot().passed).toBe(true);
  });
});

describe("Scenario schema validation", () => {
  it("rejects a malformed scenario instead of loading it", () => {
    const result = parseScenario({ schemaVersion: "1.0", id: "bad" });
    expect(result.valid).toBe(false);
    expect(result.errors && result.errors.length).toBeGreaterThan(0);
  });

  it("rejects a scenario with an invalid equipment type", () => {
    const malformed = baseScenario();
    const result = parseScenario({
      ...malformed,
      equipment: [{ tag: "X-1", type: "not_a_real_type", level: 0.5 }],
    });
    expect(result.valid).toBe(false);
  });

  it("loads and validates the three bundled MVP starter scenarios", () => {
    expect(starterScenarios).toHaveLength(3);
    const ids = starterScenarios.map((s) => s.id).sort();
    expect(ids).toEqual(
      ["hazop-loss-of-flow", "pump-vessel-fundamentals", "separator-level-control"].sort()
    );
    for (const scenario of starterScenarios) {
      const engine = new SimulationEngine(scenario);
      engine.start();
      engine.runFor(1000);
      expect(engine.getSnapshot().elapsedMs).toBeGreaterThan(0);
    }
  });
});
