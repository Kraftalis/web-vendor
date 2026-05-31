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
import { Button } from "@/components/ui";

interface CancelEventModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isSaving: boolean;
}

export const CancelEventModal = ({
  isOpen,
  onOpenChange,
  onConfirm,
  isSaving,
}: CancelEventModalProps) => {
  const onClose = () => onOpenChange(false);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalBackdrop isDismissable />
      <ModalContainer size="md">
        <ModalDialog>
          <ModalHeader>Batalkan Acara</ModalHeader>
          <ModalBody>
            <p className="text-sm text-slate-600">
              Apakah Anda yakin ingin membatalkan acara ini? Jika Anda perlu
              mengeluarkan refund, tambahkan dari tab pembayaran.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={onClose}>
              Kembali
            </Button>
            <Button
              variant="danger"
              onClick={onConfirm}
              disabled={isSaving}
              isLoading={isSaving}
            >
              Konfirmasi Pembatalan
            </Button>
          </ModalFooter>
        </ModalDialog>
      </ModalContainer>
    </Modal>
  );
};
