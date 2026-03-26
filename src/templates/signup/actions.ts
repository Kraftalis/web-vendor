"use server";

import { signIn } from "@/lib/auth";
import { hashSync } from "bcryptjs";
import { findUserByEmail, createUser } from "@/repositories/user";
import { createEmailVerificationToken } from "@/repositories/auth";
import { sendVerificationEmail } from "@/lib/email";
import { createAuditLog } from "@/repositories/audit";

export async function signUpWithCredentials(
  _prevState: { error?: string; success?: string } | undefined,
  formData: FormData,
) {
  try {
    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.toLowerCase().trim();
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // ─── Validation ──────────────────────────────────────────────
    if (!name || !email || !password || !confirmPassword) {
      return { error: "All fields are required." };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { error: "Please enter a valid email address." };
    }

    if (password.length < 8) {
      return { error: "Password must be at least 8 characters." };
    }

    if (password !== confirmPassword) {
      return { error: "Passwords do not match." };
    }

    // ─── Check existing user ─────────────────────────────────────
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return { error: "An account with this email already exists." };
    }

    // ─── Create user ─────────────────────────────────────────────
    const passwordHash = hashSync(password, 12);
    const user = await createUser({ name, email, passwordHash });

    // ─── Send verification email ─────────────────────────────────
    const verificationToken = await createEmailVerificationToken(email);
    await sendVerificationEmail(email, verificationToken.token, name);

    // ─── Audit log ───────────────────────────────────────────────
    await createAuditLog({
      userId: user.id,
      action: "REGISTER",
      metadata: { provider: "credentials" },
    });

    return {
      success:
        "Account created! Please check your email to verify your account.",
    };
  } catch (error) {
    console.error("[SignUp] Error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function signUpWithGoogle() {
  await signIn("google", { redirectTo: "/vendor" });
}
