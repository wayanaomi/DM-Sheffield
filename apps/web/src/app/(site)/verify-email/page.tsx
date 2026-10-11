import Link from "next/link";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Verify email" };

async function verify(token?: string, email?: string) {
  if (!token || !email) return false;
  const record = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier: email, token } },
  });
  if (!record || record.expires.getTime() < Date.now()) return false;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return false;

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date(), status: "active" },
  });
  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier: email, token } },
  });
  return true;
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const { token, email } = await searchParams;
  const verified = await verify(token, email);

  return (
    <Container className="flex min-h-[60vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-lg border border-border p-8 text-center">
        {verified ? (
          <>
            <h1 className="text-xl font-semibold text-navy">Email verified</h1>
            <p className="mt-2 text-sm text-muted">
              Your account is now fully active. You can sign in and enrol in paid courses.
            </p>
            <LinkButton href="/sign-in" className="mt-6">
              Sign in
            </LinkButton>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-navy">Link invalid or expired</h1>
            <p className="mt-2 text-sm text-muted">
              This verification link is invalid or has expired. Please sign in and request a new
              one, or <Link href="/contact" className="text-blue font-medium">contact support</Link>.
            </p>
          </>
        )}
      </div>
    </Container>
  );
}
