"use client";

import { useState, useCallback, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import { Button, Input } from "@/components/ui";
import { Mail, Phone, ChevronRight, AlertCircle } from "lucide-react";
import { useBusinessProfile, useUpsertBusinessProfile } from "@/hooks/user";
import type { UpsertBusinessProfilePayload } from "@/hooks/user";
import { uploadFile } from "@/services/upload";
import { BusinessProfileLogoUpload } from "./business-profile-logo-upload";
import { BusinessProfileSocialLinks } from "./business-profile-social-links";
import type { BusinessProfileFormValues } from "./types";

interface Props {
  onNext: () => void;
  skipAutoSkip?: boolean;
}

export const BusinessProfileStep = ({
  onNext,
  skipAutoSkip = false,
}: Props) => {
  const profileQuery = useBusinessProfile();
  const upsert = useUpsertBusinessProfile();

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BusinessProfileFormValues>({
    defaultValues: {
      businessName: "",
      tagline: "",
      email: "",
      phoneNumber: "",
      instagram: "",
      tiktok: "",
      facebook: "",
      linkedin: "",
      whatsapp: "",
    },
  });

  useEffect(() => {
    const p = profileQuery.data;
    if (!p) return;

    if (!skipAutoSkip && p.businessName && p.phoneNumber && p.logoUrl) {
      onNext();
      return;
    }

    reset({
      businessName: p.businessName ?? "",
      tagline: p.tagline ?? "",
      email: p.email ?? "",
      phoneNumber: p.phoneNumber ?? "",
      instagram: p.socialLinks?.instagram ?? "",
      tiktok: p.socialLinks?.tiktok ?? "",
      facebook: p.socialLinks?.facebook ?? "",
      linkedin: p.socialLinks?.linkedin ?? "",
      whatsapp: p.socialLinks?.whatsapp ?? "",
    });
    setLogoUrl(p.logoUrl ?? null);
    setLogoPreview(p.logoUrl ?? null);
  }, [profileQuery.data, reset, onNext, skipAutoSkip]);

  const handleLogoChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);

      setUploading(true);
      setLogoError(null);
      try {
        const publicUrl = await uploadFile(file, "logos");
        setLogoUrl(publicUrl);
      } catch (err) {
        console.error("[Onboarding] Logo upload error:", err);
        setLogoError("Gagal mengunggah logo. Coba lagi.");
      } finally {
        setUploading(false);
      }
    },
    [],
  );

  const onSubmit = async (values: BusinessProfileFormValues) => {
    if (!logoUrl) {
      setLogoError("Logo wajib diisi");
      return;
    }
    setLogoError(null);
    setSubmitError(null);

    const filteredSocials: Record<string, string> = {};
    for (const key of [
      "instagram",
      "tiktok",
      "facebook",
      "linkedin",
      "whatsapp",
    ] as const) {
      if (values[key]?.trim()) filteredSocials[key] = values[key].trim();
    }

    const payload: UpsertBusinessProfilePayload = {
      businessName: values.businessName.trim(),
      tagline: values.tagline.trim() || null,
      logoUrl,
      email: values.email.trim() || null,
      phoneNumber: values.phoneNumber.trim() || null,
      socialLinks:
        Object.keys(filteredSocials).length > 0 ? filteredSocials : null,
    };

    try {
      await upsert.mutateAsync(payload);
      onNext();
    } catch {
      setSubmitError("Gagal menyimpan. Coba lagi.");
    }
  };

  if (profileQuery.isLoading) {
    return (
      <div className="space-y-6">
        <div className="mb-8 flex flex-col items-center">
          <div className="h-28 w-28 animate-pulse rounded-full bg-slate-100" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <BusinessProfileLogoUpload
        logoPreview={logoPreview}
        uploading={uploading}
        logoError={logoError}
        onChange={handleLogoChange}
      />

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-900">
            Nama Bisnis <span className="text-red-500">*</span>
          </label>
          <Input
            {...register("businessName", {
              required: "Nama bisnis wajib diisi",
            })}
            placeholder="Masukkan nama bisnis Anda"
            className="rounded-xl border-slate-200 bg-white px-4 py-3 shadow-sm focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
          />
          {errors.businessName && (
            <p className="mt-1 text-xs text-red-500">
              {errors.businessName.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-900">
            Tagline Singkat
          </label>
          <Input
            {...register("tagline")}
            placeholder="Contoh: Mengabadikan momen terbaik"
            className="rounded-xl border-slate-200 bg-white px-4 py-3 shadow-sm focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-900">
              <Mail className="h-4 w-4 text-slate-400" />
              Email
            </label>
            <Input
              type="email"
              {...register("email")}
              placeholder="nama@contoh.com"
              className="rounded-xl border-slate-200 bg-white px-4 py-3 shadow-sm focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
            />
          </div>
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-900">
              <Phone className="h-4 w-4 text-slate-400" />
              Telepon <span className="text-red-500">*</span>
            </label>
            <Controller
              name="phoneNumber"
              control={control}
              rules={{ required: "Nomor telepon wajib diisi" }}
              render={({ field }) => (
                <PatternFormat
                  customInput={Input}
                  format="+62 ###-####-####"
                  mask="_"
                  allowEmptyFormatting={false}
                  value={field.value}
                  onValueChange={(values) =>
                    field.onChange(values.formattedValue)
                  }
                  placeholder="+62 812-3456-7890"
                  className="rounded-xl border-slate-200 bg-white px-4 py-3 shadow-sm focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                />
              )}
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-xs text-red-500">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>
        </div>

        <BusinessProfileSocialLinks register={register} control={control} />
      </div>

      {submitError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <div className="pt-6">
        <Button
          type="submit"
          variant="primary"
          className="w-full rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 disabled:opacity-70"
          disabled={isSubmitting || uploading}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Menyimpan Profil...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Lanjutkan
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </div>
    </form>
  );
};
