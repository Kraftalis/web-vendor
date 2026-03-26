import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import FinanceTemplate from "@/templates/finance/finance-template";

// ─── Page ───────────────────────────────────────────────────

export default async function FinancePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/vendor/login");
  }

  return (
    <FinanceTemplate
      user={{
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
      }}
    />
  );
}
