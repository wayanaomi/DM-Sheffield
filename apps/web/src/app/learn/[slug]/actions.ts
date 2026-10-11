"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { checkAndIssueCertificate } from "@/lib/certificates";

export async function updateLessonProgress(
  enrollmentId: string,
  lessonId: string,
  input: { percent: number; lastPositionSeconds?: number; markComplete?: boolean }
) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const enrollment = await prisma.enrollment.findUnique({ where: { id: enrollmentId } });
  if (!enrollment || enrollment.userId !== session.user.id) {
    throw new Error("Enrollment not found");
  }

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) throw new Error("Lesson not found");

  const clampedPercent = Math.max(0, Math.min(100, input.percent));
  const shouldComplete =
    input.markComplete || clampedPercent >= lesson.completionThreshold * 100;

  const existing = await prisma.lessonProgress.findUnique({
    where: { enrollmentId_lessonId: { enrollmentId, lessonId } },
  });

  await prisma.lessonProgress.upsert({
    where: { enrollmentId_lessonId: { enrollmentId, lessonId } },
    create: {
      enrollmentId,
      lessonId,
      percent: clampedPercent,
      lastPositionSeconds: input.lastPositionSeconds ?? 0,
      completedAt: shouldComplete ? new Date() : null,
    },
    update: {
      percent: Math.max(clampedPercent, existing?.percent ?? 0),
      lastPositionSeconds: input.lastPositionSeconds ?? existing?.lastPositionSeconds ?? 0,
      completedAt: existing?.completedAt ?? (shouldComplete ? new Date() : null),
    },
  });

  await checkAndIssueCertificate(enrollmentId);
  revalidatePath("/dashboard");
  revalidatePath("/learn");
}
