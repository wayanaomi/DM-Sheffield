import { Building2, Users, FileBarChart } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { LinkButton } from "@/components/ui/button";

export const metadata = { title: "Organisational training" };

export default function OrganisationsPage() {
  return (
    <Container className="py-12">
      <SectionHeading
        eyebrow="For organisations"
        title="Training and reporting for your workforce"
        description="Assign relevant courses to your team, track completion and certificates, and keep training records organised across your organisation."
      />
      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {[
          {
            icon: Users,
            title: "Seats and assignments",
            body: "Invite learners, allocate seats, and assign courses with due dates.",
          },
          {
            icon: FileBarChart,
            title: "Progress reporting",
            body: "See completion, certificates and simulator practice across your team.",
          },
          {
            icon: Building2,
            title: "Organisation-scoped access",
            body: "Managers only see their own organisation's data — nothing more.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-lg border border-border p-6">
            <item.icon className="h-6 w-6 text-blue" />
            <h3 className="mt-4 text-base font-semibold text-navy">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
          </div>
        ))}
      </div>
      <div className="mt-12 rounded-lg border border-border bg-blue-50/40 p-8 text-center">
        <p className="text-sm text-muted">
          Organisation accounts, seat management and manager reporting are part of
          DM Sheffield&apos;s Phase 2 release. Contact us to discuss your
          organisation&apos;s training needs ahead of general availability.
        </p>
        <div className="mt-5">
          <LinkButton href="/contact">Contact us about organisational training</LinkButton>
        </div>
      </div>
    </Container>
  );
}
