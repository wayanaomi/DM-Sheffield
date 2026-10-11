import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SignInForm } from "./sign-in-form";

export const metadata = { title: "Sign in" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-lg border border-border p-8">
        <h1 className="text-xl font-semibold text-navy">Sign in</h1>
        <p className="mt-1 text-sm text-muted">Welcome back to DM Sheffield.</p>
        <div className="mt-6">
          <SignInForm callbackUrl={callbackUrl} />
        </div>
        <p className="mt-4 text-center text-sm">
          <Link href="/forgot-password" className="text-blue font-medium">
            Forgot your password?
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-blue">
            Create one
          </Link>
        </p>
      </div>
    </Container>
  );
}
