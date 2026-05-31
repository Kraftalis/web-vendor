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
import { Button, Input, Textarea } from "@/components/ui";
import type { FinanceAccount } from "@/services/finance";

interface Props {
  isOpen: boolean;
  editingAcct: FinanceAccount | null;
  onClose: () => void;
  onSave: (fd: FormData) => void;
  isSaving: boolean;
}

export const AccountModal = ({
  isOpen,
  editingAcct,
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
            {editingAcct ? "Edit Rekening" : "Tambah Rekening"}
          </ModalHeader>
          <ModalBody>
            <form
              id="account-form"
              onSubmit={(e) => {
                e.preventDefault();
                onSave(new FormData(e.currentTarget));
              }}
              className="space-y-4 py-2"
            >
              <Input
                name="name"
                label="Nama Rekening"
                placeholder="Misal: Rekening Utama"
                defaultValue={editingAcct?.name ?? ""}
                required
              />
              <Textarea
                name="description"
                label="Deskripsi (Opsional)"
                placeholder="Tambahkan catatan tentang rekening ini"
                defaultValue={editingAcct?.description ?? ""}
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
              form="account-form"
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
