import { notFound } from "next/navigation";
import { getScenarioById } from "@dm-sheffield/simulator";
import { Container } from "@/components/ui/container";
import { SimulatorWorkspace } from "@/components/simulator/simulator-workspace";

export async function generateMetadata({ params }: { params: Promise<{ scenarioKey: string }> }) {
  const { scenarioKey } = await params;
  const scenario = getScenarioById(scenarioKey);
  return { title: scenario?.title ?? "Simulator scenario" };
}

export default async function SimulatorScenarioPage({
  params,
  searchParams,
}: {
  params: Promise<{ scenarioKey: string }>;
  searchParams: Promise<{ lessonId?: string; enrollmentId?: string }>;
}) {
  const { scenarioKey } = await params;
  const { lessonId, enrollmentId } = await searchParams;
  const scenario = getScenarioById(scenarioKey);
  if (!scenario) notFound();

  return (
    <Container className="py-8">
      <div className="mb-4">
        <p className="font-tag text-xs font-semibold uppercase tracking-wider text-blue">
          P&amp;ID Simulator
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-navy">{scenario.title}</h1>
        <p className="mt-1 text-sm text-muted">{scenario.description}</p>
      </div>
      <SimulatorWorkspace scenario={scenario} lessonId={lessonId} enrollmentId={enrollmentId} />
    </Container>
  );
}
