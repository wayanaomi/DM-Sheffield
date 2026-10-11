import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ContactForm } from "./contact-form";

export const metadata = { title: "Contact us" };

export default function ContactPage() {
  return (
    <Container className="py-12">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <SectionHeading
            eyebrow="Get in touch"
            title="Contact DM Sheffield"
            description="Questions about a course, organisational training, or the P&ID simulator? Send us a message and our team will respond."
          />
        </div>
        <ContactForm />
      </div>
    </Container>
  );
}
