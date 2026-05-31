"use client";

import { useState, useCallback, useEffect } from "react";
import { useBusinessProfile, useUpsertBusinessProfile } from "@/hooks/user";
import { uploadFile } from "@/services/upload";
import type { UpsertBusinessProfilePayload } from "@/hooks/user";

const defaultSocials = (): Record<string, string> => ({
  instagram: "",
  tiktok: "",
  facebook: "",
  linkedin: "",
  whatsapp: "",
});

export const useBusinessProfileForm = () => {
  const profileQuery = useBusinessProfile();
  const upsert = useUpsertBusinessProfile();

  const [businessName, setBusinessName] = useState("");
  const [tagline, setTagline] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [socialLinks, setSocialLinks] =
    useState<Record<string, string>>(defaultSocials());
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const p = profileQuery.data;
    if (!p) return;
    setBusinessName(p.businessName ?? "");
    setTagline(p.tagline ?? "");
    setLogoUrl(p.logoUrl ?? null);
    setLogoPreview(p.logoUrl ?? null);
    setEmail(p.email ?? "");
    setPhoneNumber(p.phoneNumber ?? "");
    setSocialLinks({ ...defaultSocials(), ...(p.socialLinks ?? {}) });
  }, [profileQuery.data]);

  const handleLogoChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);

      setUploading(true);
      try {
        const publicUrl = await uploadFile(file, "logos");
        setLogoUrl(publicUrl);
      } catch (err) {
        console.error("[Settings] Logo upload error:", err);
      } finally {
        setUploading(false);
      }
    },
    [],
  );

  const handleSocialChange = useCallback((key: string, value: string) => {
    setSocialLinks((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    setError(null);
    setSuccess(false);

    if (!businessName.trim()) {
      setError("Nama bisnis wajib diisi");
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
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Gagal menyimpan. Coba lagi.");
    }
  }, [businessName, tagline, logoUrl, email, phoneNumber, socialLinks, upsert]);

  return {
    isLoading: profileQuery.isLoading,
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
    isPending: upsert.isPending,
    handleLogoChange,
    handleSocialChange,
    handleSubmit,
  };
};
