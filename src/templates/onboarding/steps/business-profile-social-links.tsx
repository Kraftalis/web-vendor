"use client";

import type { Control, UseFormRegister } from "react-hook-form";
import { Controller } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import { Input } from "@/components/ui";
import {
  IconInstagram,
  IconTiktok,
  IconFacebook,
  IconLinkedin,
  IconWhatsApp,
} from "@/components/icons";
import type { BusinessProfileFormValues } from "./types";

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

interface Props {
  register: UseFormRegister<BusinessProfileFormValues>;
  control: Control<BusinessProfileFormValues>;
}

export const BusinessProfileSocialLinks = ({ register, control }: Props) => {
  return (
    <div className="border-t border-slate-100 pt-4">
      <p className="mb-4 text-sm font-semibold text-slate-900">
        Kanal Media Sosial{" "}
        <span className="font-normal text-slate-500">(Opsional)</span>
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {socialConfig.map(({ key, icon: Icon, placeholder }) => (
          <div key={key} className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="text-xs font-semibold capitalize text-slate-600">
                {key}
              </span>
            </div>
            {key === "whatsapp" ? (
              <Controller
                name="whatsapp"
                control={control}
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
                    className="rounded-xl border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                  />
                )}
              />
            ) : (
              <Input
                {...register(key as keyof BusinessProfileFormValues)}
                placeholder={placeholder}
                className="rounded-xl border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
