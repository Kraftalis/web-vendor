"use client";

import {
  Controller,
  useWatch,
  type Control,
  type UseFormSetValue,
} from "react-hook-form";
import { Input, Textarea, Select } from "@/components/ui";
import type { BookingLinkFormValues, SourcePackage } from "./types";

interface Props {
  control: Control<BookingLinkFormValues>;
  setValue: UseFormSetValue<BookingLinkFormValues>;
  packages: SourcePackage[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  labels: Record<string, any>;
}

export default function PackageSelector({
  control,
  setValue,
  packages,
  labels,
}: Props) {
  const packageMode = useWatch({ control, name: "packageMode" });
  const selectedPkgId = useWatch({ control, name: "selectedPkgId" });
  const selectedVariationId = useWatch({
    control,
    name: "selectedVariationId",
  });

  const selectedPkg = packages.find((p) => p.id === selectedPkgId);
  const hasVariations = (selectedPkg?.items.length ?? 0) > 0;

  const pkgOptions = packages.map((p) => ({
    value: p.id,
    label: `${p.name} — Rp ${Number(p.price).toLocaleString()}`,
  }));

  const variationOptions =
    selectedPkg?.items.map((v) => ({
      value: v.id,
      label: `${v.label} — Rp ${Number(v.price).toLocaleString()}`,
    })) ?? [];

  const selectedVar = selectedPkg?.items.find(
    (v) => v.id === selectedVariationId,
  );
  const inclusionsToShow =
    selectedVar && selectedVar.inclusions.length > 0
      ? selectedVar.inclusions
      : (selectedPkg?.inclusions ?? []);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">
        {labels.packageTitle ?? "Package"}
      </h3>

      {/* Mode toggle */}
      <div className="flex gap-2">
        {(["existing", "custom"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setValue("packageMode", mode)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              packageMode === mode
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {mode === "existing"
              ? (labels.existingPackage ?? "Select Package")
              : (labels.customPackage ?? "Custom")}
          </button>
        ))}
      </div>

      {/* Existing package */}
      {packageMode === "existing" && (
        <div className="space-y-3">
          <Controller
            control={control}
            name="selectedPkgId"
            render={({ field }) => (
              <Select
                label={labels.selectPackage ?? "Package"}
                value={field.value}
                onChange={(e) => {
                  field.onChange(e.target.value);
                  setValue("selectedVariationId", "");
                }}
                placeholder={
                  labels.selectPackagePlaceholder ?? "Choose a package"
                }
                options={pkgOptions}
              />
            )}
          />

          {hasVariations && (
            <Controller
              control={control}
              name="selectedVariationId"
              render={({ field }) => (
                <Select
                  label={labels.selectVariation ?? "Variation"}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder={
                    labels.selectVariationPlaceholder ?? "Choose variation"
                  }
                  options={variationOptions}
                />
              )}
            />
          )}

          {selectedPkg && inclusionsToShow.length > 0 && (
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <p className="mb-1 text-xs font-medium text-gray-500">
                {labels.includes ?? "Includes"}
              </p>
              <ul className="space-y-0.5">
                {inclusionsToShow.map((inc, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-1.5 text-xs text-gray-600"
                  >
                    <span className="mt-0.5 text-green-500">✓</span>
                    {inc}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Custom package */}
      {packageMode === "custom" && (
        <div className="space-y-3">
          <Controller
            control={control}
            name="customPkgName"
            render={({ field }) => (
              <Input
                label={labels.customPkgName ?? "Package Name"}
                placeholder={
                  labels.customPkgNamePlaceholder ?? "e.g. Custom Wedding Shoot"
                }
                {...field}
              />
            )}
          />
          <Controller
            control={control}
            name="customPkgPrice"
            render={({ field }) => (
              <Input
                label={labels.customPkgPrice ?? "Price"}
                type="number"
                min="0"
                placeholder="0"
                {...field}
              />
            )}
          />
          <Controller
            control={control}
            name="customPkgInclusions"
            render={({ field }) => (
              <Textarea
                label={
                  labels.customPkgInclusions ?? "Inclusions (one per line)"
                }
                placeholder={"e.g. 2 photographers\n3 hours coverage"}
                rows={3}
                {...field}
              />
            )}
          />
        </div>
      )}
    </div>
  );
}
