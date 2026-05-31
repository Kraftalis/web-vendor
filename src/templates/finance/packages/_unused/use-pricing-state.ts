"use client";

import { useState, useMemo } from "react";
import {
  useAddOns,
  useCategories,
  useCreatePackage,
  useUpdatePackage,
  useDeletePackage,
  useCreateAddOn,
  useUpdateAddOn,
  useDeleteAddOn,
} from "@/hooks/pricing";
import { useEventCategories } from "@/hooks";
import { useConfirmDelete } from "@/hooks/use-confirm-delete";
import type { Package, AddOn } from "./types";
import type { PackageFormPayload } from "./package-modal";
import type { AddOnFormPayload } from "./addon-modal";

export const usePricingState = () => {
  // ─── Queries ──────────────────────────────────────────────
  const addOnsQuery = useAddOns();
  const categoriesQuery = useCategories();
  const eventCategoriesQuery = useEventCategories();

  // ─── Mutations ────────────────────────────────────────────
  const createPkg = useCreatePackage();
  const updatePkg = useUpdatePackage();
  const deletePkg = useDeletePackage();
  const createAddon = useCreateAddOn();
  const updateAddon = useUpdateAddOn();
  const deleteAddon = useDeleteAddOn();

  // ─── Derived data ─────────────────────────────────────────
  const addOns: AddOn[] = addOnsQuery.data?.data ?? [];
  const categories = useMemo(
    () => categoriesQuery.data ?? [],
    [categoriesQuery.data],
  );
  const eventCategories = useMemo(
    () => eventCategoriesQuery.data ?? [],
    [eventCategoriesQuery.data],
  );

  // ─── Package modal ────────────────────────────────────────
  const [pkgModalOpen, setPkgModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<Package | null>(null);

  const openAddPkg = () => {
    setEditingPkg(null);
    setPkgModalOpen(true);
  };

  const openEditPkg = (pkg: Package) => {
    setEditingPkg(pkg);
    setPkgModalOpen(true);
  };

  const closePkgModal = () => {
    setPkgModalOpen(false);
    setEditingPkg(null);
  };

  const handleSavePackage = (payload: PackageFormPayload) => {
    if (editingPkg) {
      updatePkg.mutate(
        { id: editingPkg.id, payload },
        { onSuccess: closePkgModal },
      );
    } else {
      createPkg.mutate(payload, { onSuccess: closePkgModal });
    }
  };

  const pkgDelete = useConfirmDelete((id) => deletePkg.mutate(id));

  // ─── Add-on modal ─────────────────────────────────────────
  const [addonModalOpen, setAddonModalOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState<AddOn | null>(null);

  const openAddAddon = () => {
    setEditingAddon(null);
    setAddonModalOpen(true);
  };

  const openEditAddon = (addon: AddOn) => {
    setEditingAddon(addon);
    setAddonModalOpen(true);
  };

  const closeAddonModal = () => {
    setAddonModalOpen(false);
    setEditingAddon(null);
  };

  const handleSaveAddOn = (payload: AddOnFormPayload) => {
    if (editingAddon) {
      updateAddon.mutate(
        { id: editingAddon.id, payload },
        { onSuccess: closeAddonModal },
      );
    } else {
      createAddon.mutate(payload, { onSuccess: closeAddonModal });
    }
  };

  const addonDelete = useConfirmDelete((id) => deleteAddon.mutate(id));

  return {
    // Data
    addOns,
    categories,
    eventCategories,
    isLoadingAddOns: addOnsQuery.isLoading,
    // Package modal
    pkgModalOpen,
    editingPkg,
    openAddPkg,
    openEditPkg,
    closePkgModal,
    handleSavePackage,
    isSavingPkg: createPkg.isPending || updatePkg.isPending,
    pkgDelete,
    // Add-on modal
    addonModalOpen,
    editingAddon,
    openAddAddon,
    openEditAddon,
    closeAddonModal,
    handleSaveAddOn,
    isSavingAddon: createAddon.isPending || updateAddon.isPending,
    addonDelete,
  };
};
