import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  ClipboardCheck,
  GitBranch,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata = {
  title: "Consultancy Services",
  description:
    "Explore DM Sheffield consultancy in process safety, HAZOP, P&ID documentation, and technical training.",
};

const services = [
  {
    icon: ShieldCheck,
    number: "01",
    title: "Process Safety & Risk",
    description:
      "Support for organisations looking to strengthen process safety practices, identify operational risks, and improve safety-critical decision-making.",
    points: [
      "Process safety review and improvement planning",
      "Risk identification and assessment support",
      "Practical recommendations aligned with agreed objectives",
    ],
  },
  {
    icon: ClipboardCheck,
    number: "02",
    title: "HAZOP & Risk Studies",
    description:
      "Structured support for identifying process deviations, evaluating potential consequences, and reviewing safeguards.",
    points: [
      "HAZOP preparation and study support",
      "Hazard and operability concern identification",
      "Action tracking and recommendations",
    ],
  },
  {
    icon: GitBranch,
    number: "03",
    title: "P&ID & Process Documentation",
    description:
      "Technical support to help teams understand process drawings, instrumentation, process flow, and technical documentation.",
    points: [
      "P&ID interpretation and review support",
      "Process and instrumentation understanding",
      "Technical documentation review",
    ],
  },
  {
    icon: GraduationCap,
    number: "04",
    title: "Technical Training Consultancy",
    description:
      "Help identify workforce learning needs and plan technical development around your organisation's objectives.",
    points: [
      "Skills and learning needs assessment",
      "Technical training programme recommendations",
      "Learning pathways for teams",
    ],
  },
];

const steps = [
  {
    number: "01",
    title: "Understand",
    description:
      "Tell us about your operational context, challenges, and intended outcomes.",
  },
  {
    number: "02",
    title: "Define",
    description:
      "We discuss the scope, proposed deliverables, responsibilities, and priorities.",
  },
  {
    number: "03",
    title: "Plan",
    description:
      "We agree on the approach, timeframe, and commercial arrangements before work begins.",
  },
];

export default function ConsultancyPage() {
  return (
    <main className="bg-white text-navy">
      <section className="relative overflow-hidden bg-[#071a3d] text-white">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue via-white to-red-600" />
        <Container className="grid gap-12 py-16 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-24">
          <div>
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">
              DM Sheffield / Consultancy
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Practical expertise for safer, more capable operations.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-blue-50/90 sm:text-lg">
              Technical consultancy across process safety, risk, process
              documentation, and workforce capability. Start with your
              challenge and work with us to define a practical way forward.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="inline-flex min-h-12 items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-semibold text-[#071a3d] hover:bg-blue-50"
              >
                Discuss your requirements <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#services"
                className="inline-flex min-h-12 items-center rounded-md border border-white/40 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Explore services
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-white/15 bg-white/[0.06] p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-200">
              Our approach
            </p>
            <h2 className="mt-4 text-2xl font-semibold leading-snug sm:text-3xl">
              Understand the challenge. Define the right response.
            </h2>
            <p className="mt-4 text-sm leading-7 text-blue-50/80 sm:text-base">
              Each engagement starts with your requirements. We clarify the
              scope, intended outcomes, and suitable approach before work begins.
            </p>
            <ul className="mt-6 space-y-3 border-t border-white/15 pt-6">
              {[
                "Requirements-led scope",
                "Clear deliverables and next steps",
                "Practical, context-aware recommendations",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-6">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-300" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section id="services" className="scroll-mt-28 py-16 sm:py-20 lg:py-24">
        <Container>
          <SectionHeading
            eyebrow="Our services"
            title="Consultancy built around your operational needs"
            description="Explore our areas of focus. Scope and deliverables are agreed based on your organisation's requirements."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <article
                  key={service.number}
                  className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg sm:p-8"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-semibold tracking-widest text-slate-400">
                      {service.number}
                    </span>
                  </div>
                  <h2 className="mt-6 text-xl font-semibold sm:text-2xl">
                    {service.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                    {service.description}
                  </p>
                  <ul className="mt-5 space-y-3">
                    {service.points.map((point) => (
                      <li key={point} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-7">
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900"
                    >
                      Enquire about this service <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-16 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="How we work"
            title="A clear process from discussion to delivery"
            description="We establish a shared understanding of the work before agreeing the scope and moving forward."
          />
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <article key={step.number}>
                <p className="text-sm font-bold tracking-[0.18em] text-blue-700">
                  STEP {step.number}
                </p>
                <h3 className="mt-3 text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <div className="grid gap-6 rounded-2xl bg-[#071a3d] p-7 text-white sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center lg:p-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-200">
                Start a conversation
              </p>
              <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">
                What does your organisation need to achieve?
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-50/80 sm:text-base">
                Share your challenge and objectives. We can discuss your
                requirements and determine appropriate next steps together.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-semibold text-[#071a3d] hover:bg-blue-50"
            >
              Contact our team <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
