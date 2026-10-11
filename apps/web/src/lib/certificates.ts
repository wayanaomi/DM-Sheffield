/**
 * Certificate issuance (CERT-1/2/3). Per the later client decision (see
 * docs/DECISIONS.md), certification is based on lesson completion only by
 * default — a course can opt into requiring a passed assessment via
 * Course.requireAssessmentPass, but formal grading is not part of the
 * standard workflow.
 */
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

function generatePublicId(): string {
  const token = randomBytes(6).toString("hex").toUpperCase();
  return `DMS-CERT-${token}`;
}

export async function getCourseCompletionPercent(enrollmentId: string): Promise<number> {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      course: { include: { modules: { include: { lessons: true } } } },
      progress: true,
    },
  });
  if (!enrollment) return 0;

  const requiredLessons = enrollment.course.modules.flatMap((m) =>
    m.lessons.filter((l) => l.required)
  );
  if (requiredLessons.length === 0) return 0;

  const completedIds = new Set(
    enrollment.progress.filter((p) => p.completedAt).map((p) => p.lessonId)
  );
  const completedCount = requiredLessons.filter((l) => completedIds.has(l.id)).length;
  return Math.round((completedCount / requiredLessons.length) * 100);
}

/**
 * Called after any lesson progress update. Marks the enrollment complete and
 * issues a certificate once every required lesson is done (and, if the course
 * requires it, at least one passed assessment attempt exists). Idempotent —
 * safe to call repeatedly.
 */
export async function checkAndIssueCertificate(enrollmentId: string): Promise<void> {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { course: true, certificate: true, user: true },
  });
  if (!enrollment || enrollment.certificate) return;

  const percent = await getCourseCompletionPercent(enrollmentId);
  if (percent < 100) return;

  if (enrollment.course.requireAssessmentPass) {
    const passedAttempt = await prisma.attempt.findFirst({
      where: {
        userId: enrollment.userId,
        passed: true,
        assessment: { courseId: enrollment.courseId },
      },
    });
    if (!passedAttempt) return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.enrollment.update({
      where: { id: enrollmentId },
      data: { status: "completed", completedAt: new Date() },
    });

    if (!enrollment.course.certificateEnabled) return;

    const expiresAt = enrollment.course.certificateValidMonths
      ? new Date(Date.now() + enrollment.course.certificateValidMonths * 30 * 24 * 60 * 60 * 1000)
      : null;

    await tx.certificate.create({
      data: {
        publicId: generatePublicId(),
        enrollmentId,
        userId: enrollment.userId,
        expiresAt,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: enrollment.userId,
        action: "certificate.issued",
        entityType: "Enrollment",
        entityId: enrollmentId,
      },
    });
  });
}

export interface CertificateVerification {
  valid: boolean;
  reason?: "not_found" | "revoked" | "expired";
  learnerName?: string;
  courseTitle?: string;
  issuedAt?: Date;
  expiresAt?: Date | null;
}

/** Public verification lookup — exposes only the minimal fields needed (PRD CERT-3). */
export async function verifyCertificate(publicId: string): Promise<CertificateVerification> {
  const certificate = await prisma.certificate.findUnique({
    where: { publicId },
    include: { user: true, enrollment: { include: { course: true } } },
  });
  if (!certificate) return { valid: false, reason: "not_found" };
  if (certificate.revokedAt) return { valid: false, reason: "revoked" };
  if (certificate.expiresAt && certificate.expiresAt.getTime() < Date.now()) {
    return { valid: false, reason: "expired" };
  }
  return {
    valid: true,
    learnerName: certificate.user.name,
    courseTitle: certificate.enrollment.course.title,
    issuedAt: certificate.issuedAt,
    expiresAt: certificate.expiresAt,
  };
}
