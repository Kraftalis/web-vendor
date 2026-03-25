"use client";

import { Input, Textarea, Select } from "@/components/ui";
import type { SourcePackage } from "./types";

interface Props {
  packageMode: "existing" | "custom";
  setPackageMode: (v: "existing" | "custom") => void;
  packages: SourcePackage[];

  // Existing package
  selectedPkgId: string;
  setSelectedPkgId: (v: string) => void;
  selectedVariationId: string;
  setSelectedVariationId: (v: string) => void;

  // Custom package
  customPkgName: string;
  setCustomPkgName: (v: string) => void;
  customPkgPrice: string;
  setCustomPkgPrice: (v: string) => void;
  customPkgInclusions: string;
  setCustomPkgInclusions: (v: string) => void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  labels: Record<string, any>;
}

export default function PackageSelector({
  packageMode,
  setPackageMode,
  packages,
  selectedPkgId,
  setSelectedPkgId,
  selectedVariationId,
  setSelectedVariationId,
  customPkgName,
  setCustomPkgName,
  customPkgPrice,
  setCustomPkgPrice,
  customPkgInclusions,
  setCustomPkgInclusions,
  labels,
}: Props) {
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
            onClick={() => setPackageMode(mode)}
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
          <Select
            label={labels.selectPackage ?? "Package"}
            value={selectedPkgId}
            onChange={(e) => {
              setSelectedPkgId(e.target.value);
              setSelectedVariationId("");
            }}
            placeholder={labels.selectPackagePlaceholder ?? "Choose a package"}
            options={pkgOptions}
          />

          {hasVariations && (
            <Select
              label={labels.selectVariation ?? "Variation"}
              value={selectedVariationId}
              onChange={(e) => setSelectedVariationId(e.target.value)}
              placeholder={
                labels.selectVariationPlaceholder ?? "Choose variation"
              }
              options={variationOptions}
            />
          )}

          {/* Show inclusions preview — variation inclusions take priority */}
          {selectedPkg &&
            (() => {
              const selectedVar = selectedPkg.items.find(
                (v) => v.id === selectedVariationId,
              );
              const inclusions =
                selectedVar && selectedVar.inclusions.length > 0
                  ? selectedVar.inclusions
                  : selectedPkg.inclusions;

              if (inclusions.length === 0) return null;

              return (
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <p className="mb-1 text-xs font-medium text-gray-500">
                    {labels.includes ?? "Includes"}
                  </p>
                  <ul className="space-y-0.5">
                    {inclusions.map((inc, i) => (
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
              );
            })()}
        </div>
      )}

      {/* Custom package */}
      {packageMode === "custom" && (
        <div className="space-y-3">
          <Input
            label={labels.customPkgName ?? "Package Name"}
            placeholder={
              labels.customPkgNamePlaceholder ?? "e.g. Custom Wedding Shoot"
            }
            value={customPkgName}
            onChange={(e) => setCustomPkgName(e.target.value)}
          />
          <Input
            label={labels.customPkgPrice ?? "Price"}
            type="number"
            min="0"
            placeholder="0"
            value={customPkgPrice}
            onChange={(e) => setCustomPkgPrice(e.target.value)}
          />
          <Textarea
            label={labels.customPkgInclusions ?? "Inclusions (one per line)"}
            placeholder="e.g. 2 photographers&#10;3 hours coverage"
            value={customPkgInclusions}
            onChange={(e) => setCustomPkgInclusions(e.target.value)}
            rows={3}
          />
        </div>
      )}
    </div>
  );
}
