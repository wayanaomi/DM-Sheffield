/**
 * "Enum-like" string unions kept as Zod enums in the app layer because the
 * SQLite dev datasource has no native enum type (see prisma/schema.prisma).
 * These are the single source of truth for allowed values across the app.
 */
import { z } from "zod";

export const UserRole = z.enum([
  "learner",
  "instructor",
  "org_manager",
  "admin",
  "support",
]);
export type UserRole = z.infer<typeof UserRole>;

export const UserStatus = z.enum(["active", "disabled", "pending_verification"]);
export type UserStatus = z.infer<typeof UserStatus>;

export const CourseCategory = z.enum([
  "offshore_safety",
  "process_safety",
  "piping",
  "instrumentation",
  "hazop_risk",
]);
export type CourseCategory = z.infer<typeof CourseCategory>;

export const CourseLevel = z.enum(["beginner", "intermediate", "advanced"]);
export type CourseLevel = z.infer<typeof CourseLevel>;

export const CourseStatus = z.enum(["draft", "review", "published"]);
export type CourseStatus = z.infer<typeof CourseStatus>;

export const LessonType = z.enum(["video", "pdf", "rich_text", "quiz", "simulation"]);
export type LessonType = z.infer<typeof LessonType>;

export const EnrollmentSource = z.enum(["free", "purchase", "assignment"]);
export type EnrollmentSource = z.infer<typeof EnrollmentSource>;

export const EnrollmentStatus = z.enum(["active", "completed", "revoked"]);
export type EnrollmentStatus = z.infer<typeof EnrollmentStatus>;

export const OrderStatus = z.enum(["pending", "paid", "failed", "refunded"]);
export type OrderStatus = z.infer<typeof OrderStatus>;

export const CATEGORY_LABELS: Record<CourseCategory, string> = {
  offshore_safety: "Offshore Safety",
  process_safety: "Process Safety",
  piping: "Piping",
  instrumentation: "Instrumentation",
  hazop_risk: "HAZOP and Risk",
};

export const LEVEL_LABELS: Record<CourseLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  learner: "Learner",
  instructor: "Instructor",
  org_manager: "Organisation manager",
  admin: "Administrator",
  support: "Support agent",
};
