import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <Container className="py-12 max-w-3xl">
      <SectionHeading eyebrow="Legal" title="Privacy policy" />
      <div className="prose prose-sm mt-8 space-y-4 text-sm leading-relaxed text-ink">
        <p>
          This is a placeholder privacy policy for the DM Sheffield Learning
          Management System. It describes, at a draft level, how the platform
          handles personal data collected from learners, instructors,
          organisation managers and administrators.
        </p>
        <h2 className="text-base font-semibold text-navy">Data we collect</h2>
        <p>
          Account details (name, email), course progress, assessment attempts,
          simulator attempt logs, and payment status (not raw card data — card
          data is handled entirely by our payment gateway and never stored by
          DM Sheffield).
        </p>
        <h2 className="text-base font-semibold text-navy">Your rights</h2>
        <p>
          You may request export or deletion of your account data, subject to
          retention requirements for payment, certificate and audit records.
        </p>
        <h2 className="text-base font-semibold text-navy">Compliance</h2>
        <p>
          DM Sheffield intends to operate in line with the Nigeria Data
          Protection Act 2023. This page is a draft and requires review by
          qualified legal counsel before public launch — see
          docs/SECURITY.md for tracked compliance gaps.
        </p>
      </div>
    </Container>
  );
}
