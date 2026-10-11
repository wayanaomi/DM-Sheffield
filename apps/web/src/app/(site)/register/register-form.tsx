"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Label, Input, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { registerAction, type RegisterFormState } from "./actions";

const initialState: RegisterFormState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  if (state.success) {
    return (
      <div className="rounded-lg border border-border bg-blue-50/50 p-6 text-sm text-ink">
        <p className="font-medium text-navy">Check your email to verify your account.</p>
        <p className="mt-2 text-muted">
          We&apos;ve sent a verification link. In this development environment, no SMTP
          provider is configured, so the link is also logged to the server console.
        </p>
        <Link href="/sign-in" className="mt-4 inline-block text-blue font-medium">
          Go to sign in →
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" required autoComplete="name" />
        <FieldError>{state.errors?.name}</FieldError>
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
        <FieldError>{state.errors?.email}</FieldError>
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required autoComplete="new-password" />
        <FieldError>{state.errors?.password}</FieldError>
        <p className="mt-1 text-xs text-muted">At least 8 characters, including a number and an uppercase letter.</p>
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
