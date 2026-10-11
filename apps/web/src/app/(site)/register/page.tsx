import Link from "next/link";
import { Container } from "@/components/ui/container";
import { RegisterForm } from "./register-form";

export const metadata = { title: "Create an account" };

export default function RegisterPage() {
  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-lg border border-border p-8">
        <h1 className="text-xl font-semibold text-navy">Create your account</h1>
        <p className="mt-1 text-sm text-muted">
          Start learning with DM Sheffield — free courses, progress tracking and the P&amp;ID simulator.
        </p>
        <div className="mt-6">
          <RegisterForm />
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-blue">
            Sign in
          </Link>
        </p>
      </div>
    </Container>
  );
}
