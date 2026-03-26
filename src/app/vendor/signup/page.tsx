import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SignUpForm from "@/templates/signup/signup-form";

export const metadata = {
  title: "Sign Up — Kraftalis",
  description: "Create your Kraftalis account",
};

export default async function SignUpPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/vendor");
  }

  return <SignUpForm />;
}
