import type { AddOn } from "../types";

export type ModalMode = "create" | "edit";

export interface AddOnFormPayload {
  name: string;
  description: string | null;
  price: number;
  currency: string;
  isActive: boolean;
}

export interface AddOnModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: ModalMode;
  editingAddon?: AddOn | null;
  onSave: (payload: AddOnFormPayload) => void;
  isSaving: boolean;
}

export interface AddOnFormViewProps {
  onClose: () => void;
  editingAddon?: AddOn | null;
  onSave: (payload: AddOnFormPayload) => void;
  isSaving: boolean;
}
