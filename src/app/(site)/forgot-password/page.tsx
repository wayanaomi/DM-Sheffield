import { Container } from "@/components/ui/container";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <Container className="flex min-h-[60vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-lg border border-border p-8">
        <h1 className="text-xl font-semibold text-navy">Reset your password</h1>
        <p className="mt-1 text-sm text-muted">
          Enter your account email and we&apos;ll send a reset link.
        </p>
        <div className="mt-6">
          <ForgotPasswordForm />
        </div>
      </div>
    </Container>
  );
}
