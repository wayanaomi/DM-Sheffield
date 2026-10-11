import { BookOpen, Award, Gauge, CheckCircle2 } from "lucide-react";
import { auth } from "@/auth";
import { Container } from "@/components/ui/container";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { CourseCard } from "@/components/courses/course-card";
import { getDashboardData } from "@/lib/data/dashboard";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  const data = await getDashboardData(session!.user.id);

  const tiles = [
    { icon: BookOpen, label: "Courses in progress", value: data.stats.coursesInProgress },
    { icon: CheckCircle2, label: "Courses completed", value: data.stats.coursesCompleted },
    { icon: Gauge, label: "Simulations completed", value: data.stats.simulationsCompleted },
    { icon: Award, label: "Certificates earned", value: data.stats.certificatesEarned },
  ];

  const hasAnyActivity =
    data.inProgress.length > 0 || data.completed.length > 0 || data.simulationAttempts.length > 0;

  return (
    <Container className="py-10">
      <h1 className="text-2xl font-semibold text-navy">
        {hasAnyActivity ? "Welcome back" : `Welcome, ${session!.user.name?.split(" ")[0] ?? "there"}`}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {hasAnyActivity
          ? "Here's where you left off."
          : "Let's get you started — enrol in a course or try the P&ID simulator."}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((tile) => (
          <Card key={tile.label}>
            <CardBody className="flex items-center gap-3">
              <tile.icon className="h-5 w-5 text-blue" />
              <div>
                <p className="text-xl font-semibold text-navy">{tile.value}</p>
                <p className="text-xs text-muted">{tile.label}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-navy">Continue learning</h2>
        {data.inProgress.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="No courses in progress"
              description="Browse the catalogue and enrol in your first course to see your progress here."
              action={<LinkButton href="/training">Browse training</LinkButton>}
            />
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {data.inProgress.map((enrollment) => (
              <Card key={enrollment.id}>
                <CardBody>
                  <p className="text-sm font-semibold text-navy">{enrollment.course.title}</p>
                  <div className="mt-3">
                    <ProgressBar percent={enrollment.completionPercent} />
                    <p className="mt-1 text-xs text-muted">{enrollment.completionPercent}% complete</p>
                  </div>
                  <LinkButton href={`/learn/${enrollment.course.slug}`} variant="secondary" className="mt-4 w-full">
                    Continue learning
                  </LinkButton>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="text-lg font-semibold text-navy">Simulator history</h2>
          {data.simulationAttempts.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title="No simulation runs yet"
                description="Try the P&ID simulator to practise operating a real process."
                action={<LinkButton href="/simulator">Open the simulator</LinkButton>}
              />
            </div>
          ) : (
            <Card className="mt-4">
              <ul className="divide-y divide-border">
                {data.simulationAttempts.map((attempt) => (
                  <li key={attempt.id} className="flex items-center justify-between px-5 py-3 text-sm">
                    <div>
                      <p className="font-medium text-ink">{attempt.scenario.title}</p>
                      <p className="text-xs text-muted">{formatDate(attempt.startedAt)}</p>
                    </div>
                    <span
                      className={
                        attempt.complete
                          ? attempt.passed
                            ? "text-xs font-medium text-signal-normal"
                            : "text-xs font-medium text-accent-red"
                          : "text-xs font-medium text-muted"
                      }
                    >
                      {attempt.complete ? (attempt.passed ? "Objectives met" : "Not completed") : "In progress"}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold text-navy">Certificates</h2>
          {data.certificates.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title="No certificates yet"
                description="Certificates are issued automatically once you complete a course's required lessons."
              />
            </div>
          ) : (
            <Card className="mt-4">
              <ul className="divide-y divide-border">
                {data.certificates.map((cert) => (
                  <li key={cert.id} className="flex items-center justify-between px-5 py-3 text-sm">
                    <div>
                      <p className="font-medium text-ink">{cert.enrollment.course.title}</p>
                      <p className="font-tag text-xs text-muted">{cert.publicId}</p>
                    </div>
                    <LinkButton href={`/certificates/${cert.publicId}`} variant="ghost">
                      View
                    </LinkButton>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </section>
      </div>

      {data.recommendedCourses.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-navy">Recommended for you</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.recommendedCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      ) : null}
    </Container>
  );
}
