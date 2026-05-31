"use client";

import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui";
import { Plus } from "lucide-react";
import { usePricingState } from "./use-pricing-state";
import { PackageSection } from "./package-section";
import { AddOnSection } from "./addon-section";
import { PackageModal } from "./package-modal";
import { AddOnModal } from "./addon-modal";

// ─── Types ──────────────────────────────────────────────────

interface PricingTemplateProps {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
}

// ─── Component ──────────────────────────────────────────────

export const PricingTemplate = ({ user }: PricingTemplateProps) => {
  const s = usePricingState();

  return (
    <AppLayout user={user}>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Paket Layanan
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Kelola paket dan add-on Anda
            </p>
          </div>
          <Button size="md" onClick={s.openAddPkg}>
            <Plus size={16} />
            Tambah Paket
          </Button>
        </div>

        {/* Packages */}
        <PackageSection
          packages={s.packages}
          isLoading={s.isLoadingPackages}
          query={s.query}
          setQuery={s.setQuery}
          sortBy={s.sortBy}
          setSortBy={s.setSortBy}
          sortDir={s.sortDir}
          setSortDir={s.setSortDir}
          pageSize={s.pageSize}
          setPageSize={s.setPageSize}
          categoryId={s.categoryId}
          setCategoryId={s.setCategoryId}
          categoryOptions={s.categoryOptions}
          page={s.page}
          setPage={s.setPage}
          total={s.total}
          onEdit={s.openEditPkg}
          onDelete={s.pkgDelete.handleDelete}
          deletingPkgId={s.pkgDelete.pendingId}
        />

        {/* Add-ons */}
        <AddOnSection
          addOns={s.addOns}
          isLoading={s.isLoadingAddOns}
          onAdd={s.openAddAddon}
          onEdit={s.openEditAddon}
          onDelete={s.addonDelete.handleDelete}
          deletingAddonId={s.addonDelete.pendingId}
        />
      </div>

      {/* Package Modal */}
      <PackageModal
        key={s.editingPkg?.id ?? "new"}
        isOpen={s.pkgModalOpen}
        onOpenChange={s.handlePkgOpenChange}
        mode={s.pkgMode}
        editingPkg={s.editingPkg}
        categories={s.categories}
        eventCategories={s.eventCategories}
        onSave={s.handleSavePackage}
        isSaving={s.isSavingPkg}
      />

      {/* Add-on Modal */}
      <AddOnModal
        key={s.editingAddon?.id ?? "new-addon"}
        isOpen={s.addonModalOpen}
        onOpenChange={s.handleAddonOpenChange}
        mode={s.addonMode}
        editingAddon={s.editingAddon}
        onSave={s.handleSaveAddOn}
        isSaving={s.isSavingAddon}
      />
    </AppLayout>
  );
}
