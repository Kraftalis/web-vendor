"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button, Input } from "@/components/ui";
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
} from "@/components/icons";
import { useDictionary } from "@/i18n";
import { useUpsertBusinessProfile } from "@/hooks/user";
import type { UpsertBusinessProfilePayload } from "@/hooks/user";

// ─── Component ──────────────────────────────────────────────

export default function OnboardingTemplate() {
  const router = useRouter();
  const { dict } = useDictionary();
  const o = dict.onboarding;
  const upsert = useUpsertBusinessProfile();

  // Form state
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

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Photo upload ─────────────────────────────────────
  const handleLogoChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Preview
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);

      // Upload via server (avoids CORS issues with direct S3 upload)
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

  // ─── Submit ───────────────────────────────────────────
  const handleSubmit = async () => {
    setError(null);

    if (!businessName.trim()) {
      setError(o.businessNameRequired);
      return;
    }

    // Filter empty social links
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
      router.push("/vendor");
      router.refresh();
    } catch {
      setError(o.saveError);
    }
  };

  // ─── Social link configs ──────────────────────────────
  const socialConfig = [
    {
      key: "instagram",
      label: "Instagram",
      icon: IconInstagram,
      placeholder: "@yourbusiness",
    },
    {
      key: "tiktok",
      label: "TikTok",
      icon: IconTiktok,
      placeholder: "@yourbusiness",
    },
    {
      key: "facebook",
      label: "Facebook",
      icon: IconFacebook,
      placeholder: "facebook.com/yourbusiness",
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      icon: IconLinkedin,
      placeholder: "linkedin.com/in/you",
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      icon: IconWhatsApp,
      placeholder: "+62812...",
    },
  ];

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
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent">
            <IconBriefcase size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{o.title}</h1>
          <p className="mt-2 text-sm text-(--text-secondary)">{o.subtitle}</p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-(--border) bg-white p-6 shadow-sm sm:p-8">
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
              {o.uploadLogo}
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
                {o.phoneLabel}
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
                  <Icon size={18} className="shrink-0 text-(--text-tertiary)" />
                  <Input
                    value={socialLinks[key] ?? ""}
                    onChange={(e) => handleSocialChange(key, e.target.value)}
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

          {/* Submit */}
          <Button
            variant="primary"
            className="w-full"
            onClick={handleSubmit}
            disabled={upsert.isPending || uploading}
          >
            {upsert.isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {o.saving}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <IconCheck size={16} />
                {o.completeSetup}
              </span>
            )}
          </Button>
        </div>

        {/* Footer note */}
        <p className="mt-4 text-center text-xs text-(--text-tertiary)">
          {o.canEditLater}
        </p>
      </div>
    </div>
  );
}
