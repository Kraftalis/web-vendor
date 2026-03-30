import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ScheduleTemplate from "@/templates/schedule/schedule-template";

export default async function SchedulePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <ScheduleTemplate
      user={{
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
      }}
    />
  );
}
