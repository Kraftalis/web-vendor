"use client";

import { Button } from "@/components/ui";
import { Plus } from "lucide-react";
import { VariationRow } from "./variation-row";

interface Variation {
  label: string;
  description: string;
  price: string;
  inclusions: string;
}

interface Props {
  variations: Variation[];
  onAdd: () => void;
  onChange: (
    i: number,
    field: "label" | "description" | "price" | "inclusions",
    value: string,
  ) => void;
  onRemove: (i: number) => void;
}

export const VariationEditor = ({
  variations,
  onAdd,
  onChange,
  onRemove,
}: Props) => {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-gray-700">Variasi Harga</p>
        <p className="mt-0.5 text-xs text-gray-400">
          Tambahkan variasi untuk paket ini (opsional)
        </p>
      </div>
      {variations.length > 0 && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2 px-3">
            <p className="text-xs font-medium text-gray-500">Label Variasi</p>
            <p className="text-xs font-medium text-gray-500">Harga</p>
          </div>
          {variations.map((v, i) => (
            <VariationRow
              key={i}
              variation={v}
              index={i}
              onChange={onChange}
              onRemove={onRemove}
              labelPlaceholder="Misal: Silver"
              descPlaceholder="Deskripsi (Opsional)"
              inclusionsPlaceholder="Fasilitas (1 per baris)"
            />
          ))}
        </div>
      )}
      <Button type="button" variant="outline" size="sm" onClick={onAdd}>
        <Plus size={14} />
        <span className="ml-1">Tambah Variasi Harga</span>
      </Button>
    </div>
  );
};
