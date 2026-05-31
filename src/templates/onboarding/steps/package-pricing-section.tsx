"use client";

import type { Control, UseFormRegister } from "react-hook-form";
import { Controller } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { Input, Textarea } from "@/components/ui";
import { VariationEditor } from "@/templates/finance/packages/variation-editor";
import type { PackageFormValues, Variation } from "./types";

interface Props {
  pricingType: "flat" | "variation";
  setPricingType: (type: "flat" | "variation") => void;
  pkgVariations: Variation[];
  addVariation: () => void;
  updateVariation: (i: number, field: keyof Variation, value: string) => void;
  removeVariation: (i: number) => void;
  control: Control<PackageFormValues>;
  register: UseFormRegister<PackageFormValues>;
}

export const PackagePricingSection = ({
  pricingType,
  setPricingType,
  pkgVariations,
  addVariation,
  updateVariation,
  removeVariation,
  control,
  register,
}: Props) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4">
        <label className="mb-3 block text-sm font-semibold text-slate-900">
          Tipe Harga
        </label>
        <div className="flex gap-2 rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setPricingType("flat")}
            className={`flex-1 rounded-md py-2.5 text-sm font-semibold transition-all ${
              pricingType === "flat"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Harga Pasti
          </button>
          <button
            type="button"
            onClick={() => setPricingType("variation")}
            className={`flex-1 rounded-md py-2.5 text-sm font-semibold transition-all ${
              pricingType === "variation"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Multi-Variasi
          </button>
        </div>
      </div>

      {pricingType === "variation" ? (
        <div className="mt-2 border-t border-slate-100 pt-2">
          <VariationEditor
            variations={pkgVariations}
            onAdd={addVariation}
            onChange={updateVariation}
            onRemove={removeVariation}
            pricing={{
              variationsTitle: "Pilihan Harga / Paket Spesifik",
              variationsHint:
                "Tambahkan variasi harga di dalam paket ini (misal: Silver, Gold, Platinum).",
              variationLabel: "Nama Variasi",
              variationPrice: "Harga Variasi",
              addVariation: "Tambah Variasi Harga",
              variationLabelPlaceholder: "Misal: Silver",
              variationDescPlaceholder: "Deskripsi (Opsional)",
              variationInclusionsPlaceholder: "Fasilitas (1 per baris)",
            }}
          />
        </div>
      ) : (
        <div className="mt-2 space-y-4 border-t border-slate-100 pt-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-900">
              Harga <span className="text-red-500">*</span>
            </label>
            <Controller
              name="flatPrice"
              control={control}
              render={({ field }) => (
                <NumericFormat
                  customInput={Input}
                  allowNegative={false}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="Rp "
                  value={field.value}
                  onValueChange={(values) => field.onChange(values.value)}
                  placeholder="Rp 0"
                  className="rounded-xl border-slate-200 bg-slate-50"
                />
              )}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-900">
              Termasuk (Inclusions)
            </label>
            <p className="mb-2 text-xs text-slate-500">
              Pisahkan dengan baris baru (enter), misal:
              <br />
              1x Sesi Foto
              <br />
              Cetak 100 lembar
            </p>
            <Textarea
              {...register("pkgInclusions")}
              placeholder="Fasilitas/barang yang didapat pelanggan"
              rows={4}
              className="rounded-xl border-slate-200 bg-slate-50"
            />
          </div>
        </div>
      )}
    </div>
  );
};
