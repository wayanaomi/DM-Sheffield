export * from "./schema.js";
export * from "./engine.js";

import pumpVesselFundamentals from "./scenarios/pump-vessel-fundamentals.json";
import separatorLevelControl from "./scenarios/separator-level-control.json";
import hazopLossOfFlow from "./scenarios/hazop-loss-of-flow.json";
import { parseScenario, ScenarioDefinition } from "./schema.js";

const rawScenarios: Record<string, unknown> = {
  "pump-vessel-fundamentals": pumpVesselFundamentals,
  "separator-level-control": separatorLevelControl,
  "hazop-loss-of-flow": hazopLossOfFlow,
};

/** The three MVP starter scenarios (SIM-10), parsed and validated eagerly. */
export const starterScenarios: ScenarioDefinition[] = Object.values(rawScenarios).map(
  (raw) => {
    const result = parseScenario(raw);
    if (!result.valid || !result.scenario) {
      throw new Error(
        `Invalid bundled scenario: ${result.errors?.join("; ") ?? "unknown error"}`
      );
    }
    return result.scenario;
  }
);

export function getScenarioById(id: string): ScenarioDefinition | undefined {
  return starterScenarios.find((s) => s.id === id);
}
