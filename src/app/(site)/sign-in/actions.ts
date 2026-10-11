"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export interface SignInFormState {
  error?: string;
}

export async function signInAction(
  _prev: SignInFormState,
  formData: FormData
): Promise<SignInFormState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: (formData.get("callbackUrl") as string) || "/dashboard",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password, or your account is temporarily locked." };
    }
    throw error;
  }
}
