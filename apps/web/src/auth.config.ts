import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js config (no Prisma, no bcrypt — those are Node-only and
 * live in auth.ts). Imported by both auth.ts and middleware.ts.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const path = request.nextUrl.pathname;
      const protectedPrefixes = ["/dashboard", "/admin", "/instructor", "/organisation"];
      const isProtected = protectedPrefixes.some((p) => path.startsWith(p));
      if (!isProtected) return true;
      return isLoggedIn;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "learner";
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) ?? "learner";
      }
      return session;
    },
  },
};
