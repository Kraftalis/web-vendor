"use client";

import { type FormEvent } from "react";
import Link from "next/link";
import { KraftalisLogo } from "@/components/icons";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import { useLoginMutation, useGoogleLoginMutation } from "@/hooks/auth";

export const LoginTemplate = () => {
  const loginMutation = useLoginMutation();
  const googleLoginMutation = useGoogleLoginMutation();

  const handleCredentialsSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Panel - Branding/Marketing (Hidden on mobile) */}
      <div className="hidden w-1/2 flex-col justify-between bg-slate-900 p-12 lg:flex xl:w-5/12 relative overflow-hidden">
        {/* Abstract background blobs for SaaS look */}
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl"></div>
        <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-white">
            <KraftalisLogo size={36} className="text-white" />
            <span className="text-2xl font-bold tracking-tight">Kraftalis</span>
          </div>
        </div>

        <div className="relative z-10 mb-12">
          <h2 className="text-4xl font-semibold text-white leading-tight">
            Kelola bisnis <br />
            vendor Anda dengan <br />
            <span className="text-blue-400">lebih efisien.</span>
          </h2>
          <p className="mt-6 text-lg text-slate-300 max-w-md">
            Satu platform terintegrasi untuk mengelola paket, jadwal, pemesanan,
            hingga keuangan bisnis vendor Anda.
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-slate-800 pt-6">
          <p className="text-sm text-slate-400">
            © 2026 Kraftalis. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-slate-400">
            <Link href="#" className="hover:text-white transition-colors">
              Bantuan
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Privasi
            </Link>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex w-full flex-col justify-center px-4 sm:px-6 md:px-8 lg:w-1/2 xl:w-7/12">
        <div className="mx-auto w-full max-w-sm sm:max-w-md">
          {/* Mobile Logo */}
          <div className="mb-8 flex flex-col lg:hidden">
            <KraftalisLogo size={48} className="mb-4 text-slate-900" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Selamat datang kembali
            </h1>
            <p className="mt-2 text-slate-500">
              Masuk ke akun Anda untuk melanjutkan
            </p>
          </div>

          {/* Desktop Heading */}
          <div className="hidden mb-10 lg:block">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Masuk ke akun
            </h1>
            <p className="mt-2 text-slate-500">
              Selamat datang kembali, masukkan kredensial Anda di bawah ini
            </p>
          </div>

          {/* Google OAuth */}
          <Button
            type="button"
            variant="outline"
            disabled={googleLoginMutation.isPending}
            onPress={() => googleLoginMutation.mutate()}
            className="w-full gap-3 rounded-xl border-slate-200 py-6 font-semibold shadow-sm hover:bg-slate-50"
          >
            {googleLoginMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Lanjutkan dengan Google
              </>
            )}
          </Button>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-slate-500">
                Atau masuk dengan email
              </span>
            </div>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleCredentialsSubmit} className="space-y-5">
            {/* Error Message */}
            {loginMutation.error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{loginMutation.error.message}</span>
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-900"
              >
                Alamat Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="nama@contoh.com"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 shadow-sm"
              />
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-900"
                >
                  Kata Sandi
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Lupa sandi?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 shadow-sm"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loginMutation.isPending}
              variant="primary"
              className="mt-2 w-full py-6 font-semibold"
            >
              {loginMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                  Sedang Masuk...
                </span>
              ) : (
                "Masuk ke Akun"
              )}
            </Button>
          </form>

          {/* Footer link to sign up */}
          <p className="mt-8 text-center text-sm text-slate-600">
            Belum punya akun?{" "}
            <Link
              href="/signup"
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Daftar sekarang
            </Link>
          </p>

          {/* Mobile Footer */}
          <div className="mt-12 flex justify-center gap-4 text-sm text-slate-400 lg:hidden">
            <Link href="#" className="hover:text-slate-600">
              Bantuan
            </Link>
            <Link href="#" className="hover:text-slate-600">
              Privasi
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
