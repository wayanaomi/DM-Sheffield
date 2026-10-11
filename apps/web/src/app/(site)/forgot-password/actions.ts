"use server";

import { z } from "zod";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

const schema = z.object({ email: z.string().email() });

export interface ForgotPasswordState {
  submitted?: boolean;
}

export async function requestPasswordReset(
  _prev: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const parsed = schema.safeParse({ email: formData.get("email") });
  // Always report success, whether or not the email exists, to avoid account enumeration.
  if (!parsed.success) return { submitted: true };

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    });
    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/reset-password/${token}`;
    await sendEmail({
      to: user.email,
      subject: "Reset your DM Sheffield password",
      text: `Reset your password: ${resetUrl}\n\nThis link expires in 60 minutes. If you didn't request this, you can ignore this email.`,
    });
  }
  return { submitted: true };
}
