"use client";

import React from "react";
import { NumericFormat } from "react-number-format";
import { Trash2 } from "lucide-react";
import { Input, Textarea } from "@/components/ui";

interface Props {
  variation: {
    label: string;
    description: string;
    price: string;
    inclusions: string;
  };
  index: number;
  onChange: (
    index: number,
    field: "label" | "description" | "price" | "inclusions",
    value: string,
  ) => void;
  onRemove: (index: number) => void;
  labelPlaceholder?: string;
  descPlaceholder?: string;
  inclusionsPlaceholder?: string;
}

export const VariationRow = ({
  variation,
  index,
  onChange,
  onRemove,
  labelPlaceholder = "Misal: Silver",
  descPlaceholder = "Deskripsi variasi",
  inclusionsPlaceholder = "Masukkan setiap komponen pada baris baru",
}: Props) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
      <div className="flex items-start gap-2">
        <div className="flex-1 space-y-2">
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              type="text"
              value={variation.label}
              onChange={(e) => onChange(index, "label", e.target.value)}
              placeholder={labelPlaceholder}
            />
            <NumericFormat
              customInput={Input}
              allowNegative={false}
              thousandSeparator="."
              decimalSeparator=","
              prefix="Rp "
              value={variation.price}
              onValueChange={(values) => onChange(index, "price", values.value)}
              placeholder="Rp 0"
            />
          </div>
          <Input
            type="text"
            value={variation.description}
            onChange={(e) => onChange(index, "description", e.target.value)}
            placeholder={descPlaceholder}
          />
          <Textarea
            value={variation.inclusions}
            onChange={(e) => onChange(index, "inclusions", e.target.value)}
            placeholder={inclusionsPlaceholder}
            rows={3}
          />
        </div>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="mt-1 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
          aria-label="Remove variation"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
