"use server";

import { signOut } from "@/lib/auth";
import { cookies } from "next/headers";
import { locales, type Locale } from "@/i18n/config";

/**
 * Server action for signing out from the profile dropdown.
 * Redirects to the login page after sign out.
 */
export async function handleSignOut() {
  await signOut({ redirectTo: "/vendor/login" });
}

/**
 * Server action to set the NEXT_LOCALE cookie.
 * Called by the LanguageSwitcher component.
 */
export async function setLocaleCookie(locale: string) {
  if (!locales.includes(locale as Locale)) return;
  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });
}
