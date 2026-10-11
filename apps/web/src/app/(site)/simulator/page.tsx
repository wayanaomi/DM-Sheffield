import Link from "next/link";
import { starterScenarios } from "@dm-sheffield/simulator";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "P&ID Simulator" };

const categoryLabel: Record<string, string> = {
  fundamentals: "Fundamentals",
  level_control: "Level control",
  hazop_deviation: "HAZOP deviation",
};

export default function SimulatorIndexPage() {
  return (
    <Container className="py-12">
      <SectionHeading
        eyebrow="The signature feature"
        title="Practise on a real, physics-informed P&ID simulator"
        description="Operate valves, pumps and controllers on a deterministic process model and see the consequences for yourself. This is an educational simulation with simplified assumptions — not a substitute for real operational training. See docs/SIMULATOR.md for the engineering assumptions."
      />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {starterScenarios.map((scenario) => (
          <Link
            key={scenario.id}
            href={`/simulator/${scenario.id}`}
            className="group flex flex-col rounded-lg border border-border bg-white p-5 hover:shadow-md"
          >
            <Badge tone="blue">{categoryLabel[scenario.category] ?? scenario.category}</Badge>
            <h3 className="mt-3 text-base font-semibold text-navy group-hover:text-blue">
              {scenario.title}
            </h3>
            <p className="mt-2 flex-1 text-sm text-muted">{scenario.description}</p>
            <p className="mt-4 text-xs font-medium text-blue">Start scenario →</p>
          </Link>
        ))}
      </div>
    </Container>
  );
}
