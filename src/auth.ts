import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import { sendEmail } from "@/lib/email";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const googleConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;
        if (user.status === "disabled") return null;

        const LOCKOUT_THRESHOLD = 5;
        const LOCKOUT_WINDOW_MS = 10 * 60 * 1000;
        if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
          return null;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          const withinWindow =
            user.lastFailedLoginAt &&
            Date.now() - user.lastFailedLoginAt.getTime() < LOCKOUT_WINDOW_MS;
          const attempts = (withinWindow ? user.failedLoginAttempts : 0) + 1;
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: attempts,
              lastFailedLoginAt: new Date(),
              lockedUntil:
                attempts >= LOCKOUT_THRESHOLD
                  ? new Date(Date.now() + LOCKOUT_WINDOW_MS)
                  : null,
            },
          });
          if (attempts >= LOCKOUT_THRESHOLD) {
            await sendEmail({
              to: user.email,
              subject: "DM Sheffield — unusual sign-in activity",
              text: `Your account was temporarily locked after ${attempts} failed sign-in attempts. If this wasn't you, reset your password.`,
            });
          }
          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { failedLoginAttempts: 0, lockedUntil: null },
        });
        await prisma.auditLog.create({
          data: { actorId: user.id, action: "auth.sign_in", entityType: "User", entityId: user.id },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
    ...(googleConfigured
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
});
