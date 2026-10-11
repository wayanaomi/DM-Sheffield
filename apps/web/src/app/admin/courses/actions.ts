"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireRole, canManageCourse } from "@/lib/rbac";
import { slugify } from "@/lib/slug";
import { CourseCategory, CourseLevel } from "@/lib/enums";

const courseSchema = z.object({
  title: z.string().min(3),
  summary: z.string().min(10),
  description: z.string().optional().default(""),
  category: CourseCategory,
  level: CourseLevel,
  isFree: z.coerce.boolean(),
  priceMinor: z.coerce.number().int().min(0).default(0),
  currency: z.string().default("NGN"),
  certificateEnabled: z.coerce.boolean(),
  requireAssessmentPass: z.coerce.boolean(),
  sequentialUnlock: z.coerce.boolean(),
});

async function logAction(actorId: string, action: string, entityType: string, entityId: string) {
  await prisma.auditLog.create({ data: { actorId, action, entityType, entityId } });
}

export async function createCourse(formData: FormData) {
  const session = requireRole(await auth(), ["admin", "instructor"]);
  const parsed = courseSchema.parse(Object.fromEntries(formData));

  let slug = slugify(parsed.title);
  const existing = await prisma.course.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

  const course = await prisma.course.create({
    data: { ...parsed, slug, createdById: session.user.id },
  });
  await logAction(session.user.id, "course.created", "Course", course.id);
  revalidatePath("/admin/courses");
  redirect(`/admin/courses/${course.id}`);
}

export async function updateCourse(courseId: string, formData: FormData) {
  const session = requireRole(await auth(), ["admin", "instructor"]);
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || !canManageCourse(session, course)) throw new Error("Not permitted");

  const parsed = courseSchema.parse(Object.fromEntries(formData));
  await prisma.course.update({ where: { id: courseId }, data: parsed });
  await logAction(session.user.id, "course.updated", "Course", courseId);
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/training");
}

export async function setCourseStatus(courseId: string, status: "draft" | "review" | "published") {
  const session = requireRole(await auth(), ["admin", "instructor"]);
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || !canManageCourse(session, course)) throw new Error("Not permitted");

  await prisma.course.update({ where: { id: courseId }, data: { status } });
  await logAction(session.user.id, `course.status_changed.${status}`, "Course", courseId);
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/training");
  revalidatePath("/");
}

export async function addModule(courseId: string, formData: FormData) {
  const session = requireRole(await auth(), ["admin", "instructor"]);
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || !canManageCourse(session, course)) throw new Error("Not permitted");

  const title = z.string().min(1).parse(formData.get("title"));
  const count = await prisma.module.count({ where: { courseId } });
  await prisma.module.create({ data: { courseId, title, order: count } });
  revalidatePath(`/admin/courses/${courseId}`);
}

const lessonSchema = z.object({
  title: z.string().min(1),
  type: z.enum(["video", "pdf", "rich_text", "quiz", "simulation"]),
  required: z.coerce.boolean(),
  content: z.string().optional().default(""),
  scenarioKey: z.string().optional().default(""),
});

export async function addLesson(moduleId: string, formData: FormData) {
  const session = requireRole(await auth(), ["admin", "instructor"]);
  const module_ = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { course: true },
  });
  if (!module_ || !canManageCourse(session, module_.course)) throw new Error("Not permitted");

  const parsed = lessonSchema.parse(Object.fromEntries(formData));
  const count = await prisma.lesson.count({ where: { moduleId } });
  await prisma.lesson.create({
    data: {
      moduleId,
      title: parsed.title,
      type: parsed.type,
      required: parsed.required,
      content: parsed.content,
      scenarioKey: parsed.scenarioKey || null,
      order: count,
    },
  });
  revalidatePath(`/admin/courses/${module_.courseId}`);
}
