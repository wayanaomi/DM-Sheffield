import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireRole, canManageCourse } from "@/lib/rbac";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label, Input } from "@/components/ui/input";
import { CourseForm } from "../course-form";
import { AddLessonForm } from "../add-lesson-form";
import { addModule, setCourseStatus, updateCourse } from "../actions";

const statusTone = { draft: "neutral", review: "yellow", published: "success" } as const;

export default async function CourseManagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = requireRole(await auth(), ["admin", "instructor"]);

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } },
    },
  });
  if (!course || !canManageCourse(session, course)) notFound();

  const boundUpdate = updateCourse.bind(null, course.id);
  const boundAddModule = addModule.bind(null, course.id);

  return (
    <Container className="py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Badge tone={statusTone[course.status as keyof typeof statusTone] ?? "neutral"}>
            {course.status}
          </Badge>
          <h1 className="mt-2 text-2xl font-semibold text-navy">{course.title}</h1>
          <p className="text-xs text-muted">/training/{course.slug}</p>
        </div>
        <div className="flex gap-2">
          {course.status !== "review" ? (
            <form action={async () => { "use server"; await setCourseStatus(course.id, "review"); }}>
              <Button variant="secondary" type="submit">
                Send for review
              </Button>
            </form>
          ) : null}
          {course.status !== "published" ? (
            <form action={async () => { "use server"; await setCourseStatus(course.id, "published"); }}>
              <Button type="submit">Publish</Button>
            </form>
          ) : (
            <form action={async () => { "use server"; await setCourseStatus(course.id, "draft"); }}>
              <Button variant="danger" type="submit">
                Unpublish
              </Button>
            </form>
          )}
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section>
          <h2 className="text-lg font-semibold text-navy">Modules and lessons</h2>
          <div className="mt-4 space-y-4">
            {course.modules.map((module, idx) => (
              <div key={module.id} className="rounded-lg border border-border">
                <div className="border-b border-border bg-blue-50/50 px-4 py-2.5 text-sm font-semibold text-navy">
                  Module {idx + 1}: {module.title}
                </div>
                <ul className="divide-y divide-border">
                  {module.lessons.map((lesson) => (
                    <li key={lesson.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                      <span>{lesson.title}</span>
                      <Badge tone="blue">{lesson.type}</Badge>
                    </li>
                  ))}
                  {module.lessons.length === 0 ? (
                    <li className="px-4 py-2.5 text-sm text-muted">No lessons yet.</li>
                  ) : null}
                </ul>
                <div className="px-4 pb-4">
                  <AddLessonForm moduleId={module.id} />
                </div>
              </div>
            ))}
            {course.modules.length === 0 ? (
              <p className="text-sm text-muted">No modules yet — add the first one below.</p>
            ) : null}
          </div>

          <form action={boundAddModule} className="mt-4 flex items-end gap-2">
            <div className="flex-1">
              <Label htmlFor="title">New module title</Label>
              <Input id="title" name="title" required />
            </div>
            <Button type="submit" variant="secondary">
              Add module
            </Button>
          </form>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-navy">Course details</h2>
          <div className="mt-4">
            <CourseForm course={course} onSubmit={boundUpdate} />
          </div>
        </section>
      </div>
    </Container>
  );
}
