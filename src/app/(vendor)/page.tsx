import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import HomeTemplate from "@/templates/home/home-template";

export default async function VendorDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <HomeTemplate
      user={{
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
      }}
    />
  );
}
