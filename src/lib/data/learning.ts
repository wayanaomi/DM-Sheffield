import { prisma } from "@/lib/prisma";
import type { Course, Lesson, Module } from "@prisma/client";

export async function getEnrollmentForLearner(userId: string, slug: string) {
  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
    },
  });
  if (!course) return null;

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: course.id } },
    include: { progress: true },
  });
  if (!enrollment) return null;

  return { course, enrollment };
}

type CourseWithOutline = Course & { modules: (Module & { lessons: Lesson[] })[] };

/** Flat, ordered list of lessons with completion + lock state for sequential unlocking (CRS-5). */
export function buildLessonOutline(
  course: CourseWithOutline,
  progress: { lessonId: string; completedAt: Date | null; percent: number }[]
) {
  const completedIds = new Set(progress.filter((p) => p.completedAt).map((p) => p.lessonId));
  const flat = course.modules.flatMap((m) =>
    m.lessons.map((lesson) => ({ ...lesson, moduleTitle: m.title }))
  );

  let allPriorRequiredComplete = true;
  return flat.map((lesson) => {
    const completed = completedIds.has(lesson.id);
    const locked = course.sequentialUnlock && !allPriorRequiredComplete;
    if (lesson.required && !completed) allPriorRequiredComplete = false;
    return { ...lesson, completed, locked };
  });
}
