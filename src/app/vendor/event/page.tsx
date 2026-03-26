import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import EventListTemplate from "@/templates/event/event-list-template";

export default async function EventPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/vendor/login");
  }

  return (
    <EventListTemplate
      user={{
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
      }}
    />
  );
}
