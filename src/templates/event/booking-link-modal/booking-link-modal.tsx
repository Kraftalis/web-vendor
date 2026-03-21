"use client";

import { Modal } from "@/components/ui";
import { BookingLinkForm } from "@/templates/event/booking-link-form";
import type { BookingLinkItem } from "@/services/booking";

interface Props {
  open: boolean;
  onClose: () => void;
  editingLink?: BookingLinkItem | null;
  defaultEventDate?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  labels: Record<string, any>;
}

export default function BookingLinkModal({
  open,
  onClose,
  editingLink,
  defaultEventDate,
  labels,
}: Props) {
  const title = editingLink
    ? (labels.editTitle ?? "Edit Booking Link")
    : (labels.configTitle ?? "Create Booking Link");

  return (
    <Modal open={open} onClose={onClose} title={title} className="max-w-2xl">
      <BookingLinkForm
        onClose={onClose}
        editingLink={editingLink ?? undefined}
        defaultEventDate={defaultEventDate}
        labels={labels}
      />
    </Modal>
  );
}
