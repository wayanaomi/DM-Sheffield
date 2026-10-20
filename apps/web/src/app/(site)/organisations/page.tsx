import { Building2, Users, FileBarChart } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { LinkButton } from "@/components/ui/button";

export const metadata = { title: "Organisational training" };

const benefits = [
  {
    icon: Users,
    title: "Team learning",
    body: "Build a central place for workforce training and team development.",
  },
  {
    icon: FileBarChart,
    title: "Training visibility",
    body: "Work towards clear training records, progress tracking and certificates.",
  },
  {
    icon: Building2,
    title: "Organisation access",
    body: "Start with an organisation manager account and prepare to manage your workforce.",
  },
];

export default function OrganisationsPage() {
  return (
    <Container className="py-12">
      <SectionHeading
        eyebrow="For organisations"
        title="Training for your workforce"
        description="Set up your organisation on DM Sheffield and take the first step towards organised technical training for your team."
      />

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {benefits.map((item) => (
          <div key={item.title} className="rounded-lg border border-border p-6">
            <item.icon className="h-6 w-6 text-blue" />
            <h2 className="mt-4 text-base font-semibold text-navy">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-lg border border-border bg-blue-50/40 p-8 text-center">
        <h2 className="text-xl font-semibold text-navy">
          Set up your organisation account
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Register your organisation and verify the manager&apos;s email address to create
          your account. Organisation registration does not yet mean that every team
          management or reporting feature is available.
        </p>
        <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
          <LinkButton href="/register/organisation">
            Register your organisation
          </LinkButton>
          <LinkButton href="/contact" variant="secondary">
            Talk to our team
          </LinkButton>
        </div>
      </div>
    </Container>
  );
}
