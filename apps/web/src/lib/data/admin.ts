import { prisma } from "@/lib/prisma";
import type { Session } from "next-auth";

export async function getAdminOverview(session: Session) {
  const isAdmin = session.user.role === "admin";
  const courseWhere = isAdmin ? {} : { createdById: session.user.id };

  const [totalCourses, publishedCourses, draftCourses, totalUsers, recentAuditLog] =
    await Promise.all([
      prisma.course.count({ where: courseWhere }),
      prisma.course.count({ where: { ...courseWhere, status: "published" } }),
      prisma.course.count({ where: { ...courseWhere, status: "draft" } }),
      isAdmin ? prisma.user.count() : Promise.resolve(null),
      isAdmin
        ? prisma.auditLog.findMany({
            orderBy: { createdAt: "desc" },
            take: 8,
            include: { actor: { select: { name: true, email: true } } },
          })
        : Promise.resolve([]),
    ]);

  return { totalCourses, publishedCourses, draftCourses, totalUsers, recentAuditLog };
}

export async function getCoursesForAdmin(session: Session) {
  const isAdmin = session.user.role === "admin";
  return prisma.course.findMany({
    where: isAdmin ? {} : { createdById: session.user.id },
    include: { modules: { include: { lessons: true } }, _count: { select: { enrollments: true } } },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getUsersForAdmin() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });
}

export async function getAuditLog() {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { actor: { select: { name: true, email: true } } },
  });
}
