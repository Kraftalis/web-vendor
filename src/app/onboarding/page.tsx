import { auth } from "@/lib/auth";
import OnboardingTemplate from "@/templates/onboarding/onboarding-template";
import { redirect } from "next/navigation";
import { isOnboardingCompleted } from "@/repositories/user/onboarding-check";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session?.user?.id) {
    const isCompleted = await isOnboardingCompleted(session.user.id);
    if (isCompleted) {
      redirect("/");
    }
  }

  return <OnboardingTemplate />;
}
