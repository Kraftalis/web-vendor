"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function loginWithCredentials(
  _prevState: { error: string } | undefined,
  formData: FormData,
) {
  try {
    await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirectTo: "/vendor",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      // Check for email not verified (passed via cause)
      const causeMessage =
        error.cause && typeof error.cause === "object" && "err" in error.cause
          ? (error.cause.err as Error)?.message
          : "";

      if (causeMessage === "EMAIL_NOT_VERIFIED") {
        return {
          error:
            "Please verify your email before signing in. Check your inbox for the verification link.",
        };
      }

      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "Something went wrong. Please try again." };
      }
    }
    throw error;
  }
}

export async function loginWithGoogle() {
  await signIn("google", { redirectTo: "/vendor" });
}
