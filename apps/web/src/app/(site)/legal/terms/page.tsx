import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata = { title: "Terms of service" };

export default function TermsPage() {
  return (
    <Container className="py-12 max-w-3xl">
      <SectionHeading eyebrow="Legal" title="Terms of service" />
      <div className="prose prose-sm mt-8 space-y-4 text-sm leading-relaxed text-ink">
        <p>
          This is a placeholder terms of service page for the DM Sheffield
          Learning Management System, for review before public launch.
        </p>
        <h2 className="text-base font-semibold text-navy">Course access</h2>
        <p>
          Paid course access is granted only after a verified payment. Free
          course access is granted immediately on enrolment while the course
          remains published.
        </p>
        <h2 className="text-base font-semibold text-navy">Certificates</h2>
        <p>
          Certificates issued by DM Sheffield confirm completion of an online
          course on this platform. DM Sheffield does not claim OPITO
          accreditation, and BOSIET-related content here does not replace
          required practical, in-person survival training.
        </p>
        <h2 className="text-base font-semibold text-navy">Simulator</h2>
        <p>
          The P&amp;ID simulator is an educational tool using a simplified,
          deterministic process model. It is not a substitute for real
          operational training or safety-critical engineering software.
        </p>
      </div>
    </Container>
  );
}
