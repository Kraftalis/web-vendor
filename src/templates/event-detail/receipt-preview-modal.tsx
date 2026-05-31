"use client";

import {
  Modal,
  ModalBackdrop,
  ModalContainer,
  ModalDialog,
  ModalHeader,
  ModalBody,
} from "@heroui/react";
import { IconDocument } from "@/components/icons";

interface ReceiptPreviewModalProps {
  receipt: { url: string; name: string; type: string } | null;
  onClose: () => void;
}

export const ReceiptPreviewModal = ({
  receipt,
  onClose,
}: ReceiptPreviewModalProps) => {
  return (
    <Modal isOpen={!!receipt} onOpenChange={(open) => !open && onClose()}>
      <ModalBackdrop isDismissable />
      <ModalContainer size="2xl">
        <ModalDialog>
          <ModalHeader>{receipt?.name ?? "Lihat Tanda Terima"}</ModalHeader>
          <ModalBody>
            {receipt && (
              <div className="flex flex-col items-center gap-4">
                {receipt.type.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={receipt.url}
                    alt={receipt.name}
                    className="max-h-[60vh] w-full rounded-lg object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 py-8">
                    <IconDocument size={48} className="text-gray-300" />
                    <p className="text-sm text-gray-600">{receipt.name}</p>
                  </div>
                )}
                <a
                  href={receipt.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  Buka di tab baru ↗
                </a>
              </div>
            )}
          </ModalBody>
        </ModalDialog>
      </ModalContainer>
    </Modal>
  );
};
