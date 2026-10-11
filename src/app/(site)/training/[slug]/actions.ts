"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function enrollFreeCourse(courseId: string) {
  const session = await auth();
  if (!session?.user) {
    redirect(`/sign-in?callbackUrl=/training`);
  }

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || course.status !== "published") {
    throw new Error("This course is not available for enrolment.");
  }
  if (!course.isFree) {
    throw new Error("This course requires payment — free enrolment is not available.");
  }

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  });
  if (existing) {
    redirect(`/learn/${course.slug}`);
  }

  await prisma.enrollment.create({
    data: { userId: session.user.id, courseId, source: "free", status: "active" },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "enrollment.created",
      entityType: "Course",
      entityId: course.id,
    },
  });

  revalidatePath("/dashboard");
  redirect(`/learn/${course.slug}`);
}
