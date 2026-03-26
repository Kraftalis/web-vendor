"use client";

import {
  useWatch,
  type Control,
  type UseFormSetValue,
  type UseFormGetValues,
} from "react-hook-form";
import { Button, Input } from "@/components/ui";
import { IconPlus, IconTrash } from "@/components/icons";
import type { BookingLinkFormValues, SourceAddOn } from "./types";

interface Props {
  control: Control<BookingLinkFormValues>;
  setValue: UseFormSetValue<BookingLinkFormValues>;
  getValues: UseFormGetValues<BookingLinkFormValues>;
  addOns: SourceAddOn[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  labels: Record<string, any>;
}

export default function AddOnSelector({
  control,
  setValue,
  getValues,
  addOns,
  labels,
}: Props) {
  const selectedAddOnIds = useWatch({ control, name: "selectedAddOnIds" });
  const customAddOns = useWatch({ control, name: "customAddOns" });

  const toggleAddOn = (id: string) => {
    const current = getValues("selectedAddOnIds");
    setValue(
      "selectedAddOnIds",
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );
  };

  const addCustomAddOn = () => {
    setValue("customAddOns", [
      ...getValues("customAddOns"),
      { name: "", price: "" },
    ]);
  };

  const removeCustomAddOn = (i: number) => {
    setValue(
      "customAddOns",
      getValues("customAddOns").filter((_, idx) => idx !== i),
    );
  };

  const updateCustomAddOn = (i: number, field: "name" | "price", v: string) => {
    const updated = getValues("customAddOns").map((c, idx) =>
      idx === i ? { ...c, [field]: v } : c,
    );
    setValue("customAddOns", updated);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">
        {labels.addOnsTitle ?? "Add-ons"}{" "}
        <span className="font-normal text-gray-400">
          ({labels.optional ?? "optional"})
        </span>
      </h3>

      {/* Existing add-ons as toggleable pills */}
      {addOns.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {addOns.map((ao) => {
            const isSelected = selectedAddOnIds.includes(ao.id);
            return (
              <button
                key={ao.id}
                type="button"
                onClick={() => toggleAddOn(ao.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  isSelected
                    ? "border-blue-300 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                {ao.name}
                <span className="ml-1 text-gray-400">
                  Rp {Number(ao.price).toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Custom add-ons */}
      {customAddOns.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500">
            {labels.customAddOns ?? "Custom Add-ons"}
          </p>
          {customAddOns.map((ca, i) => (
            <div key={i} className="flex items-end gap-2">
              <Input
                label={i === 0 ? (labels.addOnName ?? "Name") : undefined}
                placeholder="e.g. Photo booth"
                value={ca.name}
                onChange={(e) => updateCustomAddOn(i, "name", e.target.value)}
                className="flex-1"
              />
              <Input
                label={i === 0 ? (labels.addOnPrice ?? "Price") : undefined}
                type="number"
                min="0"
                placeholder="0"
                value={ca.price}
                onChange={(e) => updateCustomAddOn(i, "price", e.target.value)}
                className="w-32"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeCustomAddOn(i)}
                className="shrink-0"
              >
                <IconTrash size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={addCustomAddOn}
        type="button"
      >
        <IconPlus size={14} />
        {labels.addCustomAddOn ?? "Add custom add-on"}
      </Button>
    </div>
  );
}
