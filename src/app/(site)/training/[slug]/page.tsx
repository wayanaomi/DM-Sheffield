import { notFound } from "next/navigation";
import { CheckCircle2, Clock, FileText, PlayCircle, Beaker, HelpCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/button";
import { getCourseBySlug } from "@/lib/data/courses";
import { formatPrice } from "@/lib/format";
import { CATEGORY_LABELS, LEVEL_LABELS, type CourseCategory, type CourseLevel } from "@/lib/enums";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { enrollFreeCourse } from "./actions";

const lessonIcon: Record<string, typeof PlayCircle> = {
  video: PlayCircle,
  pdf: FileText,
  rich_text: FileText,
  quiz: HelpCircle,
  simulation: Beaker,
};

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course || course.status !== "published") notFound();

  const session = await auth();
  const enrollment = session?.user
    ? await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
      })
    : null;

  const lessonCount = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);

  return (
    <Container className="py-12">
      <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <Badge tone="blue">{CATEGORY_LABELS[course.category as CourseCategory] ?? course.category}</Badge>
          <h1 className="mt-3 text-3xl font-semibold text-navy">{course.title}</h1>
          <p className="mt-3 text-lg text-muted leading-relaxed">{course.summary}</p>

          <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> {LEVEL_LABELS[course.level as CourseLevel] ?? course.level}
            </span>
            <span>{course.modules.length} modules · {lessonCount} lessons</span>
            {course.certificateEnabled ? (
              <span className="inline-flex items-center gap-1.5 text-signal-normal">
                <CheckCircle2 className="h-4 w-4" /> Certificate on completion
              </span>
            ) : null}
          </div>

          {course.description ? (
            <div className="prose prose-sm mt-8 max-w-none text-ink">
              <h2 className="text-lg font-semibold text-navy">Overview</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink">
                {course.description}
              </p>
            </div>
          ) : null}

          <div className="mt-10">
            <h2 className="text-lg font-semibold text-navy">Syllabus</h2>
            {course.modules.length === 0 ? (
              <p className="mt-3 text-sm text-muted">
                The syllabus for this course is still being prepared.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {course.modules.map((module, idx) => (
                  <div key={module.id} className="rounded-lg border border-border">
                    <div className="border-b border-border bg-blue-50/50 px-4 py-2.5 text-sm font-semibold text-navy">
                      Module {idx + 1}: {module.title}
                    </div>
                    <ul className="divide-y divide-border">
                      {module.lessons.map((lesson) => {
                        const Icon = lessonIcon[lesson.type] ?? FileText;
                        return (
                          <li key={lesson.id} className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink">
                            <Icon className="h-4 w-4 flex-none text-muted" />
                            {lesson.title}
                            {!lesson.required ? (
                              <span className="ml-auto text-xs text-muted">Optional</span>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="sticky top-24 rounded-lg border border-border p-6">
            <p className="text-2xl font-semibold text-navy">
              {formatPrice(course.priceMinor, course.currency)}
            </p>
            <p className="mt-1 text-xs text-muted">
              Instructor: {course.createdBy?.name ?? "DM Sheffield"}
            </p>

            {enrollment ? (
              <LinkButton href={`/learn/${course.slug}`} className="mt-5 w-full">
                Continue learning
              </LinkButton>
            ) : course.isFree ? (
              <form
                action={async () => {
                  "use server";
                  await enrollFreeCourse(course.id);
                }}
              >
                <Button type="submit" className="mt-5 w-full">
                  Enrol for free
                </Button>
              </form>
            ) : (
              <LinkButton href={`/checkout/${course.slug}`} className="mt-5 w-full">
                Proceed to checkout
              </LinkButton>
            )}

            <ul className="mt-6 space-y-2 text-sm text-muted">
              <li>Formats: {Array.from(new Set(course.modules.flatMap((m) => m.lessons.map((l) => l.type)))).join(", ") || "To be confirmed"}</li>
              <li>Certificate: {course.certificateEnabled ? "Issued on completion" : "Not issued for this course"}</li>
            </ul>
          </div>
        </div>
      </div>
    </Container>
  );
}
