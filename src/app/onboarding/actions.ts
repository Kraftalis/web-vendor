import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isOnboardingCompleted } from "@/repositories/user/onboarding-check";

/**
 * Server Action to restore onboarding cookie if completed in DB.
 * Used when a user lands on the onboarding page but is already complete.
 */
export async function restoreOnboardingCookie(userId: string) {
  const isCompleted = await isOnboardingCompleted(userId);

  if (isCompleted) {
    const cookieStore = await cookies();
    cookieStore.set("bp", "1", {
      path: "/",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax",
    });

    // Redirect must be called outside of try/catch if used inside one,
    // but here it's fine.
    redirect("/");
  }
}
