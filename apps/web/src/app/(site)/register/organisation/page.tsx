import Link from "next/link";
import { Container } from "@/components/ui/container";
import { CorporateRegisterForm } from "./corporate-register-form";

export const metadata = {
  title: "Register your organisation",
  description: "Create an organisation account for workforce training on DM Sheffield.",
};

export default function OrganisationRegisterPage() {
  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-lg rounded-lg border border-border p-8">
        <p className="text-sm font-medium text-blue">DM Sheffield for organisations</p>
        <h1 className="mt-2 text-2xl font-semibold text-navy">
          Register your organisation
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Create your organisation account to get started with workforce training,
          team learning and training records.
        </p>

        <div className="mt-6">
          <CorporateRegisterForm />
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-blue">
            Sign in
          </Link>
        </p>
        <p className="mt-3 text-center text-sm text-muted">
          Registering as an individual?{" "}
          <Link href="/register" className="font-medium text-blue">
            Create a learner account
          </Link>
        </p>
      </div>
    </Container>
  );
}
