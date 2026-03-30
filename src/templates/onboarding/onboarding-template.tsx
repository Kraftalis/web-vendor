"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button, Input, Textarea, Select } from "@/components/ui";
import {
  IconBriefcase,
  IconCamera,
  IconMail,
  IconPhone,
  IconInstagram,
  IconTiktok,
  IconFacebook,
  IconLinkedin,
  IconWhatsApp,
  IconCheck,
  IconPackage,
  IconPlus,
  IconChevronRight,
  IconChevronLeft,
} from "@/components/icons";
import { useDictionary } from "@/i18n";
import { useUpsertBusinessProfile } from "@/hooks/user";
import {
  useCreatePackage,
  useCreateAddOn,
  useCategories,
} from "@/hooks/pricing";
import { useEventCategories } from "@/hooks";
import VariationEditor from "@/templates/pricing/variation-editor";
import type { UpsertBusinessProfilePayload } from "@/hooks/user";

// ─── Types ──────────────────────────────────────────────────

interface CreatedSummary {
  id: string;
  name: string;
  price: number;
}

interface Variation {
  label: string;
  description: string;
  price: string;
  inclusions: string;
}

const TOTAL_STEPS = 3;

// ─── Component ──────────────────────────────────────────────

export default function OnboardingTemplate() {
  const router = useRouter();
  const { dict } = useDictionary();
  const o = dict.onboarding;
  const pricing = dict.pricing;
  const upsert = useUpsertBusinessProfile();
  const createPkg = useCreatePackage();
  const createAddon = useCreateAddOn();
  const categoriesQuery = useCategories();
  const eventCategoriesQuery = useEventCategories();

  const categories = useMemo(
    () => categoriesQuery.data ?? [],
    [categoriesQuery.data],
  );
  const eventCategories = useMemo(
    () => eventCategoriesQuery.data ?? [],
    [eventCategoriesQuery.data],
  );
  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: c.id, label: c.name })),
    [categories],
  );
  const eventCategoryOptions = useMemo(
    () => eventCategories.map((c) => ({ value: c.id, label: c.name })),
    [eventCategories],
  );

  // ─── Step state ───────────────────────────────────────
  const [step, setStep] = useState(1);

  // ─── Step 1: Business Profile ─────────────────────────
  const [businessName, setBusinessName] = useState("");
  const [tagline, setTagline] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({
    instagram: "",
    tiktok: "",
    facebook: "",
    linkedin: "",
    whatsapp: "",
  });

  // ─── Step 2: Package (same fields as finance modal) ───
  const [createdPackages, setCreatedPackages] = useState<CreatedSummary[]>([]);
  const [pkgCatId, setPkgCatId] = useState("");
  const [pkgEventCatId, setPkgEventCatId] = useState("");
  const [pkgVariations, setPkgVariations] = useState<Variation[]>([]);
  const [pkgInclusions, setPkgInclusions] = useState("");
  const pkgFormRef = useRef<HTMLFormElement>(null);

  // ─── Step 3: Add-on ───────────────────────────────────
  const [createdAddOns, setCreatedAddOns] = useState<CreatedSummary[]>([]);
  const [addonName, setAddonName] = useState("");
  const [addonDescription, setAddonDescription] = useState("");
  const [addonPrice, setAddonPrice] = useState("");
  const [addonCurrency, setAddonCurrency] = useState("IDR");

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);

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

  // ─── Photo upload ─────────────────────────────────────
  const handleLogoChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "logos");

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Upload failed");

        setLogoUrl(json.data.publicUrl);
      } catch (err) {
        console.error("[Onboarding] Logo upload error:", err);
      } finally {
        setUploading(false);
      }
    },
    [],
  );

  // ─── Social link change ───────────────────────────────
  const handleSocialChange = (key: string, value: string) => {
    setSocialLinks((prev) => ({ ...prev, [key]: value }));
  };

  // ─── Variation helpers ────────────────────────────────
  const addVariation = () =>
    setPkgVariations((prev) => [
      ...prev,
      { label: "", description: "", price: "", inclusions: "" },
    ]);

  const updateVariation = (
    i: number,
    field: "label" | "description" | "price" | "inclusions",
    value: string,
  ) =>
    setPkgVariations((prev) =>
      prev.map((v, idx) => (idx === i ? { ...v, [field]: value } : v)),
    );

  const removeVariation = (i: number) =>
    setPkgVariations((prev) => prev.filter((_, idx) => idx !== i));

  // ─── Step 1 → Step 2 ─────────────────────────────────
  const handleNextToPackages = async () => {
    setError(null);

    if (!logoUrl) {
      setError(o.logoRequired);
      return;
    }
    if (!businessName.trim()) {
      setError(o.businessNameRequired);
      return;
    }
    if (!phoneNumber.trim()) {
      setError(o.phoneRequired);
      return;
    }

    const filteredSocials: Record<string, string> = {};
    for (const [key, val] of Object.entries(socialLinks)) {
      if (val.trim()) filteredSocials[key] = val.trim();
    }

    const payload: UpsertBusinessProfilePayload = {
      businessName: businessName.trim(),
      tagline: tagline.trim() || null,
      logoUrl,
      email: email.trim() || null,
      phoneNumber: phoneNumber.trim() || null,
      socialLinks:
        Object.keys(filteredSocials).length > 0 ? filteredSocials : null,
    };

    try {
      await upsert.mutateAsync(payload);
      setStep(2);
    } catch {
      setError(o.saveError);
    }
  };

  // ─── Save package (step 2) — reads from form + state ──
  const handleSavePackage = () => {
    setError(null);
    const form = pkgFormRef.current;
    if (!form) return;

    const fd = new FormData(form);
    const name = (fd.get("name") as string)?.trim();
    const description = (fd.get("description") as string)?.trim() || null;
    const currency = (fd.get("currency") as string)?.trim() || "IDR";
    const flatPriceStr = (fd.get("flatPrice") as string) || "0";

    if (!name) {
      setError(o.packageNameRequired);
      return;
    }

    const validVariations = pkgVariations.filter(
      (v) => v.label.trim() && v.price !== "",
    );

    if (
      validVariations.length === 0 &&
      (!flatPriceStr || Number(flatPriceStr) <= 0)
    ) {
      setError(o.packagePriceRequired);
      return;
    }

    const price =
      validVariations.length > 0
        ? Math.min(...validVariations.map((v) => parseFloat(v.price) || 0))
        : parseFloat(flatPriceStr) || 0;

    const inclusions = pkgInclusions
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    createPkg.mutate(
      {
        name,
        description,
        price,
        currency,
        categoryId: pkgCatId || null,
        eventCategoryId: pkgEventCatId || null,
        inclusions: validVariations.length === 0 ? inclusions : undefined,
        variations: validVariations.map((v, i) => ({
          label: v.label.trim(),
          description: v.description.trim() || null,
          price: parseFloat(v.price) || 0,
          sortOrder: i,
          inclusions: v.inclusions
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
        })),
      },
      {
        onSuccess: (result) => {
          setCreatedPackages((prev) => [
            ...prev,
            {
              id: result?.id ?? crypto.randomUUID(),
              name,
              price,
            },
          ]);
          // Reset form
          form.reset();
          setPkgCatId("");
          setPkgEventCatId("");
          setPkgInclusions("");
          setPkgVariations([]);
        },
        onError: () => setError(o.saveError),
      },
    );
  };

  // ─── Save add-on (step 3) ────────────────────────────
  const handleSaveAddOn = () => {
    setError(null);

    if (!addonName.trim()) {
      setError(pricing.addOnName + " is required.");
      return;
    }
    if (
      !addonPrice.trim() ||
      isNaN(Number(addonPrice)) ||
      Number(addonPrice) <= 0
    ) {
      setError(pricing.addOnPrice + " is required.");
      return;
    }

    createAddon.mutate(
      {
        name: addonName.trim(),
        description: addonDescription.trim() || null,
        price: parseFloat(addonPrice) || 0,
        currency: addonCurrency || "IDR",
      },
      {
        onSuccess: (result) => {
          setCreatedAddOns((prev) => [
            ...prev,
            {
              id: result?.id ?? crypto.randomUUID(),
              name: addonName.trim(),
              price: parseFloat(addonPrice) || 0,
            },
          ]);
          setAddonName("");
          setAddonDescription("");
          setAddonPrice("");
        },
        onError: () => setError(o.saveError),
      },
    );
  };

  // ─── Complete onboarding ──────────────────────────────
  const handleFinish = async () => {
    setFinishing(true);
    setError(null);

    try {
      const res = await fetch("/api/onboarding/complete", { method: "POST" });
      const json = await res.json();

      if (json.data?.complete) {
        router.push("/");
        router.refresh();
      } else {
        setError(o.saveError);
      }
    } catch {
      setError(o.saveError);
    } finally {
      setFinishing(false);
    }
  };

  // ─── Social link configs ──────────────────────────────
  const socialConfig = [
    { key: "instagram", icon: IconInstagram, placeholder: "@yourbusiness" },
    { key: "tiktok", icon: IconTiktok, placeholder: "@yourbusiness" },
    {
      key: "facebook",
      icon: IconFacebook,
      placeholder: "facebook.com/yourbusiness",
    },
    { key: "linkedin", icon: IconLinkedin, placeholder: "linkedin.com/in/you" },
    { key: "whatsapp", icon: IconWhatsApp, placeholder: "+62812..." },
  ];

  // ─── Step indicator ───────────────────────────────────
  const steps = [
    { label: o.stepBusinessProfile },
    { label: o.stepPackages },
    { label: o.stepAddOns },
  ];

  const stepHeaders: Record<
    number,
    { icon: React.ReactNode; title: string; desc: string }
  > = {
    1: {
      icon: <IconBriefcase size={28} className="text-white" />,
      title: o.stepBusinessProfile,
      desc: o.stepBusinessProfileDesc,
    },
    2: {
      icon: <IconPackage size={28} className="text-white" />,
      title: o.stepPackages,
      desc: o.stepPackagesDesc,
    },
    3: {
      icon: <IconPlus size={28} className="text-white" />,
      title: o.stepAddOns,
      desc: o.stepAddOnsDesc,
    },
  };

  const header = stepHeaders[step];

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50/60">
      {/* Decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute -top-24 -left-32 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-teal-400/20 blur-3xl" />
      </div>

      <div className="mx-auto flex w-full max-w-xl flex-col px-4 py-8 sm:py-16">
        {/* ─── Step Indicator ───────────────────────────── */}
        <div className="mb-8 flex items-center justify-center gap-3">
          {steps.map((s, i) => {
            const stepNum = i + 1;
            const isActive = step === stepNum;
            const isDone = step > stepNum;
            return (
              <div key={stepNum} className="flex items-center gap-3">
                {i > 0 && (
                  <div
                    className={`h-px w-8 transition-colors ${
                      isDone ? "bg-accent" : "bg-gray-300"
                    }`}
                  />
                )}
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                      isDone
                        ? "bg-accent text-white"
                        : isActive
                          ? "bg-accent text-white"
                          : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {isDone ? <IconCheck size={14} /> : stepNum}
                  </div>
                  <span
                    className={`hidden text-sm font-medium sm:inline ${
                      isActive || isDone
                        ? "text-foreground"
                        : "text-(--text-tertiary)"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── Header ───────────────────────────────────── */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent">
            {header.icon}
          </div>
          <h1 className="text-2xl font-bold text-foreground">{header.title}</h1>
          <p className="mt-2 text-sm text-(--text-secondary)">{header.desc}</p>
          <p className="mt-1 text-xs text-(--text-tertiary)">
            {o.step} {step} {o.of} {TOTAL_STEPS}
          </p>
        </div>

        {/* ─── Form Card ────────────────────────────────── */}
        <div className="rounded-2xl border border-(--border) bg-white p-6 shadow-sm sm:p-8">
          {/* ============ STEP 1: Business Profile ============ */}
          {step === 1 && (
            <>
              {/* Logo Upload */}
              <div className="mb-6 flex flex-col items-center">
                <label
                  htmlFor="logo-upload"
                  className="group relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-accent hover:bg-accent/5"
                >
                  {logoPreview ? (
                    <Image
                      src={logoPreview}
                      alt="Logo"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <IconCamera
                      size={28}
                      className="text-gray-400 group-hover:text-accent"
                    />
                  )}
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                    </div>
                  )}
                </label>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
                <p className="mt-2 text-xs text-(--text-tertiary)">
                  {o.uploadLogo} <span className="text-red-500">*</span>
                </p>
              </div>

              {/* Business Name */}
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  {o.businessNameLabel} <span className="text-red-500">*</span>
                </label>
                <Input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder={o.businessNamePlaceholder}
                />
              </div>

              {/* Tagline */}
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  {o.taglineLabel}
                </label>
                <Input
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder={o.taglinePlaceholder}
                />
              </div>

              {/* Contact Info */}
              <div className="mb-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <IconMail size={14} className="text-(--text-tertiary)" />
                    {o.emailLabel}
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={o.emailPlaceholder}
                  />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <IconPhone size={14} className="text-(--text-tertiary)" />
                    {o.phoneLabel} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder={o.phonePlaceholder}
                  />
                </div>
              </div>

              {/* Social Links */}
              <div className="mb-6">
                <p className="mb-3 text-sm font-medium text-foreground">
                  {o.socialLinksLabel}
                </p>
                <div className="space-y-3">
                  {socialConfig.map(({ key, icon: Icon, placeholder }) => (
                    <div key={key} className="flex items-center gap-3">
                      <Icon
                        size={18}
                        className="shrink-0 text-(--text-tertiary)"
                      />
                      <Input
                        value={socialLinks[key] ?? ""}
                        onChange={(e) =>
                          handleSocialChange(key, e.target.value)
                        }
                        placeholder={placeholder}
                        className="flex-1"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Next Button */}
              <Button
                variant="primary"
                className="w-full"
                onClick={handleNextToPackages}
                disabled={upsert.isPending || uploading}
              >
                {upsert.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {o.saving}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {o.next}
                    <IconChevronRight size={16} />
                  </span>
                )}
              </Button>
            </>
          )}

          {/* ============ STEP 2: Package ============ */}
          {step === 2 && (
            <>
              {/* Already created packages */}
              {createdPackages.length > 0 && (
                <div className="mb-6">
                  <p className="mb-2 text-xs font-medium text-(--text-secondary)">
                    {createdPackages.length} {o.packagesAdded}
                  </p>
                  <div className="space-y-2">
                    {createdPackages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="flex items-center justify-between rounded-xl border border-(--border) bg-gray-50 px-4 py-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">
                            {pkg.name}
                          </p>
                          <p className="text-xs text-(--text-tertiary)">
                            Rp {pkg.price.toLocaleString("id-ID")}
                          </p>
                        </div>
                        <IconCheck
                          size={16}
                          className="ml-3 shrink-0 text-green-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Package form — same fields as finance modal via <form> */}
              <form
                ref={pkgFormRef}
                className="space-y-4"
                onSubmit={(e) => e.preventDefault()}
              >
                <Input
                  name="name"
                  label={pricing.packageName}
                  placeholder={pricing.packageNamePlaceholder}
                  required
                />
                <Textarea
                  name="description"
                  label={pricing.packageDescription}
                  placeholder={pricing.packageDescPlaceholder}
                  rows={2}
                />
                <Input
                  name="currency"
                  label={pricing.currency}
                  defaultValue="IDR"
                  className="w-28"
                />

                {/* Variations */}
                <VariationEditor
                  variations={pkgVariations}
                  onAdd={addVariation}
                  onChange={updateVariation}
                  onRemove={removeVariation}
                  pricing={pricing}
                />

                {/* Category */}
                <Select
                  label="Category"
                  value={pkgCatId}
                  onChange={(e) => setPkgCatId(e.target.value)}
                  placeholder="Select category"
                  options={categoryOptions}
                />

                {/* Event Category */}
                <Select
                  label={pricing.eventCategory ?? "Event Category"}
                  value={pkgEventCatId}
                  onChange={(e) => setPkgEventCatId(e.target.value)}
                  placeholder={
                    pricing.selectEventCategory ?? "Select event category"
                  }
                  options={eventCategoryOptions}
                />

                {/* Inclusions — only when no variations */}
                {pkgVariations.length === 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {pricing.inclusionsTitle || "Includes"}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      Enter each inclusion on a new line.
                    </p>
                    <Textarea
                      value={pkgInclusions}
                      onChange={(e) => setPkgInclusions(e.target.value)}
                      placeholder={"e.g. 2 photographers\n3 hours coverage"}
                      rows={4}
                    />
                  </div>
                )}

                {/* Flat price — only when no variations */}
                {pkgVariations.length === 0 && (
                  <div>
                    <Input
                      name="flatPrice"
                      label={pricing.flatPrice}
                      type="number"
                      min="0"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-400">
                      {pricing.flatPriceHint}
                    </p>
                  </div>
                )}
                {pkgVariations.length > 0 && (
                  <input type="hidden" name="flatPrice" value="0" />
                )}
              </form>

              {/* Save package button */}
              <Button
                variant="outline"
                className="mt-6 w-full"
                onClick={handleSavePackage}
                disabled={createPkg.isPending}
              >
                {createPkg.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                    {o.creatingPackage}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <IconPlus size={16} />
                    {createdPackages.length === 0
                      ? o.addPackage
                      : o.addAnotherPackage}
                  </span>
                )}
              </Button>

              {/* Empty state hint */}
              {createdPackages.length === 0 && (
                <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center">
                  <IconPackage
                    size={32}
                    className="mx-auto mb-2 text-gray-300"
                  />
                  <p className="text-sm font-medium text-(--text-secondary)">
                    {o.noPackagesYet}
                  </p>
                  <p className="mt-1 text-xs text-(--text-tertiary)">
                    {o.noPackagesYetDesc}
                  </p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Navigation */}
              <div className="mt-6 flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => {
                    setError(null);
                    setStep(1);
                  }}
                >
                  <span className="flex items-center gap-2">
                    <IconChevronLeft size={16} />
                    {o.back}
                  </span>
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => {
                    setError(null);
                    setStep(3);
                  }}
                  disabled={createdPackages.length === 0}
                >
                  <span className="flex items-center gap-2">
                    {o.next}
                    <IconChevronRight size={16} />
                  </span>
                </Button>
              </div>

              <p className="mt-4 text-center text-xs text-(--text-tertiary)">
                {o.skipForNow}
              </p>
            </>
          )}

          {/* ============ STEP 3: Add-ons (optional) ============ */}
          {step === 3 && (
            <>
              {/* Already created add-ons */}
              {createdAddOns.length > 0 && (
                <div className="mb-6">
                  <p className="mb-2 text-xs font-medium text-(--text-secondary)">
                    {createdAddOns.length} {o.addOnsAdded}
                  </p>
                  <div className="space-y-2">
                    {createdAddOns.map((addon) => (
                      <div
                        key={addon.id}
                        className="flex items-center justify-between rounded-xl border border-(--border) bg-gray-50 px-4 py-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">
                            {addon.name}
                          </p>
                          <p className="text-xs text-(--text-tertiary)">
                            Rp {addon.price.toLocaleString("id-ID")}
                          </p>
                        </div>
                        <IconCheck
                          size={16}
                          className="ml-3 shrink-0 text-green-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add-on form — same fields as addon-modal */}
              <div className="space-y-4">
                <Input
                  label={pricing.addOnName}
                  value={addonName}
                  onChange={(e) => setAddonName(e.target.value)}
                  placeholder={pricing.addOnNamePlaceholder}
                  required
                />
                <Textarea
                  label={pricing.addOnDescription}
                  value={addonDescription}
                  onChange={(e) => setAddonDescription(e.target.value)}
                  placeholder={pricing.addOnDescPlaceholder}
                  rows={2}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label={pricing.addOnPrice}
                    type="number"
                    min="0"
                    value={addonPrice}
                    onChange={(e) => setAddonPrice(e.target.value)}
                    required
                  />
                  <Input
                    label={pricing.currency}
                    value={addonCurrency}
                    onChange={(e) => setAddonCurrency(e.target.value)}
                  />
                </div>
              </div>

              {/* Save add-on button */}
              <Button
                variant="outline"
                className="mt-6 w-full"
                onClick={handleSaveAddOn}
                disabled={createAddon.isPending}
              >
                {createAddon.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                    {o.creatingPackage}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <IconPlus size={16} />
                    {pricing.addAddOn}
                  </span>
                )}
              </Button>

              {/* Error */}
              {error && (
                <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Navigation */}
              <div className="mt-6 flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => {
                    setError(null);
                    setStep(2);
                  }}
                >
                  <span className="flex items-center gap-2">
                    <IconChevronLeft size={16} />
                    {o.back}
                  </span>
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleFinish}
                  disabled={finishing}
                >
                  {finishing ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      {o.saving}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <IconCheck size={16} />
                      {o.finishSetup}
                    </span>
                  )}
                </Button>
              </div>

              <p className="mt-4 text-center text-xs text-(--text-tertiary)">
                {o.addOnsOptionalHint}
              </p>
            </>
          )}
        </div>

        {/* Footer note */}
        <p className="mt-4 text-center text-xs text-(--text-tertiary)">
          {o.canEditLater}
        </p>
      </div>
    </div>
  );
}
