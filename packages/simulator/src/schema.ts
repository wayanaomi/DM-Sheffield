/**
 * DM Sheffield P&ID Simulator — scenario schema (schemaVersion "1.0").
 *
 * A scenario is a versioned, declarative JSON document describing a small
 * process plant: equipment, instruments, valves, pumps, controllers, alarms,
 * scripted events, and learning objectives. It contains NO executable code —
 * all conditions (objectives, trips, alarms) are structured comparisons
 * evaluated by the engine, never `eval`-ed strings. This keeps scenario
 * authoring (including future user-authored scenarios, SIM-11) safe to load.
 */
import { z } from "zod";

export const TagSchema = z.string().min(1).max(32);

export const VesselSchema = z.object({
  tag: TagSchema,
  type: z.literal("vessel"),
  label: z.string().optional(),
  /** Initial liquid level, fraction of capacity (0-1). */
  level: z.number().min(0).max(1),
  /** Effective cross-sectional area in m^2 — relates net flow to level rate of change. */
  crossSectionArea: z.number().positive().default(4),
  /** Vessel capacity in the same volumetric unit used by connected flows (m^3). */
  capacity: z.number().positive(),
  /** Static base pressure (bar) when level is zero, used for the simplified pressure model. */
  basePressureBar: z.number().min(0).default(1.0),
  /** Additional pressure contributed per full (level=1) vessel head (bar). */
  levelPressureGainBar: z.number().min(0).default(0.3),
});

export const PumpSchema = z.object({
  tag: TagSchema,
  type: z.literal("pump"),
  label: z.string().optional(),
  state: z.enum(["on", "off", "tripped"]).default("off"),
  /** Shutoff head the pump develops when running, in bar. Simplified flat head curve. */
  headBar: z.number().min(0).default(3),
});

export const ManualValveSchema = z.object({
  tag: TagSchema,
  type: z.literal("manual_valve"),
  label: z.string().optional(),
  /** 0 = fully closed, 1 = fully open. */
  position: z.number().min(0).max(1).default(1),
  /** Flow coefficient (Cv-equivalent) at fully open, in m^3/h per sqrt(bar). */
  cv: z.number().positive().default(20),
  stuck: z.boolean().default(false),
});

export const ControlValveSchema = z.object({
  tag: TagSchema,
  type: z.literal("control_valve"),
  label: z.string().optional(),
  position: z.number().min(0).max(1).default(0.5),
  cv: z.number().positive().default(20),
  mode: z.enum(["auto", "manual"]).default("auto"),
  stuck: z.boolean().default(false),
});

export const EquipmentSchema = z.discriminatedUnion("type", [
  VesselSchema,
  PumpSchema,
  ManualValveSchema,
  ControlValveSchema,
]);
export type Equipment = z.infer<typeof EquipmentSchema>;

/** A directed flow path between two equipment items, optionally passing through a valve. */
export const ConnectionSchema = z.object({
  id: z.string(),
  from: TagSchema,
  to: TagSchema,
  /** Tag of the manual or control valve regulating this connection, if any. */
  valve: TagSchema.optional(),
  /** Fixed boundary pressure in bar(g) used for whichever endpoint equals "ENV" (supply or atmosphere/vent). */
  envPressureBar: z.number().default(0),
  label: z.string().optional(),
});
export type Connection = z.infer<typeof ConnectionSchema>;

export const LevelTransmitterSchema = z.object({
  tag: TagSchema,
  type: z.literal("level_transmitter"),
  label: z.string().optional(),
  measures: z.string(), // e.g. "V-101.level"
  drift: z.number().default(0),
});

export const PressureTransmitterSchema = z.object({
  tag: TagSchema,
  type: z.literal("pressure_transmitter"),
  label: z.string().optional(),
  measures: z.string(), // e.g. "V-101.pressure"
  drift: z.number().default(0),
});

export const FlowTransmitterSchema = z.object({
  tag: TagSchema,
  type: z.literal("flow_transmitter"),
  label: z.string().optional(),
  measures: z.string(), // e.g. "LINE-1.flow"
  drift: z.number().default(0),
});

export const ControllerSchema = z.object({
  tag: TagSchema,
  type: z.literal("pid_controller"),
  label: z.string().optional(),
  /** Tag of the instrument providing the process variable. */
  pv: TagSchema,
  /** Tag of the control valve this controller drives. */
  out: TagSchema,
  /** Setpoint, in the same normalised units as the measured PV (0-1 for level). */
  sp: z.number(),
  mode: z.enum(["auto", "manual"]).default("auto"),
  kp: z.number().default(2.0),
  /** Integral time in seconds. Larger = slower integral action. */
  ti: z.number().positive().default(30),
});

export const InstrumentSchema = z.discriminatedUnion("type", [
  LevelTransmitterSchema,
  PressureTransmitterSchema,
  FlowTransmitterSchema,
]);
export type Instrument = z.infer<typeof InstrumentSchema>;

export const AlarmSchema = z.object({
  tag: TagSchema,
  label: z.string().optional(),
  /** Tag of the instrument monitored. */
  source: TagSchema,
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  condition: z.enum(["high", "high_high", "low", "low_low"]),
  threshold: z.number(),
  /** Optional trip action fired once when a high_high/low_low alarm activates. */
  tripAction: z
    .object({
      type: z.enum(["stop_pump", "close_valve", "open_valve"]),
      target: TagSchema,
    })
    .optional(),
});
export type AlarmDef = z.infer<typeof AlarmSchema>;

export const ScenarioEventSchema = z.object({
  id: z.string(),
  /** Elapsed scenario time, in seconds, at which this event fires exactly once. */
  at: z.number().min(0),
  type: z.enum([
    "pump_trip",
    "pump_restart_blocked",
    "valve_stuck",
    "transmitter_fault",
    "transmitter_drift",
    "demand_increase",
    "demand_decrease",
  ]),
  target: TagSchema,
  /** Optional numeric magnitude, meaning depends on event type. */
  magnitude: z.number().optional(),
  description: z.string().optional(),
});
export type ScenarioEvent = z.infer<typeof ScenarioEventSchema>;

/** A structured (non-executable) condition the engine can evaluate safely. */
export const ConditionSchema = z.object({
  tag: TagSchema,
  property: z.enum(["level", "pressure", "flow", "position", "state", "pv", "active"]),
  op: z.enum(["between", "gt", "gte", "lt", "lte", "eq"]),
  value: z.union([z.number(), z.string(), z.boolean()]).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
});
export type Condition = z.infer<typeof ConditionSchema>;

export const TaskSchema = z.object({
  id: z.string(),
  text: z.string(),
  weight: z.number().min(0).max(100),
  /** How the condition must hold for the task to be satisfied. */
  mode: z.enum(["holdWithinWindow", "neverViolate", "atLeastOnce"]).default("atLeastOnce"),
  check: ConditionSchema,
  /** Required for holdWithinWindow: seconds the condition must hold continuously. */
  holdSeconds: z.number().optional(),
  /** Deadline in elapsed seconds for holdWithinWindow / atLeastOnce. */
  within: z.number().optional(),
});
export type Task = z.infer<typeof TaskSchema>;

export const ScenarioSchema = z.object({
  schemaVersion: z.literal("1.0"),
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().default(""),
  category: z
    .enum(["fundamentals", "level_control", "hazop_deviation"])
    .default("fundamentals"),
  learningObjectives: z.array(z.string()).default([]),
  guideWords: z.array(z.string()).default([]),
  seed: z.number().int().default(1),
  timeStepMs: z.number().int().positive().default(100),
  timeLimitSeconds: z.number().positive().optional(),
  equipment: z.array(EquipmentSchema).min(1),
  connections: z.array(ConnectionSchema).default([]),
  instruments: z.array(InstrumentSchema).default([]),
  controllers: z.array(ControllerSchema).default([]),
  alarms: z.array(AlarmSchema).default([]),
  events: z.array(ScenarioEventSchema).default([]),
  tasks: z.array(TaskSchema).min(1),
  passMark: z.number().min(0).max(100).default(70),
  completionFeedback: z
    .object({
      onPass: z.string().default("Objectives achieved. Review the run summary below."),
      onFail: z.string().default("Not all objectives were met — review the run summary and try again."),
    })
    .default({
      onPass: "Objectives achieved. Review the run summary below.",
      onFail: "Not all objectives were met — review the run summary and try again.",
    }),
  safetyConstraints: z.array(z.string()).default([]),
});

export type ScenarioDefinition = z.infer<typeof ScenarioSchema>;

export interface ScenarioValidationResult {
  valid: boolean;
  scenario?: ScenarioDefinition;
  errors?: string[];
}

export function parseScenario(json: unknown): ScenarioValidationResult {
  const result = ScenarioSchema.safeParse(json);
  if (!result.success) {
    return {
      valid: false,
      errors: result.error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`
      ),
    };
  }
  return { valid: true, scenario: result.data };
}
