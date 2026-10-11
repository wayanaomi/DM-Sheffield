import { prisma } from "@/lib/prisma";
import type { CourseCategory, CourseLevel } from "@/lib/enums";

export interface CatalogueFilters {
  category?: CourseCategory;
  level?: CourseLevel;
  free?: "free" | "paid";
  query?: string;
}

export async function getPublishedCourses(filters: CatalogueFilters = {}) {
  return prisma.course.findMany({
    where: {
      status: "published",
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.level ? { level: filters.level } : {}),
      ...(filters.free === "free" ? { isFree: true } : {}),
      ...(filters.free === "paid" ? { isFree: false } : {}),
      ...(filters.query
        ? {
            OR: [
              { title: { contains: filters.query } },
              { summary: { contains: filters.query } },
            ],
          }
        : {}),
    },
    include: { modules: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getFeaturedCourses(limit = 6) {
  return prisma.course.findMany({
    where: { status: "published" },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getCourseBySlug(slug: string) {
  return prisma.course.findUnique({
    where: { slug },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
      createdBy: { select: { name: true } },
    },
  });
}

export async function countPublishedCourses() {
  return prisma.course.count({ where: { status: "published" } });
}
