"use client";

import {
  Modal,
  ModalBackdrop,
  ModalContainer,
  ModalDialog,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { Button, Input, Select, Textarea } from "@/components/ui";
import type { FinanceAccount, FinanceTransaction } from "@/services/finance";

interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  isOpen: boolean;
  editingTx: FinanceTransaction | null;
  accounts: FinanceAccount[];
  accountOptions: SelectOption[];
  onClose: () => void;
  onSave: (fd: FormData) => void;
  isSaving: boolean;
}

export const TransactionModal = ({
  isOpen,
  editingTx,
  accounts,
  accountOptions,
  onClose,
  onSave,
  isSaving,
}: Props) => {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <ModalBackdrop isDismissable />
      <ModalContainer size="lg">
        <ModalDialog>
          <ModalHeader>
            {editingTx ? "Edit Transaksi" : "Tambah Transaksi"}
          </ModalHeader>
          <ModalBody>
            <form
              id="tx-form"
              onSubmit={(e) => {
                e.preventDefault();
                onSave(new FormData(e.currentTarget));
              }}
              className="space-y-4 py-2"
            >
              <Select
                name="type"
                label="Jenis Transaksi"
                options={[
                  { value: "INCOME", label: "Pendapatan" },
                  { value: "EXPENSE", label: "Pengeluaran" },
                ]}
                defaultValue={editingTx?.type ?? "EXPENSE"}
              />
              <Select
                name="accountId"
                label="Rekening"
                options={accountOptions}
                defaultValue={editingTx?.accountId ?? accounts[0]?.id ?? ""}
              />
              <Input
                name="category"
                label="Kategori"
                placeholder="Misal: Penjualan, Sewa Ruangan"
                defaultValue={editingTx?.category ?? ""}
                required
              />
              <Input
                name="amount"
                type="number"
                label="Jumlah"
                step="1"
                min="1"
                placeholder="0"
                defaultValue={editingTx?.amount ?? ""}
                required
              />
              <Input
                name="transactionDate"
                type="date"
                label="Tanggal Transaksi"
                defaultValue={
                  editingTx
                    ? editingTx.transactionDate.slice(0, 10)
                    : new Date().toISOString().slice(0, 10)
                }
                required
              />
              <Input
                name="description"
                label="Deskripsi"
                placeholder="Deskripsi transaksi"
                defaultValue={editingTx?.description ?? ""}
              />
              <Textarea
                name="notes"
                label="Catatan"
                placeholder="Catatan tambahan"
                defaultValue={editingTx?.notes ?? ""}
                rows={2}
              />
            </form>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Batal
            </Button>
            <Button
              variant="primary"
              type="submit"
              form="tx-form"
              disabled={isSaving}
            >
              {isSaving ? "Menyimpan..." : "Simpan"}
            </Button>
          </ModalFooter>
        </ModalDialog>
      </ModalContainer>
    </Modal>
  );
};
