"use client";

import Image from "next/image";
import { Camera } from "lucide-react";

interface Props {
  logoPreview: string | null;
  uploading: boolean;
  logoError: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const BusinessProfileLogoUpload = ({
  logoPreview,
  uploading,
  logoError,
  onChange,
}: Props) => {
  return (
    <div className="mb-8 flex flex-col items-center">
      <label
        htmlFor="logo-upload"
        className="group relative flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-slate-300 bg-slate-50 transition-all hover:border-blue-500 hover:bg-blue-50/50"
      >
        {logoPreview ? (
          <Image src={logoPreview} alt="Logo" fill className="object-cover" />
        ) : (
          <Camera className="h-8 w-8 text-slate-400 transition-colors group-hover:text-blue-500" />
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        )}
      </label>
      <input
        id="logo-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onChange}
      />
      <p className="mt-3 text-sm font-medium text-slate-500">
        Unggah logo bisnis <span className="text-red-500">*</span>
      </p>
      {logoError && <p className="mt-1 text-xs text-red-500">{logoError}</p>}
    </div>
  );
};
