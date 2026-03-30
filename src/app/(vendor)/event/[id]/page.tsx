import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import EventDetailTemplate from "@/templates/event/event-detail-template";

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  return (
    <EventDetailTemplate
      user={{
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
      }}
      eventId={id}
    />
  );
}
