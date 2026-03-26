import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "@/templates/login/login-form";

export const metadata = {
  title: "Sign In — Kraftalis",
  description: "Sign in to your Kraftalis account",
};

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/vendor");
  }

  return <LoginForm />;
}
