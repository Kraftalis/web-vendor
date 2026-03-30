import { auth } from "@/lib/auth";
import { findUserById } from "@/repositories/user";
import { redirect } from "next/navigation";
import ProfileTemplate from "@/templates/profile/profile-template";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await findUserById(session.user.id);

  if (!user) {
    redirect("/login");
  }

  return (
    <ProfileTemplate
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      }}
    />
  );
}
