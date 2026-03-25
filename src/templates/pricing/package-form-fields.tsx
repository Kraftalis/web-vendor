"use client";

import { useMemo } from "react";
import { Input, Select, Textarea } from "@/components/ui";
import VariationEditor from "./variation-editor";
import type { Category } from "./types";

interface EventCategoryOption {
  id: string;
  name: string;
}

interface Variation {
  label: string;
  description: string;
  price: string;
  inclusions: string;
}

interface Props {
  editDefaults: {
    name: string;
    description: string;
    currency: string;
    price: string;
    isActive: boolean;
  };
  categories: Category[];
  catId: string;
  setCatId: (v: string) => void;
  eventCategories: EventCategoryOption[];
  eventCatId: string;
  setEventCatId: (v: string) => void;
  variations: Variation[];
  onAddVariation: () => void;
  onUpdateVariation: (
    i: number,
    field: "label" | "description" | "price" | "inclusions",
    value: string,
  ) => void;
  onRemoveVariation: (i: number) => void;
  inclusionDraft: string;
  setInclusionDraft: (v: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pricing: Record<string, any>;
}

export default function PackageFormFields({
  editDefaults,
  categories,
  catId,
  setCatId,
  eventCategories,
  eventCatId,
  setEventCatId,
  variations,
  onAddVariation,
  onUpdateVariation,
  onRemoveVariation,
  inclusionDraft,
  setInclusionDraft,
  pricing,
}: Props) {
  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: c.id, label: c.name })),
    [categories],
  );

  const eventCategoryOptions = useMemo(
    () => eventCategories.map((c) => ({ value: c.id, label: c.name })),
    [eventCategories],
  );

  return (
    <>
      <Input
        name="name"
        label={pricing.packageName}
        placeholder={pricing.packageNamePlaceholder}
        defaultValue={editDefaults.name}
        required
      />
      <Textarea
        name="description"
        label={pricing.packageDescription}
        placeholder={pricing.packageDescPlaceholder}
        defaultValue={editDefaults.description}
        rows={2}
      />
      <Input
        name="currency"
        label={pricing.currency}
        defaultValue={editDefaults.currency}
        className="w-28"
      />

      {/* Variations */}
      <VariationEditor
        variations={variations}
        onAdd={onAddVariation}
        onChange={onUpdateVariation}
        onRemove={onRemoveVariation}
        pricing={pricing}
      />

      {/* Category */}
      <Select
        label="Category"
        name="category"
        value={catId}
        onChange={(e) => {
          setCatId(e.target.value);
        }}
        placeholder="Select category"
        options={categoryOptions}
      />

      {/* Event Category */}
      <Select
        label={pricing.eventCategory ?? "Event Category"}
        name="eventCategory"
        value={eventCatId}
        onChange={(e) => {
          setEventCatId(e.target.value);
        }}
        placeholder={pricing.selectEventCategory ?? "Select event category"}
        options={eventCategoryOptions}
      />

      {/* Inclusions — only shown when package has no variations */}
      {variations.length === 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700">
            {pricing.inclusionsTitle || "Includes"}
          </p>
          <p className="mt-0.5 text-xs text-gray-400">
            Enter each inclusion on a new line.
          </p>
          <Textarea
            name="inclusions"
            value={inclusionDraft}
            onChange={(e) => setInclusionDraft(e.target.value)}
            placeholder="e.g. 2 photographers\n3 hours coverage"
            rows={4}
          />
        </div>
      )}

      {/* Flat price */}
      {variations.length === 0 && (
        <div>
          <Input
            name="flatPrice"
            label={pricing.flatPrice}
            type="number"
            min="0"
            defaultValue={editDefaults.price}
            required
          />
          <p className="mt-1 text-xs text-gray-400">{pricing.flatPriceHint}</p>
        </div>
      )}
      {variations.length > 0 && (
        <input type="hidden" name="flatPrice" value="0" />
      )}

      {/* isActive */}
      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
        <input
          type="checkbox"
          defaultChecked={editDefaults.isActive}
          onChange={(e) => {
            const hidden = e.target
              .closest("form")
              ?.querySelector<HTMLInputElement>('input[name="isActive"]');
            if (hidden) hidden.value = String(e.target.checked);
          }}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <input
          type="hidden"
          name="isActive"
          defaultValue={String(editDefaults.isActive)}
        />
        {pricing.activePackage}
      </label>
    </>
  );
}
