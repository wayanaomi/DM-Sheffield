"use client";

import { useActionState } from "react";
import { Label, Input, Textarea, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { submitContactMessage, type ContactFormState } from "./actions";

const initialState: ContactFormState = {};

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContactMessage, initialState);

  if (state.success) {
    return (
      <div className="rounded-lg border border-border bg-blue-50/50 p-6 text-sm text-ink">
        Thank you — your message has been received. Our team will get back to you shortly.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" required />
        <FieldError>{state.errors?.name}</FieldError>
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
        <FieldError>{state.errors?.email}</FieldError>
      </div>
      <div>
        <Label htmlFor="organisation">Organisation (optional)</Label>
        <Input id="organisation" name="organisation" />
      </div>
      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" rows={5} required />
        <FieldError>{state.errors?.message}</FieldError>
      </div>
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
