import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CalendarDays,
  BookOpen,
  Workflow,
  Gauge,
  ClipboardCheck,
  Building2,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { CourseCard } from "@/components/courses/course-card";
import { EmptyState } from "@/components/ui/empty-state";
import { getFeaturedCourses } from "@/lib/data/courses";

const programmes = [
  {
    title: "Offshore safety",
    description:
      "Build foundational knowledge of offshore environments, hazards, emergency procedures and safety practices.",
    image: "/images/programmes/offshore-safety.jpg",
    href: "/training?category=offshore_safety",
  },
  {
    title: "Process safety & HAZOP",
    description:
      "Explore process hazards, deviation analysis, safeguards and the principles behind safer operations.",
    image: "/images/programmes/process-safety.jpg",
    href: "/training?category=process_safety",
  },
  {
    title: "Piping & instrumentation",
    description:
      "Understand P&ID symbols, process lines, valves, instruments and connected systems.",
    image: "/images/programmes/piping-instrumentation.jpg",
    href: "/training?category=piping",
  },
  {
    title: "Process operations",
    description:
      "Develop a clearer understanding of process systems, equipment and operational principles.",
    image: "/images/programmes/process-operations.jpg",
    href: "/training",
  },
  {
    title: "Inspection & maintenance",
    description:
      "Explore inspection methods, equipment integrity and maintenance practices.",
    image: "/images/programmes/inspection.jpg",
    href: "/training",
  },
  {
    title: "Risk & asset management",
    description:
      "Build knowledge of technical risk, safeguards and responsible asset management.",
    image: "/images/programmes/risk-management.jpg",
    href: "/training?category=hazop_risk",
  },
];

const learningFeatures = [
  {
    icon: BookOpen,
    title: "Structured learning",
    description:
      "Work through organised technical lessons and course materials at your own pace.",
  },
  {
    icon: Workflow,
    title: "Interactive P&ID simulator",
    description:
      "Explore process diagrams, operate valves and observe how changes affect process behaviour.",
  },
  {
    icon: ClipboardCheck,
    title: "Learning progress",
    description:
      "Keep track of learning progress and access completion records where available.",
  },
];

export default async function HomePage() {
  const featuredCourses = await getFeaturedCourses(8);

  return (
    <main className="bg-white text-navy">
      {/* Full-width photographic hero */}
      <section className="relative isolate min-h-[470px] overflow-hidden bg-navy sm:min-h-[540px] lg:min-h-[600px]">
        <Image
          src="/images/dm-sheffield-portrait.png"
          alt="DM Sheffield technical training"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_30%] sm:object-[center_35%] lg:object-[center_40%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071a3d]/95 via-[#071a3d]/80 to-[#071a3d]/30" />
        <div className="absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-blue via-white to-red-600" />

        <Container className="relative flex min-h-[470px] items-center py-16 sm:min-h-[540px] lg:min-h-[600px]">
          <div className="max-w-3xl text-white">
            <p className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-blue-100 sm:text-sm">
              DM Sheffield
              <span className="h-px w-12 bg-white/70" />
              Technical learning
            </p>

            <h1 className="max-w-3xl text-4xl font-light leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">
              Professional training for a safer, more capable energy industry
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-white/90 sm:text-lg sm:leading-8">
              Build practical knowledge in offshore safety, process safety,
              piping and instrumentation, and HAZOP through structured courses
              and an interactive P&amp;ID simulator.
            </p>

            <Link
              href="/training"
              className="mt-8 inline-flex min-h-12 items-center gap-8 bg-white px-6 py-3 text-sm font-semibold text-blue transition-colors hover:bg-blue-50"
            >
              Find training <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </Container>
      </section>

      {/* Six image-led programme cards */}
      <section className="py-12 sm:py-16">
        <Container>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue">
                Explore DM Sheffield
              </p>
              <h2 className="mt-2 text-2xl font-normal tracking-tight text-navy sm:text-3xl">
                Our training programmes
              </h2>
            </div>
            <Link
              href="/training"
              className="hidden shrink-0 items-center gap-2 text-sm font-semibold text-blue hover:underline sm:inline-flex"
            >
              View all programmes <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {programmes.map((programme) => (
              <article
                key={programme.title}
                className="group grid min-h-[205px] grid-cols-[36%_1fr] overflow-hidden border border-gray-200 bg-[#f1f1f1] transition-shadow hover:shadow-md"
              >
                <div className="relative min-h-full overflow-hidden bg-blue-50">
                  <Image
                    src={programme.image}
                    alt={programme.title}
                    fill
                    sizes="(max-width: 767px) 36vw, (max-width: 1279px) 20vw, 15vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-col items-start p-4 sm:p-5">
                  <h3 className="text-lg font-normal leading-snug text-blue sm:text-xl">
                    {programme.title}
                  </h3>
                  <p className="mt-3 text-sm leading-5 text-gray-700">
                    {programme.description}
                  </p>
                  <Link
                    href={programme.href}
                    className="mt-auto inline-flex items-center gap-2 bg-white px-4 py-2.5 text-xs font-semibold text-blue hover:bg-blue-50"
                  >
                    Read more <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <Link
            href="/training"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue hover:underline sm:hidden"
          >
            View all programmes <ArrowRight className="h-4 w-4" />
          </Link>
        </Container>
      </section>

      {/* Learning and simulator introduction */}
      <section className="border-y border-gray-200 bg-[#f7f8fa] py-12 sm:py-16">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue">
                Learning that connects to practice
              </p>
              <h2 className="mt-3 text-3xl font-normal leading-tight tracking-tight sm:text-4xl">
                Understand the process. Apply the knowledge.
              </h2>
            </div>
            <p className="max-w-2xl leading-7 text-gray-600 lg:justify-self-end">
              Develop technical understanding through structured course
              material and practical exploration of industrial process systems.
            </p>
          </div>

          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {learningFeatures.map((feature) => (
              <article
                key={feature.title}
                className="border border-gray-200 bg-white p-6"
              >
                <feature.icon className="h-7 w-7 text-blue" />
                <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-5 bg-blue p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-white/15">
                <Gauge className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  Explore the P&amp;ID simulator
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/85">
                  Explore process diagrams and see how valves and process
                  components influence system behaviour.
                </p>
              </div>
            </div>
            <Link
              href="/simulator"
              className="inline-flex shrink-0 items-center justify-center gap-2 bg-white px-5 py-3 text-sm font-semibold text-blue hover:bg-blue-50"
            >
              Open simulator <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Container>
      </section>

      {/* Upcoming classes: no invented schedule */}
      <section className="py-12 sm:py-16">
        <Container>
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-normal tracking-tight sm:text-3xl">
              Upcoming classes
            </h2>
            <Link
              href="/training"
              className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-blue hover:underline"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title: "Offshore safety",
                description: "Explore available offshore safety training.",
              },
              {
                title: "Process safety",
                description: "Discover process safety learning options.",
              },
              {
                title: "Piping & instrumentation",
                description: "Explore P&ID and instrumentation courses.",
              },
              {
                title: "HAZOP and risk",
                description: "Browse process hazard and risk learning.",
              },
            ].map((item) => (
              <Link
                key={item.title}
                href="/training"
                className="flex min-h-32 flex-col justify-between border border-gray-200 p-5 transition-colors hover:border-blue hover:bg-blue-50/40"
              >
                <CalendarDays className="h-5 w-5 text-blue" />
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {item.description}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-blue">
                    Browse training <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Real published courses */}
      <section className="border-t border-gray-200 py-12 sm:py-16">
        <Container>
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue">
                Continue learning
              </p>
              <h2 className="mt-2 text-2xl font-normal tracking-tight sm:text-3xl">
                Featured courses
              </h2>
            </div>
            <Link
              href="/training"
              className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-blue hover:underline"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {featuredCourses.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {featuredCourses.slice(0, 4).map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Courses are being prepared"
              description="Published courses will appear here when they are available."
            />
          )}
        </Container>
      </section>

      {/* Organisations call to action */}
      <section className="bg-[#f1f1f1] py-12 sm:py-16">
        <Container className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-white text-blue">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-normal tracking-tight sm:text-3xl">
                Training for organisations
              </h2>
              <p className="mt-3 max-w-2xl leading-7 text-gray-600">
                Explore technical learning options for teams and organisations
                working with industrial processes and safety.
              </p>
            </div>
          </div>
          <Link
            href="/organisations"
            className="inline-flex shrink-0 items-center gap-2 bg-blue px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            For organisations <ArrowRight className="h-4 w-4" />
          </Link>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="bg-blue py-12 text-white sm:py-14">
        <Container className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">
              DM Sheffield
            </p>
            <h2 className="mt-2 text-2xl font-normal sm:text-3xl">
              Ready to build your technical knowledge?
            </h2>
          </div>
          <Link
            href="/training"
            className="inline-flex shrink-0 items-center gap-3 bg-white px-6 py-3 text-sm font-semibold text-blue hover:bg-blue-50"
          >
            Find training <ArrowRight className="h-4 w-4" />
          </Link>
        </Container>
      </section>
    </main>
  );
}
