"use client";

import { useState } from "react";
import { Button, Modal } from "@/components/ui";
import PackageFormFields from "./package-form-fields";
import type { Package, Category } from "./types";
import type { EventCategory } from "@/services/event-category";

interface Props {
  open: boolean;
  editingPkg: Package | null;
  categories: Category[];
  eventCategories: EventCategory[];
  onClose: () => void;
  onSave: (payload: PackageFormPayload) => void;
  isSaving: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: Record<string, any>;
}

export interface PackageFormPayload {
  name: string;
  description: string | null;
  price: number;
  currency: string;
  isActive: boolean;
  categoryId: string | null;
  eventCategoryId: string | null;
  inclusions: string[];
  variations: {
    label: string;
    description: string | null;
    price: number;
    sortOrder: number;
    inclusions: string[];
  }[];
}

export default function PackageModal({
  open,
  editingPkg,
  categories,
  eventCategories,
  onClose,
  onSave,
  isSaving,
  dict,
}: Props) {
  const pricing = dict.pricing;

  const [variations, setVariations] = useState<
    { label: string; description: string; price: string; inclusions: string }[]
  >(
    editingPkg
      ? editingPkg.items.map((v) => ({
          label: v.label,
          description: v.description ?? "",
          price: v.price,
          inclusions: (v.inclusions ?? []).join("\n"),
        }))
      : [],
  );

  const [inclusionDraft, setInclusionDraft] = useState(
    editingPkg ? (editingPkg.inclusions ?? []).join("\n") : "",
  );
  const [catId, setCatId] = useState(editingPkg?.category?.id ?? "");
  const [eventCatId, setEventCatId] = useState(
    editingPkg?.eventCategory?.id ?? "",
  );

  const addVariation = () =>
    setVariations((prev) => [
      ...prev,
      { label: "", description: "", price: "", inclusions: "" },
    ]);

  const updateVariation = (
    i: number,
    field: "label" | "description" | "price" | "inclusions",
    value: string,
  ) =>
    setVariations((prev) =>
      prev.map((v, idx) => (idx === i ? { ...v, [field]: value } : v)),
    );

  const removeVariation = (i: number) =>
    setVariations((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = (formData: FormData) => {
    const name = formData.get("name") as string;
    const description = (formData.get("description") as string) || null;
    const flatPrice = (formData.get("flatPrice") as string) || "0";
    const currency = (formData.get("currency") as string) || "IDR";
    const isActive = formData.get("isActive") === "true";

    const validVariations = variations.filter(
      (v) => v.label.trim() && v.price !== "",
    );
    const inclusions = inclusionDraft
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    onSave({
      name,
      description,
      price:
        validVariations.length > 0
          ? Math.min(...validVariations.map((v) => parseFloat(v.price) || 0))
          : parseFloat(flatPrice) || 0,
      currency,
      isActive,
      categoryId: catId || null,
      eventCategoryId: eventCatId || null,
      inclusions,
      variations: validVariations.map((v, i) => ({
        label: v.label.trim(),
        description: v.description.trim() || null,
        price: parseFloat(v.price) || 0,
        sortOrder: i,
        inclusions: v.inclusions
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
      })),
    });
  };

  const editDefaults = {
    name: editingPkg?.name ?? "",
    description: editingPkg?.description ?? "",
    currency: editingPkg?.currency ?? "IDR",
    price: String(editingPkg?.price ?? "0"),
    isActive: editingPkg?.isActive ?? true,
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingPkg ? pricing.editPackage : pricing.addPackage}
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose}>
            {dict.common.cancel}
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="pkg-form"
            disabled={isSaving}
          >
            {dict.common.save}
          </Button>
        </>
      }
    >
      <form id="pkg-form" action={handleSubmit} className="space-y-5">
        <PackageFormFields
          editDefaults={editDefaults}
          categories={categories}
          catId={catId}
          setCatId={setCatId}
          eventCategories={eventCategories}
          eventCatId={eventCatId}
          setEventCatId={setEventCatId}
          variations={variations}
          onAddVariation={addVariation}
          onUpdateVariation={updateVariation}
          onRemoveVariation={removeVariation}
          inclusionDraft={inclusionDraft}
          setInclusionDraft={setInclusionDraft}
          pricing={pricing}
        />
      </form>
    </Modal>
  );
}
