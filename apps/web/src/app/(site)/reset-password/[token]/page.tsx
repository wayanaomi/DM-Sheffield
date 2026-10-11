import { Container } from "@/components/ui/container";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata = { title: "Reset password" };

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <Container className="flex min-h-[60vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-lg border border-border p-8">
        <h1 className="text-xl font-semibold text-navy">Choose a new password</h1>
        <div className="mt-6">
          <ResetPasswordForm token={token} />
        </div>
      </div>
    </Container>
  );
}
