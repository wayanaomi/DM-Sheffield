import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata = { title: "About DM Sheffield" };

export default function AboutPage() {
  return (
    <Container className="py-12">
      <SectionHeading
        eyebrow="About us"
        title="Engineering training grounded in practical experience"
        description="DM Sheffield provides professional training in process safety, offshore safety, piping and instrumentation design, and HAZOP methodology for engineers, technicians and operations personnel."
      />
      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div className="space-y-4 text-sm leading-relaxed text-ink">
          <p>
            Our training is built around the reality that reading a process
            drawing is different from operating a process. Courses combine
            structured video and written content with an interactive P&amp;ID
            simulator, so learners can test their understanding against a
            consistent, physics-informed process model rather than memorised
            answers.
          </p>
          <p>
            We focus on the training areas most relevant to the oil and gas and
            broader process industries: offshore safety awareness, process
            safety management, piping and instrumentation design, and HAZOP
            (hazard and operability) methodology.
          </p>
          <p>
            DM Sheffield does not claim OPITO accreditation. Where a course
            covers BOSIET-related content, it is explicitly positioned as
            preparation and awareness material — it does not replace the
            required practical, in-person survival training.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-blue-50/40 p-6">
          <h3 className="text-sm font-semibold text-navy">What you can expect</h3>
          <ul className="mt-4 space-y-3 text-sm text-ink">
            {[
              "Structured courses organised as Course → Module → Lesson",
              "Free and paid training, clearly labelled",
              "An interactive, deterministic P&ID simulator for practical scenarios",
              "Completion certificates with public verification",
              "Clear empty states — we do not publish fabricated course data",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-blue" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Container>
  );
}
