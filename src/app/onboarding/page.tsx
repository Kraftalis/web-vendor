import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import OnboardingTemplate from "@/templates/onboarding/onboarding-template";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // The middleware handles redirecting completed users away from /onboarding
  // via the `bp` cookie. This page simply renders the onboarding wizard.
  return <OnboardingTemplate />;
}
