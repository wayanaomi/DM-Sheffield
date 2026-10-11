"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export async function markMessageReviewed(id: string) {
  await requireRole(await auth(), ["admin"]);
  await prisma.contactMessage.update({ where: { id }, data: { status: "reviewed" } });
  revalidatePath("/admin/contact-messages");
}
