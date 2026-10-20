"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

const corporateSchema = z.object({
  organisationName: z.string().trim().min(2, "Enter your organisation name").max(150),
  name: z.string().trim().min(2, "Enter your full name").max(100),
  email: z.string().trim().email("Enter a valid work email").transform((value) => value.toLowerCase()),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[0-9]/, "Include at least one number"),
});

export interface CorporateRegisterState {
  success?: boolean;
  errors?: Record<string, string>;
}

export async function corporateRegisterAction(
  _prev: CorporateRegisterState,
  formData: FormData
): Promise<CorporateRegisterState> {
  const parsed = corporateSchema.safeParse({
    organisationName: formData.get("organisationName"),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0]);
      if (!errors[field]) errors[field] = issue.message;
    }
    return { errors };
  }

  const { organisationName, name, email, password } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      return { errors: { email: "An account with this email already exists. Sign in or use another email." } };
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.$transaction(async (tx) => {
      const organisation = await tx.organisation.create({
        data: { name: organisationName },
      });

      const manager = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: "org_manager",
          status: "pending_verification",
        },
      });

      await tx.membership.create({
        data: {
          userId: manager.id,
          organisationId: organisation.id,
          role: "manager",
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: manager.id,
          action: "organisation.register",
          entityType: "Organisation",
          entityId: organisation.id,
        },
      });

      return manager;
    });

    const token = crypto.randomBytes(32).toString("hex");

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
    const verifyUrl = `${baseUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    await sendEmail({
      to: email,
      subject: "Verify your DM Sheffield organisation account",
      text: [
        `Welcome to DM Sheffield, ${name}.`,
        "",
        `Your organisation, ${organisationName}, has been registered.`,
        "",
        `Verify your email: ${verifyUrl}`,
        "",
        "This link expires in 24 hours.",
      ].join("\n"),
    });

    return { success: true };
  } catch (error) {
    console.error("Corporate registration failed:", error);
    return {
      errors: {
        general: "We couldn't complete registration. Please try again. If the problem continues, contact support.",
      },
    };
  }
}
