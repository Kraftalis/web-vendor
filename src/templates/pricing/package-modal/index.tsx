"use client";

import type { ComponentType } from "react";
import {
  Modal,
  ModalBackdrop,
  ModalContainer,
  ModalDialog,
  ModalHeader,
} from "@heroui/react";
import { CreateView } from "./create-view";
import { EditView } from "./edit-view";
import type {
  PackageModalProps,
  ModalMode,
  PackageFormViewProps,
} from "./types";

const VIEWS: Record<ModalMode, ComponentType<PackageFormViewProps>> = {
  create: CreateView,
  edit: EditView,
};

const TITLES: Record<ModalMode, string> = {
  create: "Buat Paket",
  edit: "Edit Paket",
};

export const PackageModal = ({
  isOpen,
  onOpenChange,
  mode,
  editingPkg,
  categories,
  eventCategories,
  onSave,
  isSaving,
}: PackageModalProps) => {
  const View = VIEWS[mode];
  const onClose = () => onOpenChange(false);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalBackdrop isDismissable />
      <ModalContainer size="2xl">
        <ModalDialog>
          <ModalHeader>{TITLES[mode]}</ModalHeader>
          <View
            onClose={onClose}
            editingPkg={editingPkg}
            categories={categories}
            eventCategories={eventCategories}
            onSave={onSave}
            isSaving={isSaving}
          />
        </ModalDialog>
      </ModalContainer>
    </Modal>
  );
};

export type { PackageFormPayload } from "./types";
