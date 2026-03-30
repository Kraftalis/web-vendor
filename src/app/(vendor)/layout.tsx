import { auth } from "@/lib/auth";
import { isOnboardingCompleted } from "@/repositories/user/onboarding-check";
import { redirect } from "next/navigation";

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Double check if the user is truly completed by looking for Business Profile & Packages
  const isCompleted = await isOnboardingCompleted(session.user.id);

  if (!isCompleted) {
    redirect("/onboarding");
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-white">
      {children}
    </div>
  );
}
