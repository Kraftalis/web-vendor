"use client";

import { useState } from "react";
import { format } from "date-fns";
import Button from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import Input from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadButton } from "@/components/form/upload-button";
import { IconFileText, IconPhoto } from "@tabler/icons-react";

interface CostFormProps {
  onSubmit: (data: {
    label: string;
    amount: string;
    transactionDate: string;
    receiptFile: File | null;
  }) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

export const CostForm = ({
  onSubmit,
  isSubmitting,
  onCancel,
}: CostFormProps) => {
  const [formData, setFormData] = useState({
    label: "",
    amount: "",
    transactionDate: format(new Date(), "yyyy-MM-dd"),
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, receiptFile });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2">
          <Label>Label</Label>
          <Input
            value={formData.label}
            onChange={(e) =>
              setFormData({ ...formData, label: e.target.value })
            }
            placeholder="Cost label (e.g. Transport, Food, etc.)"
            required
          />
        </div>

        <div className="space-y-2 col-span-2 sm:col-span-1">
          <Label>Jumlah</Label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              IDR
            </span>
            <Input
              required
              type="number"
              min="0"
              step="1"
              placeholder="Contoh: 500000"
              value={formData.amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev) => ({ ...prev, amount: e.target.value }))
              }
              className="pl-12"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Tanggal</Label>
          <Input
            required
            type="date"
            value={formData.transactionDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData((prev) => ({
                ...prev,
                transactionDate: e.target.value,
              }))
            }
          />
        </div>

        <div className="space-y-2 col-span-2">
          <Label>Tanda Terima</Label>
          <div className="rounded-lg border-2 border-dashed border-slate-200 p-4 text-center hover:bg-slate-50/50 flex flex-col items-center justify-center">
            {receiptFile ? (
              <div className="flex items-center gap-2 text-sm text-slate-700 w-full justify-between">
                <div className="flex items-center gap-2 truncate max-w-50">
                  <IconPhoto size={16} className="text-slate-400 shrink-0" />
                  <span className="truncate">{receiptFile.name}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 h-6 px-2"
                  onClick={() => setReceiptFile(null)}
                >
                  Clear
                </Button>
              </div>
            ) : (
              <UploadButton
                accept="image/*,application/pdf"
                onFileSelect={(file: File) => setReceiptFile(file ?? null)}
                buttonNode={
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <IconFileText size={16} className="mr-2" />
                    Select File
                  </Button>
                }
                uploadButtonLabel="Select File"
              />
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Spinner className="mr-2 h-4 w-4" />}
          Simpan Biaya
        </Button>
      </div>
    </form>
  );
};
