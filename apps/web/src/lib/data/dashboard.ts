import { prisma } from "@/lib/prisma";
import { getCourseCompletionPercent } from "@/lib/certificates";

export async function getDashboardData(userId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: true,
      certificate: true,
    },
    orderBy: { enrolledAt: "desc" },
  });

  const enrollmentsWithProgress = await Promise.all(
    enrollments.map(async (e) => ({
      ...e,
      completionPercent: await getCourseCompletionPercent(e.id),
    }))
  );

  const inProgress = enrollmentsWithProgress.filter((e) => e.status === "active");
  const completed = enrollmentsWithProgress.filter((e) => e.status === "completed");

  const certificates = await prisma.certificate.findMany({
    where: { userId, revokedAt: null },
    include: { enrollment: { include: { course: true } } },
    orderBy: { issuedAt: "desc" },
  });

  const simulationAttempts = await prisma.simulationAttempt.findMany({
    where: { userId },
    include: { scenario: true },
    orderBy: { startedAt: "desc" },
    take: 10,
  });

  const recentProgress = await prisma.lessonProgress.findMany({
    where: { enrollment: { userId } },
    include: { lesson: { include: { module: { include: { course: true } } } } },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId));
  const completedCategories = new Set(completed.map((e) => e.course.category));

  const recommended = await prisma.course.findMany({
    where: {
      status: "published",
      id: { notIn: Array.from(enrolledCourseIds) },
      ...(completedCategories.size > 0
        ? { category: { in: Array.from(completedCategories) } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  // Fall back to the newest published courses if there's nothing in matching categories.
  const recommendedCourses =
    recommended.length > 0
      ? recommended
      : await prisma.course.findMany({
          where: { status: "published", id: { notIn: Array.from(enrolledCourseIds) } },
          orderBy: { createdAt: "desc" },
          take: 3,
        });

  return {
    inProgress,
    completed,
    certificates,
    simulationAttempts,
    recentProgress,
    recommendedCourses,
    stats: {
      coursesInProgress: inProgress.length,
      simulationsCompleted: simulationAttempts.filter((a) => a.complete).length,
      certificatesEarned: certificates.length,
      coursesCompleted: completed.length,
    },
  };
}
