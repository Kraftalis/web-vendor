import type { Package, Category } from "../types";
import type { EventCategory } from "@/services/event-category";

export type ModalMode = "create" | "edit";

export interface PackageFormPayload {
  name: string;
  description: string | null;
  price: number;
  currency: string;
  isActive: boolean;
  categoryId: string | null;
  eventCategoryId: string | null;
  inclusions: string[];
  variations: {
    label: string;
    description: string | null;
    price: number;
    sortOrder: number;
    inclusions: string[];
  }[];
}

export interface PackageModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: ModalMode;
  editingPkg?: Package | null;
  categories: Category[];
  eventCategories: EventCategory[];
  onSave: (payload: PackageFormPayload) => void;
  isSaving: boolean;
}

export interface PackageFormViewProps {
  onClose: () => void;
  editingPkg?: Package | null;
  categories: Category[];
  eventCategories: EventCategory[];
  onSave: (payload: PackageFormPayload) => void;
  isSaving: boolean;
}
