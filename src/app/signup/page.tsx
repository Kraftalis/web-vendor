import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignupTemplate } from "@/templates/signup";

export const metadata = {
  title: "Sign Up — Kraftalis",
  description: "Create your Kraftalis account",
};

export default async function SignUpPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/");
  }

  return <SignupTemplate />;
}
