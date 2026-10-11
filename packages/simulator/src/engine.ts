/**
 * Deterministic, fixed-time-step process simulation engine.
 *
 * Educational simplification, not a rigorous process simulator:
 *  - Flow through a valve-regulated connection uses an orifice-style relation
 *    Q = position * cv * sign(dP) * sqrt(|dP|), forward flow only across a
 *    stopped pump (modelled as a check valve, a standard simplification).
 *  - Node pressure: vessels use basePressure + levelGain * level; pumps add
 *    a flat shutoff head when running; "ENV" nodes are fixed boundary
 *    pressures. Topology is resolved in a single pass assuming a simple
 *    directed chain (true for the three starter scenarios) — no iterative
 *    network solver.
 *  - Vessel level: dLevelFraction/dt = netVolumetricFlow / capacity (the
 *    cross-sectional-area term cancels against vessel height = capacity /
 *    area, see docs/SIMULATOR.md for the full derivation).
 *  - Controllers: simplified PI (kp, integral time ti), clamped 0-1 output.
 *
 * All objective/alarm/trip conditions are structured data (see schema.ts),
 * never executable strings — scenario files cannot carry arbitrary code.
 */
import {
  AlarmDef,
  Condition,
  ConnectionSchema,
  ControlValveSchema,
  ControllerSchema,
  Equipment,
  ManualValveSchema,
  PumpSchema,
  ScenarioDefinition,
  ScenarioEvent,
  Task,
  VesselSchema,
} from "./schema.js";
import { z } from "zod";

type Connection = z.infer<typeof ConnectionSchema>;
type Vessel = z.infer<typeof VesselSchema>;
type Pump = z.infer<typeof PumpSchema>;
type ManualValve = z.infer<typeof ManualValveSchema>;
type ControlValve = z.infer<typeof ControlValveSchema>;
type Controller = z.infer<typeof ControllerSchema>;

/** Seeded PRNG (mulberry32) so any future randomised behaviour stays reproducible. */
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type EngineAction =
  | { type: "setValvePosition"; tag: string; position: number }
  | { type: "setValveMode"; tag: string; mode: "auto" | "manual" }
  | { type: "setPumpState"; tag: string; state: "on" | "off" }
  | { type: "setControllerMode"; tag: string; mode: "auto" | "manual" }
  | { type: "setControllerSetpoint"; tag: string; sp: number }
  | { type: "acknowledgeAlarm"; tag: string }
  | { type: "shelveAlarm"; tag: string }
  | { type: "clearTrip"; tag: string }
  | { type: "reset" };

export interface LoggedAction {
  atMs: number;
  action: EngineAction;
}

export interface AlarmState {
  tag: string;
  active: boolean;
  acknowledged: boolean;
  shelved: boolean;
  priority: AlarmDef["priority"];
  label: string;
  activatedAtMs?: number;
}

export interface TaskProgress {
  id: string;
  text: string;
  weight: number;
  satisfied: boolean;
  /** For holdWithinWindow tasks: running count of continuous ms the condition has held. */
  continuousHoldMs: number;
  violated: boolean; // for neverViolate tasks
  failed: boolean; // missed deadline
}

export interface EngineSnapshot {
  elapsedMs: number;
  running: boolean;
  equipment: Record<string, Equipment>;
  controllers: Record<string, { tag: string; pv: string; out: string; sp: number; mode: "auto" | "manual"; kp: number; ti: number }>;
  connectionFlows: Record<string, number>;
  nodePressures: Record<string, number>;
  instrumentReadings: Record<string, number>;
  alarms: AlarmState[];
  tasks: TaskProgress[];
  eventLog: string[];
  actionLog: LoggedAction[];
  faultedInstrumentTags: string[];
  score: number;
  passed: boolean;
  complete: boolean;
}

interface InstrumentFault {
  frozenValue?: number;
  extraDrift?: number;
}

export class SimulationEngine {
  readonly scenario: ScenarioDefinition;
  private readonly initialEquipment: Record<string, Equipment>;
  private equipment: Record<string, Equipment> = {};
  private controllers: Record<string, Controller & { integral: number }> = {};
  private alarmStates: Record<string, AlarmState> = {};
  private taskProgress: Record<string, TaskProgress> = {};
  private instrumentFaults: Record<string, InstrumentFault> = {};
  private firedEvents = new Set<string>();
  private elapsedMs = 0;
  private running = false;
  private eventLog: string[] = [];
  private actionLog: LoggedAction[] = [];
  private rng: () => number;
  private lastFlows: Record<string, number> = {};
  private lastPressures: Record<string, number> = {};
  private lastReadings: Record<string, number> = {};

  constructor(scenario: ScenarioDefinition) {
    this.scenario = scenario;
    this.initialEquipment = {};
    for (const eq of scenario.equipment) {
      this.initialEquipment[eq.tag] = structuredClone(eq);
    }
    this.rng = mulberry32(scenario.seed);
    this.reset();
  }

  reset(): void {
    this.equipment = structuredClone(this.initialEquipment);
    this.controllers = {};
    for (const c of this.scenario.controllers) {
      this.controllers[c.tag] = { ...structuredClone(c), integral: 0 };
    }
    this.alarmStates = {};
    for (const a of this.scenario.alarms) {
      this.alarmStates[a.tag] = {
        tag: a.tag,
        active: false,
        acknowledged: false,
        shelved: false,
        priority: a.priority,
        label: a.label ?? a.tag,
      };
    }
    this.taskProgress = {};
    for (const t of this.scenario.tasks) {
      this.taskProgress[t.id] = {
        id: t.id,
        text: t.text,
        weight: t.weight,
        satisfied: false,
        continuousHoldMs: 0,
        violated: false,
        failed: false,
      };
    }
    this.instrumentFaults = {};
    this.firedEvents = new Set();
    this.elapsedMs = 0;
    this.running = false;
    this.eventLog = [`Scenario "${this.scenario.title}" reset.`];
    this.actionLog = [];
    this.rng = mulberry32(this.scenario.seed);
    this.recomputeProcess();
  }

  start(): void {
    this.running = true;
    this.log("Simulation started.");
  }

  pause(): void {
    this.running = false;
    this.log("Simulation paused.");
  }

  private log(message: string): void {
    this.eventLog.push(`[t=${(this.elapsedMs / 1000).toFixed(1)}s] ${message}`);
  }

  applyAction(action: EngineAction): void {
    this.actionLog.push({ atMs: this.elapsedMs, action });
    switch (action.type) {
      case "setValvePosition": {
        const v = this.equipment[action.tag];
        if (v && (v.type === "manual_valve" || v.type === "control_valve")) {
          if (v.type === "control_valve" && v.mode === "auto") {
            this.log(`${action.tag} is in AUTO mode; manual position change ignored.`);
            break;
          }
          if (v.stuck) {
            this.log(`${action.tag} is mechanically stuck and did not move.`);
            break;
          }
          v.position = Math.max(0, Math.min(1, action.position));
          this.log(`${action.tag} set to ${Math.round(v.position * 100)}% open.`);
        }
        break;
      }
      case "setValveMode": {
        const v = this.equipment[action.tag];
        if (v && v.type === "control_valve") {
          v.mode = action.mode;
          this.log(`${action.tag} mode set to ${action.mode.toUpperCase()}.`);
        }
        break;
      }
      case "setPumpState": {
        const p = this.equipment[action.tag];
        if (p && p.type === "pump") {
          if (p.state === "tripped" && action.state === "on") {
            this.log(`${action.tag} is tripped and cannot be started until the trip is cleared.`);
            break;
          }
          p.state = action.state;
          this.log(`${action.tag} ${action.state === "on" ? "started" : "stopped"}.`);
        }
        break;
      }
      case "setControllerMode": {
        const c = this.controllers[action.tag];
        if (c) {
          c.mode = action.mode;
          this.log(`${action.tag} mode set to ${action.mode.toUpperCase()}.`);
        }
        break;
      }
      case "setControllerSetpoint": {
        const c = this.controllers[action.tag];
        if (c) {
          c.sp = action.sp;
          this.log(`${action.tag} setpoint changed to ${(action.sp * 100).toFixed(0)}%.`);
        }
        break;
      }
      case "acknowledgeAlarm": {
        const a = this.alarmStates[action.tag];
        if (a) {
          a.acknowledged = true;
          this.log(`${action.tag} alarm acknowledged.`);
        }
        break;
      }
      case "shelveAlarm": {
        const a = this.alarmStates[action.tag];
        if (a) {
          a.shelved = true;
          this.log(`${action.tag} alarm shelved.`);
        }
        break;
      }
      case "clearTrip": {
        const p = this.equipment[action.tag];
        if (p && p.type === "pump" && p.state === "tripped") {
          p.state = "off";
          this.log(`${action.tag} trip cleared at the local panel; ready to restart.`);
        }
        break;
      }
      case "reset": {
        this.reset();
        break;
      }
    }
    this.recomputeProcess();
  }

  /** Advance the simulation by one fixed time step (or `steps` of them). */
  step(steps = 1): void {
    for (let i = 0; i < steps; i++) {
      if (!this.running) return;
      this.elapsedMs += this.scenario.timeStepMs;
      this.applyScheduledEvents();
      this.integrateLevels();
      this.recomputeProcess();
      this.updateAlarmsAndTrips();
      this.updateTasks();
      if (
        this.scenario.timeLimitSeconds &&
        this.elapsedMs >= this.scenario.timeLimitSeconds * 1000
      ) {
        this.running = false;
        this.log("Time limit reached.");
      }
    }
  }

  /** Convenience for tests/replay: advance by a duration in ms. */
  runFor(durationMs: number): void {
    const steps = Math.round(durationMs / this.scenario.timeStepMs);
    this.step(steps);
  }

  private applyScheduledEvents(): void {
    for (const ev of this.scenario.events) {
      const key = ev.id;
      if (this.firedEvents.has(key)) continue;
      if (this.elapsedMs >= ev.at * 1000) {
        this.firedEvents.add(key);
        this.fireEvent(ev);
      }
    }
  }

  private fireEvent(ev: ScenarioEvent): void {
    const target = this.equipment[ev.target];
    switch (ev.type) {
      case "pump_trip":
        if (target && target.type === "pump") {
          target.state = "tripped";
          this.log(`EVENT: ${ev.target} tripped. ${ev.description ?? ""}`.trim());
        }
        break;
      case "valve_stuck":
        if (target && (target.type === "manual_valve" || target.type === "control_valve")) {
          target.stuck = true;
          this.log(`EVENT: ${ev.target} is now mechanically stuck. ${ev.description ?? ""}`.trim());
        }
        break;
      case "transmitter_fault":
        this.instrumentFaults[ev.target] = {
          frozenValue: this.lastReadings[ev.target] ?? 0,
        };
        this.log(`EVENT: ${ev.target} failed and is now frozen/unreliable. ${ev.description ?? ""}`.trim());
        break;
      case "transmitter_drift":
        this.instrumentFaults[ev.target] = {
          extraDrift: ev.magnitude ?? 0.1,
        };
        this.log(`EVENT: ${ev.target} is drifting by ${ev.magnitude ?? 0.1}. ${ev.description ?? ""}`.trim());
        break;
      case "demand_increase":
      case "demand_decrease": {
        // Represented as a connection resistance change; applied to a manual valve target.
        if (target && target.type === "manual_valve") {
          const delta = (ev.magnitude ?? 0.2) * (ev.type === "demand_increase" ? 1 : -1);
          target.position = Math.max(0, Math.min(1, target.position + delta));
          this.log(`EVENT: demand change applied at ${ev.target}. ${ev.description ?? ""}`.trim());
        }
        break;
      }
    }
  }

  private getVessel(tag: string): Vessel | undefined {
    const e = this.equipment[tag];
    return e && e.type === "vessel" ? e : undefined;
  }

  /** Reporting-only pressure for inspection/instrumentation (e.g. a pump discharge gauge). */
  private nodePressure(tag: string, cache: Record<string, number>, envPressureBar = 0): number {
    if (tag === "ENV") return envPressureBar;
    if (cache[tag] !== undefined) return cache[tag];
    const eq = this.equipment[tag];
    if (!eq) return 0;
    if (eq.type === "vessel") {
      const p = eq.basePressureBar + eq.levelPressureGainBar * eq.level;
      cache[tag] = p;
      return p;
    }
    if (eq.type === "pump") {
      // Resolve suction pressure from the upstream connection feeding this pump.
      const upstream = this.scenario.connections.find((c) => c.to === tag);
      const suction = upstream
        ? this.nodePressure(upstream.from, cache, upstream.envPressureBar)
        : 0;
      const boost = eq.state === "on" ? eq.headBar : 0;
      const p = suction + boost;
      cache[tag] = p;
      return p;
    }
    cache[tag] = 0;
    return 0;
  }

  /** Valve position/Cv for a connection's regulating valve, or an unrestricted pass-through if none. */
  private valveConductance(conn: Connection): { position: number; cv: number } {
    if (!conn.valve) return { position: 1, cv: 1e6 };
    const valve = this.equipment[conn.valve];
    if (valve && (valve.type === "manual_valve" || valve.type === "control_valve")) {
      return { position: valve.position, cv: valve.cv };
    }
    return { position: 1, cv: 1e6 };
  }

  /** Simple single-valve orifice-style flow for a connection not adjacent to a pump. */
  private connectionFlow(conn: Connection, pressures: Record<string, number>): number {
    const pFrom = this.nodePressure(conn.from, pressures, conn.envPressureBar);
    const pTo = this.nodePressure(conn.to, pressures, conn.envPressureBar);
    const { position, cv } = this.valveConductance(conn);
    if (position <= 0) return 0;
    const dP = pFrom - pTo;
    // Forward-only simplification: reverse flow through a line is not modelled.
    if (dP < 0) return 0;
    return position * cv * Math.sqrt(dP);
  }

  /**
   * A pump in series between a suction connection and its discharge connection(s)
   * shares one physical flow (mass conservation, no branching). The suction and
   * discharge valves act as two resistances in series: for Q = C*sqrt(dP) per leg,
   * dP_total = (Q/C_suction)^2 + (Q/C_discharge)^2, solved directly for Q.
   */
  private pumpPathFlow(
    pump: Pump,
    suctionConn: Connection | undefined,
    dischargeConns: Connection[],
    pressures: Record<string, number>
  ): { suction: number; discharge: number } {
    if (pump.state !== "on" || !suctionConn || dischargeConns.length === 0) {
      return { suction: 0, discharge: 0 };
    }
    const suctionLeg = this.valveConductance(suctionConn);
    // Only the first discharge path is modelled hydraulically (series chain assumption).
    const primaryDischarge = dischargeConns[0];
    const dischargeLeg = this.valveConductance(primaryDischarge);
    if (suctionLeg.position <= 0 || dischargeLeg.position <= 0) {
      return { suction: 0, discharge: 0 };
    }
    const suctionSource = this.nodePressure(suctionConn.from, pressures, suctionConn.envPressureBar);
    const dischargeSink = this.nodePressure(primaryDischarge.to, pressures, primaryDischarge.envPressureBar);
    const drivingDP = suctionSource + pump.headBar - dischargeSink;
    if (drivingDP <= 0) return { suction: 0, discharge: 0 };
    const cSuction = suctionLeg.position * suctionLeg.cv;
    const cDischarge = dischargeLeg.position * dischargeLeg.cv;
    const flow = Math.sqrt(drivingDP / (1 / (cSuction * cSuction) + 1 / (cDischarge * cDischarge)));
    return { suction: flow, discharge: flow };
  }

  private recomputeProcess(): void {
    const pressures: Record<string, number> = {};
    const flows: Record<string, number> = {};
    const handled = new Set<string>();

    for (const eq of Object.values(this.equipment)) {
      if (eq.type !== "pump") continue;
      const suctionConn = this.scenario.connections.find((c) => c.to === eq.tag);
      const dischargeConns = this.scenario.connections.filter((c) => c.from === eq.tag);
      const { suction, discharge } = this.pumpPathFlow(eq, suctionConn, dischargeConns, pressures);
      if (suctionConn) {
        flows[suctionConn.id] = suction;
        handled.add(suctionConn.id);
      }
      for (const dc of dischargeConns) {
        flows[dc.id] = discharge;
        handled.add(dc.id);
      }
    }

    for (const conn of this.scenario.connections) {
      if (handled.has(conn.id)) continue;
      flows[conn.id] = this.connectionFlow(conn, pressures);
    }
    // Ensure every equipment node has a resolved pressure for inspection/UI.
    for (const tag of Object.keys(this.equipment)) {
      this.nodePressure(tag, pressures);
    }
    this.lastFlows = flows;
    this.lastPressures = pressures;
    this.computeInstrumentReadings();
    this.runControllers();
  }

  private computeInstrumentReadings(): void {
    const readings: Record<string, number> = {};
    for (const inst of this.scenario.instruments) {
      const fault = this.instrumentFaults[inst.tag];
      if (fault?.frozenValue !== undefined) {
        readings[inst.tag] = fault.frozenValue;
        continue;
      }
      const raw = this.resolveMeasuredValue(inst.measures);
      const drift = inst.drift + (fault?.extraDrift ?? 0);
      readings[inst.tag] = raw + drift;
    }
    this.lastReadings = readings;
  }

  private resolveMeasuredValue(path: string): number {
    const [tag, prop] = path.split(".");
    const eq = this.equipment[tag];
    if (eq?.type === "vessel") {
      if (prop === "level") return eq.level;
      if (prop === "pressure") return this.lastPressures[tag] ?? this.nodePressure(tag, {});
    }
    if (prop === "flow") return this.lastFlows[tag] ?? 0;
    return 0;
  }

  private runControllers(): void {
    const dtSeconds = this.scenario.timeStepMs / 1000;
    for (const tag of Object.keys(this.controllers)) {
      const c = this.controllers[tag];
      const pv = this.lastReadings[c.pv] ?? 0;
      const error = c.sp - pv;
      if (c.mode === "auto") {
        c.integral += error * dtSeconds;
        // Anti-windup: clamp integral contribution.
        const maxIntegral = 50;
        c.integral = Math.max(-maxIntegral, Math.min(maxIntegral, c.integral));
        const output = c.kp * error + (c.kp / c.ti) * c.integral;
        const clamped = Math.max(0, Math.min(1, 0.5 + output));
        const valve = this.equipment[c.out];
        if (valve && valve.type === "control_valve" && valve.mode === "auto" && !valve.stuck) {
          valve.position = clamped;
        }
      }
    }
  }

  private integrateLevels(): void {
    const dtHours = this.scenario.timeStepMs / 1000 / 3600;
    for (const eq of Object.values(this.equipment)) {
      if (eq.type !== "vessel") continue;
      let net = 0;
      for (const conn of this.scenario.connections) {
        const flow = this.lastFlows[conn.id] ?? 0;
        if (conn.to === eq.tag) net += flow;
        if (conn.from === eq.tag) net -= flow;
      }
      const dVolume = net * dtHours; // m^3
      const dLevel = dVolume / eq.capacity;
      eq.level = Math.max(0, Math.min(1, eq.level + dLevel));
    }
  }

  private updateAlarmsAndTrips(): void {
    for (const def of this.scenario.alarms) {
      const state = this.alarmStates[def.tag];
      const value = this.lastReadings[def.source] ?? this.resolveMeasuredValue(def.source);
      let condition = false;
      switch (def.condition) {
        case "high":
        case "high_high":
          condition = value > def.threshold;
          break;
        case "low":
        case "low_low":
          condition = value < def.threshold;
          break;
      }
      const wasActive = state.active;
      state.active = condition && !state.shelved;
      if (state.active && !wasActive) {
        state.acknowledged = false;
        state.activatedAtMs = this.elapsedMs;
        this.log(`ALARM: ${def.label ?? def.tag} (${def.condition.replace("_", "-")}).`);
        if (
          (def.condition === "high_high" || def.condition === "low_low") &&
          def.tripAction
        ) {
          this.executeTrip(def.tripAction);
        }
      }
      if (!condition && wasActive) {
        state.active = false;
      }
    }
  }

  private executeTrip(trip: NonNullable<AlarmDef["tripAction"]>): void {
    const target = this.equipment[trip.target];
    if (!target) return;
    if (trip.type === "stop_pump" && target.type === "pump") {
      target.state = "tripped";
      this.log(`TRIP: ${trip.target} stopped by safety trip.`);
    } else if (trip.type === "close_valve" && (target.type === "manual_valve" || target.type === "control_valve")) {
      target.position = 0;
      this.log(`TRIP: ${trip.target} closed by safety trip.`);
    } else if (trip.type === "open_valve" && (target.type === "manual_valve" || target.type === "control_valve")) {
      target.position = 1;
      this.log(`TRIP: ${trip.target} opened by safety trip.`);
    }
  }

  private evaluateCondition(check: Condition): boolean {
    const value = this.getConditionValue(check);
    switch (check.op) {
      case "between":
        return (
          typeof value === "number" &&
          check.min !== undefined &&
          check.max !== undefined &&
          value >= check.min &&
          value <= check.max
        );
      case "gt":
        return typeof value === "number" && typeof check.value === "number" && value > check.value;
      case "gte":
        return typeof value === "number" && typeof check.value === "number" && value >= check.value;
      case "lt":
        return typeof value === "number" && typeof check.value === "number" && value < check.value;
      case "lte":
        return typeof value === "number" && typeof check.value === "number" && value <= check.value;
      case "eq":
        return value === check.value;
    }
  }

  private getConditionValue(check: Condition): number | string | boolean {
    const { tag, property } = check;
    if (property === "active") {
      return this.alarmStates[tag]?.active ?? false;
    }
    if (property === "pv") {
      return this.lastReadings[tag] ?? 0;
    }
    if (property === "state") {
      const eq = this.equipment[tag];
      return eq && eq.type === "pump" ? eq.state : "";
    }
    if (property === "position") {
      const eq = this.equipment[tag];
      return eq && (eq.type === "manual_valve" || eq.type === "control_valve") ? eq.position : 0;
    }
    if (property === "level") {
      return this.getVessel(tag)?.level ?? 0;
    }
    if (property === "pressure") {
      return this.lastPressures[tag] ?? 0;
    }
    if (property === "flow") {
      return this.lastFlows[tag] ?? 0;
    }
    return 0;
  }

  private updateTasks(): void {
    const dtMs = this.scenario.timeStepMs;
    for (const task of this.scenario.tasks) {
      const progress = this.taskProgress[task.id];
      if (progress.satisfied || progress.failed) continue;
      const holds = this.evaluateCondition(task.check);
      const deadlinePassed =
        task.within !== undefined && this.elapsedMs > task.within * 1000;

      if (task.mode === "neverViolate") {
        if (!holds) {
          progress.violated = true;
          progress.failed = true;
          this.log(`OBJECTIVE FAILED: ${task.text}`);
        } else if (!deadlinePassed || task.within === undefined) {
          // keep evaluating until scenario end; mark satisfied once deadline reached without violation
          if (task.within !== undefined && deadlinePassed) {
            progress.satisfied = true;
          } else if (task.within === undefined) {
            progress.satisfied = true; // continuously satisfied so far
          }
        }
      } else if (task.mode === "atLeastOnce") {
        if (holds) {
          progress.satisfied = true;
          this.log(`OBJECTIVE MET: ${task.text}`);
        } else if (deadlinePassed) {
          progress.failed = true;
        }
      } else if (task.mode === "holdWithinWindow") {
        if (holds) {
          progress.continuousHoldMs += dtMs;
        } else {
          progress.continuousHoldMs = 0;
        }
        const requiredMs = (task.holdSeconds ?? 0) * 1000;
        if (progress.continuousHoldMs >= requiredMs && requiredMs > 0) {
          progress.satisfied = true;
          this.log(`OBJECTIVE MET: ${task.text}`);
        } else if (deadlinePassed) {
          progress.failed = true;
        }
      }
    }
  }

  private computeScore(): { score: number; passed: boolean } {
    let totalWeight = 0;
    let earned = 0;
    for (const task of this.scenario.tasks) {
      totalWeight += task.weight;
      const progress = this.taskProgress[task.id];
      if (progress.satisfied) earned += task.weight;
    }
    const score = totalWeight > 0 ? Math.round((earned / totalWeight) * 100) : 0;
    return { score, passed: score >= this.scenario.passMark };
  }

  isComplete(): boolean {
    const allResolved = this.scenario.tasks.every((t) => {
      const p = this.taskProgress[t.id];
      return p.satisfied || p.failed;
    });
    const timeUp =
      !!this.scenario.timeLimitSeconds &&
      this.elapsedMs >= this.scenario.timeLimitSeconds * 1000;
    return allResolved || timeUp;
  }

  getSnapshot(): EngineSnapshot {
    const { score, passed } = this.computeScore();
    return {
      elapsedMs: this.elapsedMs,
      running: this.running,
      equipment: structuredClone(this.equipment),
      controllers: Object.fromEntries(
        Object.entries(this.controllers).map(([tag, c]) => [
          tag,
          { tag: c.tag, pv: c.pv, out: c.out, sp: c.sp, mode: c.mode, kp: c.kp, ti: c.ti },
        ])
      ),
      connectionFlows: { ...this.lastFlows },
      nodePressures: { ...this.lastPressures },
      instrumentReadings: { ...this.lastReadings },
      alarms: Object.values(this.alarmStates).map((a) => ({ ...a })),
      tasks: Object.values(this.taskProgress).map((t) => ({ ...t })),
      eventLog: [...this.eventLog],
      actionLog: [...this.actionLog],
      faultedInstrumentTags: Object.keys(this.instrumentFaults),
      score,
      passed,
      complete: this.isComplete(),
    };
  }

  getActionLog(): LoggedAction[] {
    return [...this.actionLog];
  }
}

/**
 * Deterministically replay a stored action log against a fresh engine
 * instance and return the resulting snapshot — used for instructor review
 * and automated regression tests (SIM-9).
 */
export function replay(
  scenario: ScenarioDefinition,
  actionLog: LoggedAction[],
  totalDurationMs: number
): EngineSnapshot {
  const engine = new SimulationEngine(scenario);
  engine.start();
  let cursor = 0;
  const stepMs = scenario.timeStepMs;
  for (let t = 0; t < totalDurationMs; t += stepMs) {
    while (cursor < actionLog.length && actionLog[cursor].atMs <= t) {
      engine.applyAction(actionLog[cursor].action);
      cursor++;
    }
    engine.step(1);
  }
  // Apply any remaining actions logged exactly at the final timestamp.
  while (cursor < actionLog.length && actionLog[cursor].atMs <= totalDurationMs) {
    engine.applyAction(actionLog[cursor].action);
    cursor++;
  }
  return engine.getSnapshot();
}
