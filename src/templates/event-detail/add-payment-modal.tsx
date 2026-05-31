"use client";

import {
  Modal,
  ModalBackdrop,
  ModalContainer,
  ModalDialog,
  ModalHeader,
  ModalBody,
} from "@heroui/react";
import { AddPaymentForm } from "./add-payment-form";

interface AddPaymentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    amount: string;
    paymentType: string;
    note: string;
    receiptFile: File | null;
  }) => void;
  isSubmitting: boolean;
  paymentTypeMap: Record<string, string>;
}

export const AddPaymentModal = ({
  isOpen,
  onOpenChange,
  onSubmit,
  isSubmitting,
  paymentTypeMap,
}: AddPaymentModalProps) => {
  const onClose = () => onOpenChange(false);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalBackdrop isDismissable />
      <ModalContainer size="lg">
        <ModalDialog>
          <ModalHeader>Tambah Pembayaran</ModalHeader>
          <ModalBody>
            <AddPaymentForm
              onSubmit={onSubmit}
              isSubmitting={isSubmitting}
              paymentTypeMap={paymentTypeMap}
              onCancel={onClose}
            />
          </ModalBody>
        </ModalDialog>
      </ModalContainer>
    </Modal>
  );
};
