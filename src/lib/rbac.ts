import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import type { UserRole } from "@/lib/enums";

/** Server-side RBAC guard — never rely on hiding a button as the only control. */
export function requireRole(session: Session | null, allowed: UserRole[]) {
  if (!session?.user) redirect("/sign-in");
  if (!allowed.includes(session.user.role as UserRole)) redirect("/dashboard");
  return session;
}

export function canManageCourse(session: Session, course: { createdById: string }) {
  return session.user.role === "admin" || session.user.id === course.createdById;
}
