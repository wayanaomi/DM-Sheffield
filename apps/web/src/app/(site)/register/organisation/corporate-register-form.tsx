"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Label, Input, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  corporateRegisterAction,
  type CorporateRegisterState,
} from "./actions";

const initialState: CorporateRegisterState = {};

export function CorporateRegisterForm() {
  const [state, formAction, pending] = useActionState(
    corporateRegisterAction,
    initialState
  );

  if (state.success) {
    return (
      <div className="rounded-lg border border-border bg-blue-50/50 p-6 text-sm text-ink">
        <p className="font-medium text-navy">Check your email to verify your account.</p>
        <p className="mt-2 text-muted">
          We&apos;ve prepared a verification link for your organisation manager account.
          You must verify your email before signing in.
        </p>
        <p className="mt-2 text-muted">
          If you are running locally without SMTP, the link is logged in the development server console.
        </p>
        <Link href="/sign-in" className="mt-4 inline-block font-medium text-blue">
          Go to sign in →
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.errors?.general && (
        <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {state.errors.general}
        </p>
      )}

      <div>
        <Label htmlFor="organisationName">Organisation name</Label>
        <Input
          id="organisationName"
          name="organisationName"
          required
          minLength={2}
          maxLength={150}
          autoComplete="organization"
        />
        <FieldError>{state.errors?.organisationName}</FieldError>
      </div>

      <div>
        <Label htmlFor="name">Manager&apos;s full name</Label>
        <Input
          id="name"
          name="name"
          required
          minLength={2}
          maxLength={100}
          autoComplete="name"
        />
        <FieldError>{state.errors?.name}</FieldError>
      </div>

      <div>
        <Label htmlFor="email">Work email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
        <FieldError>{state.errors?.email}</FieldError>
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
        <FieldError>{state.errors?.password}</FieldError>
        <p className="mt-1 text-xs text-muted">
          At least 8 characters, including an uppercase letter and a number.
        </p>
      </div>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creating organisation account…" : "Register organisation"}
      </Button>
    </form>
  );
}
