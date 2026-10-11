import { prisma } from "@/lib/prisma";
import { getScenarioById } from "@dm-sheffield/simulator";

/**
 * Lazily ensures a DB-backed SimulationScenario + version row exists for a
 * bundled scenario (the 3 starter scenarios are code assets, not seeded
 * business data — this just gives SimulationAttempt a stable FK to point at).
 */
export async function ensureScenarioVersion(scenarioKey: string) {
  const definition = getScenarioById(scenarioKey);
  if (!definition) throw new Error(`Unknown scenario: ${scenarioKey}`);

  const scenario = await prisma.simulationScenario.upsert({
    where: { scenarioKey },
    create: { scenarioKey, title: definition.title, status: "published" },
    update: {},
  });

  const existingVersion = await prisma.simulationScenarioVersion.findUnique({
    where: { scenarioId_version: { scenarioId: scenario.id, version: 1 } },
  });
  const version =
    existingVersion ??
    (await prisma.simulationScenarioVersion.create({
      data: {
        scenarioId: scenario.id,
        version: 1,
        schemaJson: JSON.stringify(definition),
      },
    }));

  return { scenario, version };
}
