"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";

export interface SignInFormState {
  error?: string;
}

export async function signInAction(
  _prev: SignInFormState,
  formData: FormData
): Promise<SignInFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const requestedCallback = String(formData.get("callbackUrl") ?? "").trim();

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true },
    });

    const defaultDestination =
      user?.role === "org_manager" ? "/organisation/dashboard" : "/dashboard";

    // Only accept local paths. Avoid open redirects and malformed callback URLs.
    const callbackIsLocal =
      requestedCallback.startsWith("/") && !requestedCallback.startsWith("//");

    const redirectTo =
      !callbackIsLocal || requestedCallback === "/dashboard"
        ? defaultDestination
        : requestedCallback;

    await signIn("credentials", {
      email,
      password: formData.get("password"),
      redirectTo,
    });

    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: "Invalid email or password, or your account is temporarily locked.",
      };
    }
    throw error;
  }
}
