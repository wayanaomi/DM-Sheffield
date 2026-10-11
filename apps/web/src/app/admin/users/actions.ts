"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { UserRole } from "@/lib/enums";

export async function changeUserRole(userId: string, role: string) {
  const session = requireRole(await auth(), ["admin"]);
  const parsedRole = UserRole.parse(role);
  await prisma.user.update({ where: { id: userId }, data: { role: parsedRole } });
  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: `user.role_changed.${parsedRole}`,
      entityType: "User",
      entityId: userId,
    },
  });
  revalidatePath("/admin/users");
}

export async function toggleUserStatus(userId: string, status: "active" | "disabled") {
  const session = requireRole(await auth(), ["admin"]);
  await prisma.user.update({ where: { id: userId }, data: { status } });
  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: `user.status_changed.${status}`,
      entityType: "User",
      entityId: userId,
    },
  });
  revalidatePath("/admin/users");
}
