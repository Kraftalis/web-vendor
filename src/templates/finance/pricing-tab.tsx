"use client";

import { Button } from "@/components/ui";
import { IconPlus } from "@/components/icons";
import { useDictionary } from "@/i18n";
import { usePricingState } from "@/templates/pricing/use-pricing-state";
import PackageSection from "@/templates/pricing/package-section";
import AddOnSection from "@/templates/pricing/addon-section";
import PackageModal from "@/templates/pricing/package-modal";
import AddOnModal from "@/templates/pricing/addon-modal";

/**
 * Packages & Add-ons tab — reuses the existing pricing components.
 */
export default function PricingTab() {
  const { dict } = useDictionary();
  const pricing = dict.pricing;
  const s = usePricingState();

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {pricing.packagesTitle}
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">{pricing.subtitle}</p>
        </div>
        <Button size="md" onClick={s.openAddPkg}>
          <IconPlus size={16} />
          {pricing.addPackage}
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
        dict={dict}
      />

      {/* Add-ons */}
      <AddOnSection
        addOns={s.addOns}
        isLoading={s.isLoadingAddOns}
        onAdd={s.openAddAddon}
        onEdit={s.openEditAddon}
        onDelete={s.addonDelete.handleDelete}
        deletingAddonId={s.addonDelete.pendingId}
        dict={dict}
      />

      {/* Package Modal */}
      <PackageModal
        key={s.editingPkg?.id ?? "new"}
        open={s.pkgModalOpen}
        editingPkg={s.editingPkg}
        categories={s.categories}
        eventCategories={s.eventCategories}
        onClose={s.closePkgModal}
        onSave={s.handleSavePackage}
        isSaving={s.isSavingPkg}
        dict={dict}
      />

      {/* Add-on Modal */}
      <AddOnModal
        key={s.editingAddon?.id ?? "new-addon"}
        open={s.addonModalOpen}
        editingAddon={s.editingAddon}
        onClose={s.closeAddonModal}
        onSave={s.handleSaveAddOn}
        isSaving={s.isSavingAddon}
        dict={dict}
      />
    </div>
  );
}
