"use client";

import { useState, useMemo } from "react";
import { Button, Input, Select, Textarea } from "@/components/ui";
import { usePricing } from "@/hooks";
import type { formatCurrency } from "./types";
import type { PackageSnapshot, AddOnSnapshot } from "./types";

// ─── Types ──────────────────────────────────────────────────

interface EditPackageModalContentProps {
  currentSnapshot: PackageSnapshot | null;
  onSave: (snapshot: PackageSnapshot | null) => void;
  onCancel: () => void;
  isSaving: boolean;
  labels: {
    selectPackage: string;
    customPackage: string;
    packageName: string;
    packageDescription: string;
    packagePrice: string;
    save: string;
    cancel: string;
    noPackage: string;
    orCustom: string;
    selectVariation: string;
  };
  formatCurrencyFn: typeof formatCurrency;
  currency: string;
}

export function EditPackageModalContent({
  currentSnapshot,
  onSave,
  onCancel,
  isSaving,
  labels,
  formatCurrencyFn,
  currency,
}: EditPackageModalContentProps) {
  const { data: pricingData, isLoading: isPricingLoading } = usePricing();
  const packages = useMemo(
    () => pricingData?.data?.packages ?? [],
    [pricingData],
  );

  const [mode, setMode] = useState<"select" | "custom">(
    currentSnapshot ? "custom" : "select",
  );
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [selectedVariationId, setSelectedVariationId] = useState("");
  const [customName, setCustomName] = useState(currentSnapshot?.name ?? "");
  const [customDescription, setCustomDescription] = useState(
    (currentSnapshot?.description as string) ?? "",
  );
  const [customInclusions, setCustomInclusions] = useState(
    (currentSnapshot?.inclusions as string[] | undefined)?.join("\n") ?? "",
  );
  const [customPrice, setCustomPrice] = useState(
    currentSnapshot?.price?.toString() ?? "",
  );

  // The selected package object (for showing variations)
  const selectedPackage = useMemo(
    () => packages.find((p) => p.id === selectedPackageId) ?? null,
    [packages, selectedPackageId],
  );

  // Variation options for the selected package
  const variationOptions = useMemo(
    () =>
      selectedPackage && selectedPackage.items.length > 0
        ? [
            { value: "", label: labels.selectVariation },
            ...selectedPackage.items.map((v) => ({
              value: v.id,
              label: `${v.label} — ${formatCurrencyFn(v.price, currency)}`,
            })),
          ]
        : [],
    [selectedPackage, labels.selectVariation, formatCurrencyFn, currency],
  );

  const packageOptions = useMemo(
    () =>
      isPricingLoading
        ? [{ value: "", label: "Loading...", disabled: true }]
        : [
            { value: "", label: labels.selectPackage },
            ...packages
              .filter((p) => p.isActive)
              .map((p) => ({
                value: p.id,
                label: `${p.name} — ${formatCurrencyFn(p.price, currency)}`,
              })),
          ],
    [
      isPricingLoading,
      packages,
      labels.selectPackage,
      formatCurrencyFn,
      currency,
    ],
  );

  function handleSave() {
    if (mode === "select") {
      if (!selectedPackageId) {
        // Remove package
        onSave(null);
        return;
      }
      const pkg = packages.find((p) => p.id === selectedPackageId);
      if (!pkg) return;

      // If package has variations, user must pick one
      if (pkg.items.length > 0) {
        if (!selectedVariationId) return; // nothing selected yet
        const variation = pkg.items.find((v) => v.id === selectedVariationId);
        if (!variation) return;
        onSave({
          name: pkg.name,
          description: variation.description ?? pkg.description,
          price: variation.price,
          inclusions: variation.inclusions,
          packageId: pkg.id,
          variationId: variation.id,
          variationLabel: variation.label,
        });
      } else {
        onSave({
          name: pkg.name,
          description: pkg.description,
          price: pkg.price,
          inclusions: pkg.inclusions,
          packageId: pkg.id,
        });
      }
    } else {
      if (!customName.trim()) return;
      onSave({
        name: customName.trim(),
        description: customDescription.trim() || null,
        price: customPrice || "0",
        inclusions: customInclusions.split("\n").filter((line) => line.trim()),
      });
    }
  }

  return (
    <div className="space-y-5">
      {/* Mode toggle */}
      <div className="flex gap-2">
        <Button
          variant={mode === "select" ? "primary" : "outline"}
          size="sm"
          type="button"
          onClick={() => setMode("select")}
        >
          {labels.selectPackage}
        </Button>
        <Button
          variant={mode === "custom" ? "primary" : "outline"}
          size="sm"
          type="button"
          onClick={() => setMode("custom")}
        >
          {labels.customPackage}
        </Button>
      </div>

      {mode === "select" ? (
        <div className="space-y-4">
          <Select
            id="packageSelect"
            name="packageSelect"
            options={packageOptions}
            value={selectedPackageId}
            onChange={(e) => {
              setSelectedPackageId(e.target.value);
              setSelectedVariationId(""); // reset variation when package changes
            }}
            disabled={isPricingLoading}
          />

          {/* Show variation picker when selected package has variations */}
          {selectedPackage && variationOptions.length > 0 && (
            <div className="space-y-2">
              <Select
                id="variationSelect"
                name="variationSelect"
                label={labels.selectVariation}
                options={variationOptions}
                value={selectedVariationId}
                onChange={(e) => setSelectedVariationId(e.target.value)}
              />
              {/* Show selected variation details */}
              {selectedVariationId &&
                (() => {
                  const v = selectedPackage.items.find(
                    (i) => i.id === selectedVariationId,
                  );
                  return v ? (
                    <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
                      <p className="text-sm font-medium text-gray-800">
                        {v.label}
                      </p>
                      {v.description && (
                        <p className="mt-0.5 text-xs text-gray-500">
                          {v.description}
                        </p>
                      )}
                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {formatCurrencyFn(v.price, currency)}
                      </p>
                      {v.inclusions.length > 0 && (
                        <ul className="mt-1.5 space-y-0.5">
                          {v.inclusions.map((inc, i) => (
                            <li key={i} className="text-xs text-gray-500">
                              • {inc}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : null;
                })()}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <Input
            id="customPackageName"
            name="customPackageName"
            label={labels.packageName}
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            required
          />
          <Textarea
            id="customPackageDesc"
            name="customPackageDesc"
            label={labels.packageDescription}
            value={customDescription}
            onChange={(e) => setCustomDescription(e.target.value)}
          />
          <Textarea
            id="customPackageInclusions"
            name="customPackageInclusions"
            label="Inclusions (one per line)"
            value={customInclusions}
            onChange={(e) => setCustomInclusions(e.target.value)}
            rows={4}
          />
          <Input
            id="customPackagePrice"
            name="customPackagePrice"
            type="number"
            label={labels.packagePrice}
            value={customPrice}
            onChange={(e) => setCustomPrice(e.target.value)}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" type="button" onClick={onCancel}>
          {labels.cancel}
        </Button>
        <Button type="button" isLoading={isSaving} onClick={handleSave}>
          {labels.save}
        </Button>
      </div>
    </div>
  );
}

// ─── Edit Add-ons Modal ─────────────────────────────────────

interface EditAddOnsModalContentProps {
  currentSnapshot: AddOnSnapshot[];
  onSave: (snapshot: AddOnSnapshot[]) => void;
  onCancel: () => void;
  isSaving: boolean;
  labels: {
    selectAddOns: string;
    customAddOn: string;
    addOnName: string;
    addOnPrice: string;
    save: string;
    cancel: string;
    addMore: string;
    remove: string;
  };
  formatCurrencyFn: typeof formatCurrency;
  currency: string;
}

export function EditAddOnsModalContent({
  currentSnapshot,
  onSave,
  onCancel,
  isSaving,
  labels,
  formatCurrencyFn,
  currency,
}: EditAddOnsModalContentProps) {
  const { data: pricingData, isLoading: isPricingLoading } = usePricing();
  const availableAddOns = useMemo(
    () => pricingData?.data?.addOns ?? [],
    [pricingData],
  );

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [customAddOns, setCustomAddOns] = useState<
    { name: string; price: string }[]
  >(
    currentSnapshot.length > 0
      ? currentSnapshot.map((a) => ({
          name: a.name,
          price: a.price?.toString() ?? "0",
        }))
      : [],
  );

  const addOnOptions = useMemo(
    () =>
      availableAddOns
        .filter((a) => a.isActive)
        .map((a) => ({
          value: a.id,
          label: `${a.name} — ${formatCurrencyFn(a.price, currency)}`,
        })),
    [availableAddOns, formatCurrencyFn, currency],
  );

  function handleToggleAddOn(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  if (isPricingLoading) {
    return (
      <div className="py-10 text-center text-sm text-gray-500">
        Loading available add-ons...
      </div>
    );
  }

  function handleAddCustom() {
    setCustomAddOns((prev) => [...prev, { name: "", price: "" }]);
  }

  function handleRemoveCustom(idx: number) {
    setCustomAddOns((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleCustomChange(
    idx: number,
    field: "name" | "price",
    value: string,
  ) {
    setCustomAddOns((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
    );
  }

  function handleSave() {
    const result: AddOnSnapshot[] = [];

    // From selected existing add-ons
    for (const id of selectedIds) {
      const addon = availableAddOns.find((a) => a.id === id);
      if (addon) {
        result.push({
          name: addon.name,
          description: addon.description,
          price: addon.price,
          quantity: 1,
          addOnId: addon.id,
        });
      }
    }

    // From custom add-ons
    for (const custom of customAddOns) {
      if (custom.name.trim()) {
        result.push({
          name: custom.name.trim(),
          price: custom.price || "0",
          quantity: 1,
        });
      }
    }

    onSave(result);
  }

  return (
    <div className="space-y-5">
      {/* Existing add-ons as checkboxes */}
      {addOnOptions.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">
            {labels.selectAddOns}
          </p>
          <div className="space-y-2">
            {addOnOptions.map((opt) => (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-3 py-2.5 transition hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(opt.value)}
                  onChange={() => handleToggleAddOn(opt.value)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Custom add-ons */}
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">
          {labels.customAddOn}
        </p>
        <div className="space-y-3">
          {customAddOns.map((item, idx) => (
            <div key={idx} className="flex items-end gap-2">
              <Input
                id={`customAddonName-${idx}`}
                name={`customAddonName-${idx}`}
                label={labels.addOnName}
                value={item.name}
                onChange={(e) =>
                  handleCustomChange(idx, "name", e.target.value)
                }
                className="flex-1"
              />
              <Input
                id={`customAddonPrice-${idx}`}
                name={`customAddonPrice-${idx}`}
                type="number"
                label={labels.addOnPrice}
                value={item.price}
                onChange={(e) =>
                  handleCustomChange(idx, "price", e.target.value)
                }
                className="w-32"
              />
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => handleRemoveCustom(idx)}
                className="text-red-500 hover:text-red-700"
              >
                {labels.remove}
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={handleAddCustom}
          >
            + {labels.addMore}
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" type="button" onClick={onCancel}>
          {labels.cancel}
        </Button>
        <Button type="button" isLoading={isSaving} onClick={handleSave}>
          {labels.save}
        </Button>
      </div>
    </div>
  );
}
