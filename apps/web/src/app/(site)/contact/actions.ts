"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  organisation: z.string().optional(),
  message: z.string().min(10, "Message should be at least 10 characters"),
});

export interface ContactFormState {
  success?: boolean;
  errors?: Record<string, string>;
}

export async function submitContactMessage(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    organisation: formData.get("organisation") || undefined,
    message: formData.get("message"),
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      errors[String(issue.path[0])] = issue.message;
    }
    return { errors };
  }

  await prisma.contactMessage.create({ data: parsed.data });
  return { success: true };
}
