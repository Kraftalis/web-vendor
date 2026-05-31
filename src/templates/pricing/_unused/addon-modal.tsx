"use client";

import { Button, Input, Textarea, Modal, Select } from "@/components/ui";
import { PackagePlus } from "lucide-react";
import type { AddOn } from "./types";

interface Props {
  open: boolean;
  editingAddon: AddOn | null;
  onClose: () => void;
  onSave: (payload: AddOnFormPayload) => void;
  isSaving: boolean;
}

export interface AddOnFormPayload {
  name: string;
  description: string | null;
  price: number;
  currency: string;
  isActive: boolean;
}

export default function AddOnModal({
  open,
  editingAddon,
  onClose,
  onSave,
  isSaving,
}: Props) {
  const handleSubmit = (formData: FormData) => {
    const name = formData.get("name") as string;
    const description = (formData.get("description") as string) || null;
    const price = parseFloat(formData.get("price") as string) || 0;
    const currency = (formData.get("currency") as string) || "IDR";
    const isActive = formData.get("isActiveHidden") === "true";

    onSave({ name, description, price, currency, isActive });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100/50 text-blue-600">
            <PackagePlus size={18} />
          </div>
          <span>{editingAddon ? "Edit Add-on" : "Tambah Add-on"}</span>
        </div>
      }
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose} disabled={isSaving}>
            Batal
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="addon-form"
            disabled={isSaving}
          >
            {isSaving ? "Menyimpan..." : "Simpan Add-on"}
          </Button>
        </>
      }
    >
      <form id="addon-form" action={handleSubmit} className="space-y-5 py-2">
        <Input
          name="name"
          label="Nama Add-on"
          placeholder="Misal: Extra Set, Extended Time..."
          defaultValue={editingAddon?.name ?? ""}
          required
        />
        
        <Textarea
          name="description"
          label="Deskripsi Opsional"
          placeholder="Jelaskan detail apa saja yang termasuk dalam add-on ini"
          defaultValue={editingAddon?.description ?? ""}
          rows={3}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="price"
            label="Harga"
            type="number"
            min="0"
            placeholder="0"
            defaultValue={editingAddon?.price ?? ""}
            required
            hint="Harga yang akan ditambahkan ke paket"
          />
          <Select
            name="currency"
            label="Mata Uang"
            defaultValue={editingAddon?.currency ?? "IDR"}
            options={[
              { label: "IDR (Rupiah)", value: "IDR" },
              { label: "USD (US Dollar)", value: "USD" },
            ]}
          />
        </div>

        {/* Custom Toggle for Active Status */}
        <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
          <div className="flex h-5 items-center">
            <input
              id="isActive"
              type="checkbox"
              defaultChecked={editingAddon?.isActive ?? true}
              onChange={(e) => {
                const hidden = e.target
                  .closest("form")
                  ?.querySelector<HTMLInputElement>('input[name="isActiveHidden"]');
                if (hidden) hidden.value = String(e.target.checked);
              }}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <input
              type="hidden"
              name="isActiveHidden"
              defaultValue={String(editingAddon?.isActive ?? true)}
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="isActive" className="text-sm font-medium text-gray-900 cursor-pointer">
              Status Aktif
            </label>
            <p className="text-xs text-gray-500">
              Jika aktif, add-on ini dapat dipilih oleh prospek saat booking.
            </p>
          </div>
        </div>
      </form>
    </Modal>
  );
}
