"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { initializeTransaction, paystackConfigured } from "@/lib/payments/paystack";

export async function startCheckout(courseId: string) {
  const session = await auth();
  if (!session?.user) redirect(`/sign-in?callbackUrl=/training`);
  if (!paystackConfigured) {
    throw new Error("Payments are not configured in this environment yet.");
  }

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || course.status !== "published" || course.isFree) {
    throw new Error("This course is not available for paid checkout.");
  }

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  });
  if (existing) redirect(`/learn/${course.slug}`);

  const reference = randomUUID();
  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      status: "pending",
      totalMinor: course.priceMinor,
      currency: course.currency,
      gateway: "paystack",
      gatewayReference: reference,
      items: {
        create: { courseId: course.id, priceMinor: course.priceMinor, currency: course.currency },
      },
    },
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { authorizationUrl } = await initializeTransaction({
    email: session.user.email!,
    amountMinor: course.priceMinor,
    currency: course.currency,
    reference,
    callbackUrl: `${siteUrl}/orders/${order.id}`,
  });

  redirect(authorizationUrl);
}
