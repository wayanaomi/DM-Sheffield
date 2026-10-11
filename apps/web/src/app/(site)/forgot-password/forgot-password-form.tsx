"use client";

import { useActionState } from "react";
import { Label, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { requestPasswordReset, type ForgotPasswordState } from "./actions";

const initialState: ForgotPasswordState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialState);

  if (state.submitted) {
    return (
      <div className="rounded-lg border border-border bg-blue-50/50 p-6 text-sm text-ink">
        If an account exists for that email, a reset link has been sent. In this
        development environment it is also logged to the server console.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
