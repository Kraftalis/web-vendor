"use client";

import { useState, useMemo } from "react";
import { Button, Input, Select, Textarea } from "@/components/ui";
import { usePricing } from "@/hooks";
import { ModalBody, ModalFooter } from "@heroui/react";
import type { formatCurrency } from "../event/types";
import type { PackageSnapshot } from "../event/types";

interface EditPackageModalContentProps {
  currentSnapshot: PackageSnapshot | null;
  onSave: (snapshot: PackageSnapshot | null) => void;
  onClose: () => void;
  isSaving: boolean;
  formatCurrencyFn: typeof formatCurrency;
  currency: string;
}

export const EditPackageModalContent = ({
  currentSnapshot,
  onSave,
  onClose,
  isSaving,
  formatCurrencyFn,
  currency,
}: EditPackageModalContentProps) => {
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

  const selectedPackage = useMemo(
    () => packages.find((p) => p.id === selectedPackageId) ?? null,
    [packages, selectedPackageId],
  );

  const variationOptions = useMemo(
    () =>
      selectedPackage && selectedPackage.items.length > 0
        ? [
            { value: "", label: "Pilih Variasi" },
            ...selectedPackage.items.map((v) => ({
              value: v.id,
              label: `${v.label} — ${formatCurrencyFn(v.price, currency)}`,
            })),
          ]
        : [],
    [selectedPackage, formatCurrencyFn, currency],
  );

  const packageOptions = useMemo(
    () =>
      isPricingLoading
        ? [{ value: "", label: "Loading...", disabled: true }]
        : [
            { value: "", label: "Pilih Paket" },
            ...packages
              .filter((p) => p.isActive)
              .map((p) => ({
                value: p.id,
                label: `${p.name} — ${formatCurrencyFn(p.price, currency)}`,
              })),
          ],
    [isPricingLoading, packages, formatCurrencyFn, currency],
  );

  const handleSave = () => {
    if (mode === "select") {
      if (!selectedPackageId) {
        onSave(null);
        return;
      }
      const pkg = packages.find((p) => p.id === selectedPackageId);
      if (!pkg) return;
      if (pkg.items.length > 0) {
        if (!selectedVariationId) return;
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
  };

  return (
    <>
      <ModalBody>
        <div className="space-y-5 py-2">
          <div className="flex gap-2">
            <Button
              variant={mode === "select" ? "primary" : "outline"}
              size="sm"
              type="button"
              onClick={() => setMode("select")}
            >
              Pilih Paket
            </Button>
            <Button
              variant={mode === "custom" ? "primary" : "outline"}
              size="sm"
              type="button"
              onClick={() => setMode("custom")}
            >
              Paket Custom
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
                  setSelectedVariationId("");
                }}
                disabled={isPricingLoading}
              />
              {selectedPackage && variationOptions.length > 0 && (
                <div className="space-y-2">
                  <Select
                    id="variationSelect"
                    name="variationSelect"
                    label="Pilih Variasi"
                    options={variationOptions}
                    value={selectedVariationId}
                    onChange={(e) => setSelectedVariationId(e.target.value)}
                  />
                  {selectedVariationId &&
                    (() => {
                      const v = selectedPackage.items.find(
                        (i) => i.id === selectedVariationId,
                      );
                      return v ? (
                        <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
                          <p className="text-sm font-medium text-gray-800">{v.label}</p>
                          {v.description && (
                            <p className="mt-0.5 text-xs text-gray-500">{v.description}</p>
                          )}
                          <p className="mt-1 text-sm font-semibold text-gray-900">
                            {formatCurrencyFn(v.price, currency)}
                          </p>
                          {v.inclusions.length > 0 && (
                            <ul className="mt-1.5 space-y-0.5">
                              {v.inclusions.map((inc, i) => (
                                <li key={i} className="text-xs text-gray-500">• {inc}</li>
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
                label="Nama Paket"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                required
              />
              <Textarea
                id="customPackageDesc"
                name="customPackageDesc"
                label="Deskripsi Paket"
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
                label="Harga"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
              />
            </div>
          )}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" type="button" onClick={onClose}>
          Batal
        </Button>
        <Button type="button" isLoading={isSaving} onClick={handleSave}>
          Simpan
        </Button>
      </ModalFooter>
    </>
  );
};
