"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Package, Plus, Check } from "lucide-react";

import { BusinessProfileStep } from "./steps/business-profile-step";
import { PackageStep } from "./steps/package-step";
import { AddonStep } from "./steps/addon-step";

const TOTAL_STEPS = 3;

export const OnboardingTemplate = () => {
  const router = useRouter();

  // ─── Step state ───────────────────────────────────────
  const [step, setStep] = useState(1);
  const [backToProfile, setBackToProfile] = useState(false);

  // ─── Auto-completion Check ────────────────────────────
  // If the user lands here but is technically already "complete" in the DB,
  // we check the status API and set the cookie / redirect if so.
  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch("/api/onboarding/complete");
        const json = await res.json();

        if (json.data?.complete) {
          // If already complete, call the POST to set the cookie and redirect
          await fetch("/api/onboarding/complete", { method: "POST" });
          router.replace("/");
          router.refresh();
        }
      } catch (err) {
        console.error("[Onboarding] Status check failed:", err);
      }
    }
    checkStatus();
  }, [router]);

  // ─── Step indicator ───────────────────────────────────
  const steps = [
    { label: "Profil Bisnis", desc: "Informasi dasar bisnis" },
    { label: "Paket Layanan", desc: "Buat paket layanan utama" },
    { label: "Add-on Tambahan", desc: "Layanan tambahan (opsional)" },
  ];

  const stepHeaders: Record<
    number,
    { icon: React.ReactNode; title: string; desc: string }
  > = {
    1: {
      icon: <Briefcase size={28} className="text-white" />,
      title: "Profil Bisnis",
      desc: "Lengkapi informasi dasar bisnis Anda",
    },
    2: {
      icon: <Package size={28} className="text-white" />,
      title: "Paket Layanan",
      desc: "Buat paket layanan utama bisnis Anda",
    },
    3: {
      icon: <Plus size={28} className="text-white" />,
      title: "Layanan Ekstra (Add-on)",
      desc: "Tambahkan opsi layanan tambahan",
    },
  };

  const header = stepHeaders[step];

  return (
    <div className="flex h-screen bg-white">
      {/* === LEFT PANE (Desktop Progress Tracker & Branding) === */}
      <div className="relative hidden w-2/5 flex-col justify-between overflow-hidden bg-slate-900 p-12 text-white lg:flex xl:w-1/3">
        {/* Decorative Background */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        </div>

        <div className="relative z-10 flex h-full flex-col">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-600/30">
              kV
            </div>
            <span className="text-xl font-bold tracking-tight">
              kraftVendor
            </span>
          </div>

          {/* Vertical Step Indicator */}
          <div className="mt-20 flex-1">
            <h2 className="mb-12 text-3xl font-semibold tracking-tight">
              Persiapan Akun
            </h2>
            <div className="relative space-y-10">
              {/* Connecting vertical line */}
              <div className="absolute bottom-8 left-6 top-8 w-px bg-slate-800" />

              {steps.map((s, i) => {
                const stepNum = i + 1;
                const isActive = step === stepNum;
                const isDone = step > stepNum;

                return (
                  <div
                    key={stepNum}
                    className="relative flex items-start gap-5"
                  >
                    {/* Circle indicator */}
                    <div
                      className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all duration-500 ${
                        isDone
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                          : isActive
                            ? "border-2 border-blue-500 bg-slate-900 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                            : "border-2 border-slate-700 bg-slate-800 text-slate-500"
                      }`}
                    >
                      {isDone ? <Check size={20} /> : stepNum}
                    </div>

                    {/* Text */}
                    <div className="flex flex-col pt-2.5">
                      <span
                        className={`text-lg font-medium transition-colors ${
                          isActive || isDone ? "text-white" : "text-slate-500"
                        }`}
                      >
                        {s.label}
                      </span>
                      <span
                        className={`mt-1 max-w-[200px] text-sm leading-relaxed transition-colors ${
                          isActive ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        {s.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-sm text-slate-500">
            © {new Date().getFullYear()} Kraftalis. Hak cipta dilindungi.
          </div>
        </div>
      </div>

      {/* === RIGHT PANE (Form content) === */}
      <div className="relative flex flex-1 flex-col overflow-y-auto">
        {/* Mobile Header / Progress (Hidden on Desktop) */}
        <div className="sticky top-0 z-20 flex w-full items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-md lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white shadow-md">
              kV
            </div>
            <span className="font-bold text-slate-900">kraftVendor</span>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
            Langkah {step} / {TOTAL_STEPS}
          </div>
        </div>

        {/* Minimal Scroll Content Container */}
        <div className="my-auto mx-auto flex w-full max-w-2xl flex-col px-6 py-10 sm:px-8 lg:py-16">
          {/* Main Header Content */}
          <div className="mb-10 text-left">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {header.title}
            </h1>
            <p className="mt-2 text-base text-slate-500">{header.desc}</p>
          </div>

          {/* Form Area (Rendering each step conditionally without wrapper card) */}
          <div className="w-full">
            <div
              className={
                step === 1
                  ? "block animate-in fade-in slide-in-from-right-8 duration-500"
                  : "hidden"
              }
            >
              <BusinessProfileStep
                onNext={() => {
                  setBackToProfile(false);
                  setStep(2);
                }}
                skipAutoSkip={backToProfile}
              />
            </div>

            <div
              className={
                step === 2
                  ? "block animate-in fade-in slide-in-from-right-8 duration-500"
                  : "hidden"
              }
            >
              <PackageStep
                onBack={() => {
                  setBackToProfile(true);
                  setStep(1);
                }}
                onNext={() => setStep(3)}
              />
            </div>

            <div
              className={
                step === 3
                  ? "block animate-in fade-in slide-in-from-right-8 duration-500"
                  : "hidden"
              }
            >
              <AddonStep onBack={() => setStep(2)} />
            </div>
          </div>

          {/* Settings note */}
          <p className="mt-10 text-left text-sm text-slate-400">
            Pengaturan ini dapat Anda ubah lewat Dashboard nanti.
          </p>
        </div>
      </div>
    </div>
  );
};
