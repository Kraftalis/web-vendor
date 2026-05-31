"use client";

import {
  Modal,
  ModalBackdrop,
  ModalContainer,
  ModalDialog,
  ModalHeader,
} from "@heroui/react";
import { EditPackageModalContent } from "./edit-package-modal-content";
import type { formatCurrency } from "../event/types";
import type { PackageSnapshot } from "../event/types";

interface EditPackageModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentSnapshot: PackageSnapshot | null;
  onSave: (snapshot: PackageSnapshot | null) => void;
  isSaving: boolean;
  formatCurrencyFn: typeof formatCurrency;
  currency: string;
}

export const EditPackageModal = ({
  isOpen,
  onOpenChange,
  currentSnapshot,
  onSave,
  isSaving,
  formatCurrencyFn,
  currency,
}: EditPackageModalProps) => {
  const onClose = () => onOpenChange(false);

  const handleSave = (snapshot: PackageSnapshot | null) => {
    onSave(snapshot);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalBackdrop isDismissable />
      <ModalContainer size="lg">
        <ModalDialog>
          <ModalHeader>Edit Paket</ModalHeader>
          <EditPackageModalContent
            currentSnapshot={currentSnapshot}
            onSave={handleSave}
            onClose={onClose}
            isSaving={isSaving}
            formatCurrencyFn={formatCurrencyFn}
            currency={currency}
          />
        </ModalDialog>
      </ModalContainer>
    </Modal>
  );
};
