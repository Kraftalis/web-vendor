"use client";

import { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, Input, Select } from "@/components/ui";
import { Plus, AlertCircle, X } from "lucide-react";
import { useCategories, useCreatePackage } from "@/hooks/pricing";
import { useEventCategories } from "@/hooks";
import { PackagePricingSection } from "./package-pricing-section";
import type { CreatedSummary, Variation, PackageFormValues } from "./types";

interface Props {
  hasPackages: boolean;
  onSaved: (summary: CreatedSummary) => void;
  onClose?: () => void;
}

export const PackageForm = ({ hasPackages, onSaved, onClose }: Props) => {
  const createPkg = useCreatePackage();
  const categoriesQuery = useCategories();
  const eventCategoriesQuery = useEventCategories();

  const categoryOptions = useMemo(
    () =>
      (categoriesQuery.data ?? []).map((c) => ({ value: c.id, label: c.name })),
    [categoriesQuery.data],
  );
  const eventCategoryOptions = useMemo(
    () =>
      (eventCategoriesQuery.data ?? []).map((c) => ({
        value: c.id,
        label: c.name,
      })),
    [eventCategoriesQuery.data],
  );

  const [pkgVariations, setPkgVariations] = useState<Variation[]>([]);
  const [pricingType, setPricingType] = useState<"flat" | "variation">("flat");
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PackageFormValues>({
    defaultValues: {
      name: "",
      description: "",
      pkgCatId: "",
      pkgEventCatId: "",
      flatPrice: "",
      pkgInclusions: "",
    },
  });

  const addVariation = () =>
    setPkgVariations((prev) => [
      ...prev,
      { label: "", description: "", price: "", inclusions: "" },
    ]);

  const updateVariation = (i: number, field: keyof Variation, value: string) =>
    setPkgVariations((prev) =>
      prev.map((v, idx) => (idx === i ? { ...v, [field]: value } : v)),
    );

  const removeVariation = (i: number) =>
    setPkgVariations((prev) => prev.filter((_, idx) => idx !== i));

  const onSavePackage = async (values: PackageFormValues) => {
    setFormError(null);

    const validVariations =
      pricingType === "variation"
        ? pkgVariations.filter((v) => v.label.trim() && v.price !== "")
        : [];

    if (
      pricingType === "flat" &&
      (!values.flatPrice || Number(values.flatPrice) <= 0)
    ) {
      setFormError("Harga paket wajib diisi");
      return;
    }

    if (pricingType === "variation" && validVariations.length === 0) {
      setFormError("Tambahkan minimal 1 variasi");
      return;
    }

    const price =
      pricingType === "variation" && validVariations.length > 0
        ? Math.min(...validVariations.map((v) => parseFloat(v.price) || 0))
        : parseFloat(values.flatPrice) || 0;

    const inclusions = values.pkgInclusions
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const result = await createPkg.mutateAsync({
        name: values.name.trim(),
        description: values.description.trim() || null,
        price,
        currency: "IDR",
        categoryId: values.pkgCatId || null,
        eventCategoryId: values.pkgEventCatId || null,
        inclusions: pricingType === "flat" ? inclusions : undefined,
        variations:
          pricingType === "variation"
            ? validVariations.map((v, i) => ({
                label: v.label.trim(),
                description: v.description.trim() || null,
                price: parseFloat(v.price) || 0,
                sortOrder: i,
                inclusions: v.inclusions
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean),
              }))
            : [],
      });

      onSaved({
        id: result?.id ?? crypto.randomUUID(),
        name: values.name.trim(),
        price,
      });
      reset();
      setPkgVariations([]);
      setPricingType("flat");
    } catch {
      setFormError("Gagal menyimpan. Coba lagi.");
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
      <form
        onSubmit={handleSubmit(onSavePackage)}
        noValidate
        className="space-y-5"
      >
        <div className="mb-4 flex items-start justify-between border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {!hasPackages ? "Buat Paket Pertamamu" : "Tambah Paket Lagi"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Isi detail di bawah untuk menambahkan layanan paket Anda.
            </p>
          </div>
          {hasPackages && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-slate-200 p-1.5 text-slate-500 transition-colors hover:bg-slate-300 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-900">
            Nama Paket <span className="text-red-500">*</span>
          </label>
          <Input
            {...register("name", { required: "Nama paket wajib diisi" })}
            placeholder="Misal: Paket Dokumentasi Wedding"
            className="rounded-xl border-slate-200 bg-white"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-900">
            Deskripsi
          </label>
          <Textarea
            {...register("description")}
            placeholder="Jelaskan secara singkat layanan ini"
            rows={2}
            className="rounded-xl border-slate-200 bg-white"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-900">
              Kategori
            </label>
            <Controller
              name="pkgCatId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder="Pilih kategori"
                  options={categoryOptions}
                  className="rounded-xl border-slate-200 bg-white"
                />
              )}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-900">
              Kategori Acara
            </label>
            <Controller
              name="pkgEventCatId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder="Pilih kategori acara"
                  options={eventCategoryOptions}
                  className="rounded-xl border-slate-200 bg-white"
                />
              )}
            />
          </div>
        </div>

        <PackagePricingSection
          pricingType={pricingType}
          setPricingType={setPricingType}
          pkgVariations={pkgVariations}
          addVariation={addVariation}
          updateVariation={updateVariation}
          removeVariation={removeVariation}
          control={control}
          register={register}
        />

        {formError && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <Button
          type="submit"
          variant="outline"
          className="w-full rounded-xl border-slate-300 py-3 font-semibold transition-all hover:bg-slate-100"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-transparent" />
              Menyimpan...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Plus size={18} />
              {!hasPackages ? "Simpan Paket" : "Simpan Paket Ini"}
            </span>
          )}
        </Button>
      </form>
    </div>
  );
};
