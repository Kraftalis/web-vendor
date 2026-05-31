"use client";

import { useState, type ReactNode } from "react";
import {
  Modal,
  ModalBackdrop,
  ModalContainer,
  ModalDialog,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { BookingLinkForm } from "@/templates/event/booking-link-form";
import type { BookingLinkItem } from "@/services/booking";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingLink?: BookingLinkItem | null;
  defaultEventDate?: string;
}

export const BookingLinkModal = ({
  isOpen,
  onOpenChange,
  editingLink,
  defaultEventDate,
}: Props) => {
  const title = editingLink ? "Edit Tautan Booking" : "Buat Tautan Booking";
  const [footer, setFooter] = useState<ReactNode>(null);
  const onClose = () => onOpenChange(false);

  const labels = {
    title: "Buat Tautan Booking",
    editTitle: "Edit Tautan Booking",
    expiresIn: "Berakhir dalam",
    hours: "jam",
    submit: "Buat Tautan",
    close: "Tutup",
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalBackdrop isDismissable />
      <ModalContainer size="2xl">
        <ModalDialog>
          <ModalHeader>{title}</ModalHeader>
          <ModalBody>
            <BookingLinkForm
              onClose={onClose}
              editingLink={editingLink ?? undefined}
              defaultEventDate={defaultEventDate}
              labels={labels}
              renderFooter={setFooter}
            />
          </ModalBody>
          {footer && <ModalFooter>{footer}</ModalFooter>}
        </ModalDialog>
      </ModalContainer>
    </Modal>
  );
};
