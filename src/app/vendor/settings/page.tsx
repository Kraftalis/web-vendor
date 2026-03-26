import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SettingsTemplate from "@/templates/settings/settings-template";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/vendor/login");
  }

  return (
    <SettingsTemplate
      user={{
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
      }}
    />
  );
}
