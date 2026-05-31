"use client";

import {
  Modal,
  ModalBackdrop,
  ModalContainer,
  ModalDialog,
  ModalHeader,
  ModalBody,
} from "@heroui/react";
import { CostForm } from "./cost-form";

interface AddCostModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    label: string;
    amount: string;
    transactionDate: string;
    receiptFile: File | null;
  }) => void;
  isSubmitting: boolean;
}

export const AddCostModal = ({
  isOpen,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: AddCostModalProps) => {
  const onClose = () => onOpenChange(false);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalBackdrop isDismissable />
      <ModalContainer size="lg">
        <ModalDialog>
          <ModalHeader>Tambah Biaya</ModalHeader>
          <ModalBody>
            <CostForm
              onSubmit={onSubmit}
              isSubmitting={isSubmitting}
              onCancel={onClose}
            />
          </ModalBody>
        </ModalDialog>
      </ModalContainer>
    </Modal>
  );
};
