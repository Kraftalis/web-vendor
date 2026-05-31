import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginTemplate } from "@/templates/login";

export const metadata = {
  title: "Sign In — Kraftalis",
  description: "Sign in to your Kraftalis account",
};

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/");
  }

  return <LoginTemplate />;
}
