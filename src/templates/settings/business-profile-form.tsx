"use client";

import Image from "next/image";
import { Button, Input, Skeleton } from "@/components/ui";
import {
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
import { useBusinessProfileForm } from "./use-business-profile-form";

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

export const BusinessProfileForm = () => {
  const {
    isLoading,
    businessName,
    setBusinessName,
    tagline,
    setTagline,
    logoPreview,
    email,
    setEmail,
    phoneNumber,
    setPhoneNumber,
    socialLinks,
    uploading,
    error,
    success,
    isPending,
    handleLogoChange,
    handleSocialChange,
    handleSubmit,
  } = useBusinessProfileForm();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center">
          <Skeleton className="h-24 w-24 rounded-full" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Logo Upload */}
      <div className="flex flex-col items-center">
        <label
          htmlFor="settings-logo-upload"
          className="group relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-accent hover:bg-accent/5"
        >
          {logoPreview ? (
            <Image src={logoPreview} alt="Logo" fill className="object-cover" />
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
          id="settings-logo-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleLogoChange}
        />
        <p className="mt-2 text-xs text-(--text-tertiary)">
          Unggah logo bisnis Anda
        </p>
      </div>

      {/* Business Name */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Nama Bisnis <span className="text-red-500">*</span>
        </label>
        <Input
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Nama bisnis Anda"
        />
      </div>

      {/* Tagline */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Tagline
        </label>
        <Input
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          placeholder="Deskripsi singkat bisnis Anda"
        />
      </div>

      {/* Contact Info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
            <IconMail size={14} className="text-(--text-tertiary)" />
            Email
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@bisnis.com"
          />
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
            <IconPhone size={14} className="text-(--text-tertiary)" />
            Nomor Telepon
          </label>
          <Input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+62812..."
          />
        </div>
      </div>

      {/* Social Links */}
      <div>
        <p className="mb-3 text-sm font-medium text-foreground">Media Sosial</p>
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
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          <IconCheck size={16} className="text-green-600" />
          Profil bisnis berhasil diperbarui
        </div>
      )}

      {/* Submit */}
      <Button
        variant="primary"
        onClick={handleSubmit}
        disabled={isPending || uploading}
      >
        {upsert.isPending ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Menyimpan...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <IconCheck size={16} />
            Simpan Profil
          </span>
        )}
      </Button>
    </div>
  );
};
