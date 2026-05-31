"use client";

import { useMemo } from "react";
import { Input, Select, Textarea } from "@/components/ui";
import { VariationEditor } from "./variation-editor";
import type { Category } from "./types";
import { ListChecks } from "lucide-react";

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
}

export const PackageFormFields = ({
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
}: Props) => {
  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: c.id, label: c.name })),
    [categories],
  );

  const eventCategoryOptions = useMemo(
    () => eventCategories.map((c) => ({ value: c.id, label: c.name })),
    [eventCategories],
  );

  return (
    <div className="space-y-8">
      {/* 1. Basic Info Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2 mb-4">
            Informasi Dasar
          </h3>
        </div>
        <Input
          name="name"
          label="Nama Paket"
          placeholder="Misal: Paket Pre-Wedding Eksklusif"
          defaultValue={editDefaults.name}
          required
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Kategori Grup"
            name="category"
            value={catId}
            onChange={(e) => setCatId(e.target.value)}
            placeholder="Pilih grup kategori"
            options={categoryOptions}
          />
          <Select
            label="Kategori Acara"
            name="eventCategory"
            value={eventCatId}
            onChange={(e) => setEventCatId(e.target.value)}
            placeholder="Pilih acara"
            options={eventCategoryOptions}
          />
        </div>

        <Textarea
          name="description"
          label="Deskripsi Paket"
          placeholder="Jelaskan detail utama dari paket ini..."
          defaultValue={editDefaults.description}
          rows={3}
        />
      </div>

      {/* 2. Variations & Pricing */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2 mb-4">
            Variasi & Harga
          </h3>
        </div>
        <div className="hidden">
          <Input
            name="currency"
            label="Mata Uang"
            defaultValue={editDefaults.currency}
            className="w-28"
          />
        </div>

        <VariationEditor
          variations={variations}
          onAdd={onAddVariation}
          onChange={onUpdateVariation}
          onRemove={onRemoveVariation}
        />

        {variations.length === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              name="flatPrice"
              label="Harga Paket Utama"
              type="number"
              min="0"
              placeholder="0"
              defaultValue={editDefaults.price}
              required
              hint="Harga dasar paket jika tidak ada variasi."
            />
          </div>
        )}
        {variations.length > 0 && (
          <input type="hidden" name="flatPrice" value="0" />
        )}
      </div>

      {/* 3. Inclusions */}
      {variations.length === 0 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2 mb-4 flex items-center gap-1.5">
              <ListChecks size={16} className="text-blue-500" />
              Yang Didapatkan (Komponen)
            </h3>
          </div>
          <div>
            <Textarea
              name="inclusions"
              value={inclusionDraft}
              onChange={(e) => setInclusionDraft(e.target.value)}
              placeholder="Tuliskan setiap fitur di baris baru..."
              rows={4}
              hint="Fitur yang akan muncul sebagai check-list di penawaran."
            />
          </div>
        </div>
      )}

      {/* 4. Settings Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2 mb-4">
            Pengaturan
          </h3>
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
          <div className="flex h-5 items-center">
            <input
              id="isActive"
              type="checkbox"
              defaultChecked={editDefaults.isActive}
              onChange={(e) => {
                const hidden = e.target
                  .closest("form")
                  ?.querySelector<HTMLInputElement>(
                    'input[name="isActiveHidden"]',
                  );
                if (hidden) hidden.value = String(e.target.checked);
              }}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <input
              type="hidden"
              name="isActiveHidden"
              defaultValue={String(editDefaults.isActive)}
            />
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="isActive"
              className="text-sm font-medium text-gray-900 cursor-pointer"
            >
              Paket Aktif
            </label>
            <p className="text-xs text-gray-500">
              Menentukan apakah paket ini dapat dilihat oleh klien di halaman
              booking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
