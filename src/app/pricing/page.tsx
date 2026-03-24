import { redirect } from "next/navigation";

/**
 * Redirect /pricing → /finance (pricing is now a tab under finance).
 */
export default function PricingPage() {
  redirect("/finance");
}
