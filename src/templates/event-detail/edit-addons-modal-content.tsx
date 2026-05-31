"use client";

import { useState, useMemo } from "react";
import { Button, Input } from "@/components/ui";
import { usePricing } from "@/hooks";
import type { formatCurrency } from "../event/types";
import type { AddOnSnapshot } from "../event/types";
import { ModalBody, ModalFooter } from "@heroui/react";

interface EditAddOnsModalContentProps {
  currentSnapshot: AddOnSnapshot[];
  onSave: (snapshot: AddOnSnapshot[]) => void;
  onClose: () => void;
  isSaving: boolean;
  formatCurrencyFn: typeof formatCurrency;
  currency: string;
}

export const EditAddOnsModalContent = ({
  currentSnapshot,
  onSave,
  onClose,
  isSaving,
  formatCurrencyFn,
  currency,
}: EditAddOnsModalContentProps) => {
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

  const handleToggleAddOn = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleAddCustom = () => {
    setCustomAddOns((prev) => [...prev, { name: "", price: "" }]);
  };

  const handleRemoveCustom = (idx: number) => {
    setCustomAddOns((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCustomChange = (
    idx: number,
    field: "name" | "price",
    value: string,
  ) => {
    setCustomAddOns((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
    );
  };

  const handleSave = () => {
    const result: AddOnSnapshot[] = [];

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
  };

  if (isPricingLoading) {
    return (
      <ModalBody>
        <div className="py-10 text-center text-sm text-gray-500">
          Loading available add-ons...
        </div>
      </ModalBody>
    );
  }

  return (
    <>
      <ModalBody>
        <div className="space-y-5 py-2">
          {addOnOptions.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">
                Pilih Add-on
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

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">
              Add-on Custom
            </p>
            <div className="space-y-3">
              {customAddOns.map((item, idx) => (
                <div key={idx} className="flex items-end gap-2">
                  <Input
                    id={`customAddonName-${idx}`}
                    name={`customAddonName-${idx}`}
                    label="Nama Add-on"
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
                    label="Harga"
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
                    Hapus
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={handleAddCustom}
              >
                + Tambah Lagi
              </Button>
            </div>
          </div>
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
