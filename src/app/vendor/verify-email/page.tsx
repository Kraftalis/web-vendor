import Link from "next/link";
import { cookies } from "next/headers";
import {
  findValidVerificationToken,
  deleteVerificationToken,
} from "@/repositories/auth";
import { findUserByEmail, verifyUserEmail } from "@/repositories/user";
import { createAuditLog } from "@/repositories/audit";
import { getDictionary } from "@/i18n/get-dictionary";
import { defaultLocale, type Locale, locales } from "@/i18n/config";

export const metadata = {
  title: "Verify Email — Kraftalis",
  description: "Verify your email address",
};

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const { token } = await searchParams;

  // Load dictionary for server component
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value;
  const locale: Locale = locales.includes(localeCookie as Locale)
    ? (localeCookie as Locale)
    : defaultLocale;
  const dict = await getDictionary(locale);

  let status: "success" | "expired" | "invalid" = "invalid";

  if (token) {
    const record = await findValidVerificationToken(token);

    if (record) {
      const user = await findUserByEmail(record.email);

      if (user) {
        // Mark user email as verified and activate account
        await verifyUserEmail(user.id);

        // Clean up the token
        await deleteVerificationToken(token);

        // Audit log
        await createAuditLog({
          userId: user.id,
          action: "REGISTER",
          metadata: { event: "email_verified" },
        });

        status = "success";
      }
    } else {
      // Token was expired (already cleaned up by findValidVerificationToken)
      status = "expired";
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-slate-900">
          {dict.common.appName}
        </h1>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {status === "success" && (
            <>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-7 w-7 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="mb-2 text-xl font-bold text-slate-900">
                {dict.verifyEmail.emailVerified}
              </h2>
              <p className="mb-6 text-sm text-slate-500">
                {dict.verifyEmail.emailVerifiedDesc}
              </p>
              <Link
                href="/vendor/login"
                className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {dict.verifyEmail.signInToAccount}
              </Link>
            </>
          )}

          {status === "expired" && (
            <>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                <svg
                  className="h-7 w-7 text-amber-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
              </div>
              <h2 className="mb-2 text-xl font-bold text-slate-900">
                {dict.verifyEmail.linkExpired}
              </h2>
              <p className="mb-6 text-sm text-slate-500">
                {dict.verifyEmail.linkExpiredDesc}
              </p>
              <Link
                href="/vendor/signup"
                className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {dict.verifyEmail.signUpAgain}
              </Link>
            </>
          )}

          {status === "invalid" && (
            <>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-7 w-7 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="mb-2 text-xl font-bold text-slate-900">
                {dict.verifyEmail.invalidLink}
              </h2>
              <p className="mb-6 text-sm text-slate-500">
                {dict.verifyEmail.invalidLinkDesc}
              </p>
              <Link
                href="/vendor/signup"
                className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {dict.verifyEmail.signUpAgain}
              </Link>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-400">
          {dict.common.copyright}
        </p>
      </div>
    </div>
  );
}
