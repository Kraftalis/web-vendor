import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findBusinessProfile } from "@/repositories/user";
import OnboardingTemplate from "@/templates/onboarding/onboarding-template";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/vendor/login");
  }

  // If profile is already set up, set the bp cookie and redirect to home
  const profile = await findBusinessProfile(session.user.id);
  if (profile) {
    const cookieStore = await cookies();
    cookieStore.set("bp", "1", {
      path: "/",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    redirect("/vendor");
  }

  return <OnboardingTemplate />;
}
