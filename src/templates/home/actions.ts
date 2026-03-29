"use server";

import { signOut } from "@/lib/auth";
import { cookies } from "next/headers";

export async function handleSignOut() {
  const cookieStore = await cookies();
  cookieStore.delete("bp");
  await signOut({ redirectTo: "/login" });
}
