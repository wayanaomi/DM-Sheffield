"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

const registerSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[0-9]/, "Include at least one number"),
});

export interface RegisterFormState {
  success?: boolean;
  errors?: Record<string, string>;
}

export async function registerAction(
  _prev: RegisterFormState,
  formData: FormData
): Promise<RegisterFormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] = issue.message;
    return { errors };
  }

  const { name, email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { errors: { email: "An account with this email already exists." } };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: "learner", status: "pending_verification" },
  });

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: { identifier: email, token, expires: new Date(Date.now() + 24 * 60 * 60 * 1000) },
  });

  const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
  await sendEmail({
    to: email,
    subject: "Verify your DM Sheffield account",
    text: `Welcome to DM Sheffield, ${name}.\n\nVerify your email: ${verifyUrl}\n\nThis link expires in 24 hours.`,
  });

  await prisma.auditLog.create({
    data: { actorId: user.id, action: "auth.register", entityType: "User", entityId: user.id },
  });

  return { success: true };
}
