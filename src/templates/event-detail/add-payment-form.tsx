"use client";

import { useState } from "react";
import { Button, Input, Select } from "@/components/ui";
import { IconUpload } from "@/components/icons";

interface AddPaymentFormProps {
  onSubmit: (data: {
    amount: string;
    paymentType: string;
    note: string;
    receiptFile: File | null;
  }) => void;
  isSubmitting: boolean;
  paymentTypeMap: Record<string, string>;
  onCancel: () => void;
}

export const AddPaymentForm = ({
  onSubmit,
  isSubmitting,
  onCancel,
}: AddPaymentFormProps) => {
  const [amount, setAmount] = useState("");
  const [paymentType, setPaymentType] = useState("INSTALLMENT");
  const [note, setNote] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ amount, paymentType, note, receiptFile });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Jumlah Pembayaran"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />

      <Select
        label="Jenis Pembayaran"
        value={paymentType}
        onChange={(e) => setPaymentType(e.target.value)}
        options={[
          { value: "DOWN_PAYMENT", label: "Uang Muka" },
          { value: "INSTALLMENT", label: "Cicilan" },
          { value: "FULL_PAYMENT", label: "Pembayaran Penuh" },
          { value: "REFUND", label: "Refund" },
        ]}
      />

      <Input
        label="Catatan Pembayaran"
        placeholder="Masukkan catatan..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Pilih File
        </label>
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-gray-300 p-3 transition-colors hover:border-blue-400 hover:bg-blue-50/50">
          <IconUpload size={20} className="text-gray-400" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-gray-600">
              {receiptFile ? receiptFile.name : "Tidak ada file dipilih"}
            </p>
            {receiptFile && (
              <p className="text-xs text-gray-400">
                {(receiptFile.size / 1024).toFixed(0)} KB
              </p>
            )}
          </div>
          <input
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" type="button" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {isSubmitting ? "Mengunggah..." : "Catat Pembayaran"}
        </Button>
      </div>
    </form>
  );
};
