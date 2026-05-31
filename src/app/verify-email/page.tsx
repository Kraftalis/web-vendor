"use client";

import { useState, useEffect, use } from "react";
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { Button } from "@/components/ui";

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token: string }>;
}) {
  const { token } = use(searchParams);
  const dict = use(getDictionary("id"));
  const [status, setStatus] = useState<
    "loading" | "success" | "expired" | "invalid"
  >("loading");

  useEffect(() => {
    async function verify() {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (res.ok) {
          setStatus("success");
        } else if (res.status === 410) {
          setStatus("expired");
        } else {
          setStatus("invalid");
        }
      } catch (error) {
        console.error(error);
        setStatus("invalid");
      }
    }

    if (token) {
      verify();
    } else {
      setStatus("invalid");
    }
  }, [token]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-slate-900">
          KRAFTALIS
        </h1>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {status === "success" && (
            <>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-7 w-7 text-green-600" />
              </div>
              <h2 className="mb-2 text-xl font-bold text-slate-900">
                {dict.verifyEmail.emailVerified}
              </h2>
              <p className="mb-6 text-sm text-slate-500">
                {dict.verifyEmail.emailVerifiedDesc}
              </p>
              <Button asChild className="w-full">
                <Link href="/login">
                  {dict.verifyEmail.signInToAccount}
                  <ArrowRight size={16} className="ml-2" />
                </Link>
              </Button>
            </>
          )}

          {status === "expired" && (
            <>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                <AlertCircle className="h-7 w-7 text-amber-600" />
              </div>
              <h2 className="mb-2 text-xl font-bold text-slate-900">
                {dict.verifyEmail.linkExpired}
              </h2>
              <p className="mb-6 text-sm text-slate-500">
                {dict.verifyEmail.linkExpiredDesc}
              </p>
              <Button asChild className="w-full">
                <Link href="/signup">
                  {dict.verifyEmail.signUpAgain}
                </Link>
              </Button>
            </>
          )}

          {status === "invalid" && (
            <>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-7 w-7 text-red-600" />
              </div>
              <h2 className="mb-2 text-xl font-bold text-slate-900">
                {dict.verifyEmail.invalidToken}
              </h2>
              <p className="mb-6 text-sm text-slate-500">
                {dict.verifyEmail.invalidTokenDesc}
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">
                  {dict.verifyEmail.backToLogin}
                </Link>
              </Button>
            </>
          )}

          {status === "loading" && (
            <div className="flex flex-col items-center py-4">
              <Loader2 className="mb-4 h-10 w-10 animate-spin text-blue-600" />
              <p className="text-sm font-medium text-slate-600">
                {dict.verifyEmail.verifying}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
