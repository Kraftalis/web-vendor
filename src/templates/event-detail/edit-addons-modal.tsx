"use client";

import {
  Modal,
  ModalBackdrop,
  ModalContainer,
  ModalDialog,
  ModalHeader,
} from "@heroui/react";
import { EditAddOnsModalContent } from "./edit-addons-modal-content";
import type { formatCurrency } from "../event/types";
import type { AddOnSnapshot } from "../event/types";

interface EditAddOnsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentSnapshot: AddOnSnapshot[];
  onSave: (snapshot: AddOnSnapshot[]) => void;
  isSaving: boolean;
  formatCurrencyFn: typeof formatCurrency;
  currency: string;
}

export const EditAddOnsModal = ({
  isOpen,
  onOpenChange,
  currentSnapshot,
  onSave,
  isSaving,
  formatCurrencyFn,
  currency,
}: EditAddOnsModalProps) => {
  const onClose = () => onOpenChange(false);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalBackdrop isDismissable />
      <ModalContainer size="xl">
        <ModalDialog>
          <ModalHeader>Edit Add-on</ModalHeader>
          <EditAddOnsModalContent
            currentSnapshot={currentSnapshot}
            onSave={onSave}
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
