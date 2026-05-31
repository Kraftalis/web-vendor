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
import type { AddOnModalProps, ModalMode, AddOnFormViewProps } from "./types";

const VIEWS: Record<ModalMode, ComponentType<AddOnFormViewProps>> = {
  create: CreateView,
  edit: EditView,
};

const TITLES: Record<ModalMode, string> = {
  create: "Tambah Add-on",
  edit: "Edit Add-on",
};

export const AddOnModal = ({
  isOpen,
  onOpenChange,
  mode,
  editingAddon,
  onSave,
  isSaving,
}: AddOnModalProps) => {
  const View = VIEWS[mode];
  const onClose = () => onOpenChange(false);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalBackdrop isDismissable />
      <ModalContainer size="xl">
        <ModalDialog>
          <ModalHeader>{TITLES[mode]}</ModalHeader>
          <View
            onClose={onClose}
            editingAddon={editingAddon}
            onSave={onSave}
            isSaving={isSaving}
          />
        </ModalDialog>
      </ModalContainer>
    </Modal>
  );
};

export type { AddOnFormPayload } from "./types";
