"use client";

import { useState, useMemo } from "react";
import { Button, Input, SkeletonCard } from "@/components/ui";
import { Search, Plus } from "lucide-react";
import {
  usePricing,
  useCategories,
  useCreatePackage,
  useUpdatePackage,
  useDeletePackage,
} from "@/hooks/pricing";
import { useEventCategories } from "@/hooks";
import { useConfirmDelete } from "@/hooks/use-confirm-delete";
import { PricingControls } from "./pricing-controls";
import { PackageGridCard } from "./package-grid-card";
import { PackageListItem } from "./package-list-item";
import { PackageModal } from "./package-modal";
import type { Package } from "./types";
import type { PackageFormPayload } from "./package-modal";

export const PackageSection = () => {
  // ─── Filter state ──────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price" | "status">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [categoryId, setCategoryId] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  // ─── Modal state ───────────────────────────────────────────
  const [pkgModalOpen, setPkgModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<Package | null>(null);

  // ─── Data ──────────────────────────────────────────────────
  const pricingQuery = usePricing({
    page,
    limit: pageSize,
    search: query || undefined,
    sortBy,
    sortDir,
    categoryId: categoryId || undefined,
  });
  const categoriesQuery = useCategories();
  const eventCategoriesQuery = useEventCategories();

  const packages: Package[] = pricingQuery.data?.data?.packages ?? [];
  const total = pricingQuery.data?.meta?.total ?? packages.length;
  const isLoading = pricingQuery.isLoading;
  const categories = useMemo(
    () => categoriesQuery.data ?? [],
    [categoriesQuery.data],
  );
  const eventCategories = useMemo(
    () => eventCategoriesQuery.data ?? [],
    [eventCategoriesQuery.data],
  );
  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: c.id, label: c.name })),
    [categories],
  );

  // ─── Mutations ─────────────────────────────────────────────
  const createPkg = useCreatePackage();
  const updatePkg = useUpdatePackage();
  const deletePkg = useDeletePackage();
  const pkgDelete = useConfirmDelete((id) => deletePkg.mutate(id));

  // ─── Handlers ──────────────────────────────────────────────
  const openAdd = () => {
    setEditingPkg(null);
    setPkgModalOpen(true);
  };
  const openEdit = (pkg: Package) => {
    setEditingPkg(pkg);
    setPkgModalOpen(true);
  };
  const closeModal = () => {
    setPkgModalOpen(false);
    setEditingPkg(null);
  };
  const toggleExpanded = (id: string) =>
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleSave = (payload: PackageFormPayload) => {
    if (editingPkg) {
      updatePkg.mutate(
        { id: editingPkg.id, payload },
        { onSuccess: closeModal },
      );
    } else {
      createPkg.mutate(payload, { onSuccess: closeModal });
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;

  return (
    <section className="space-y-4">
      {/* Section header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Paket Layanan</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Kelola paket yang ditawarkan kepada klien
          </p>
        </div>
        <Button size="md" onClick={openAdd}>
          <Plus size={16} />
          Tambah Paket
        </Button>
      </div>

      {/* Filters + Search + View Toggle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
          />
          <Input
            type="text"
            placeholder="Cari paket..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        <PricingControls
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortDir={sortDir}
          setSortDir={setSortDir}
          pageSize={pageSize}
          setPageSize={setPageSize}
          categoryId={categoryId}
          setCategoryId={setCategoryId}
          categoryOptions={categoryOptions}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} lines={4} />
          ))}
        </div>
      )}

      {/* Grid View */}
      {!isLoading && viewMode === "grid" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <PackageGridCard
              key={pkg.id}
              pkg={pkg}
              onEdit={openEdit}
              onDelete={pkgDelete.handleDelete}
              isDeleting={pkgDelete.pendingId === pkg.id}
            />
          ))}
        </div>
      )}

      {/* List View */}
      {!isLoading && viewMode === "list" && (
        <div className="space-y-3">
          {packages.map((pkg) => (
            <PackageListItem
              key={pkg.id}
              pkg={pkg}
              isExpanded={!!expandedIds[pkg.id]}
              onToggle={() => toggleExpanded(pkg.id)}
              onEdit={openEdit}
              onDelete={pkgDelete.handleDelete}
              isDeleting={pkgDelete.pendingId === pkg.id}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && (
        <div className="flex items-center justify-between py-3">
          <div className="text-sm text-gray-600">
            {`Showing ${start + 1}–${Math.min(start + pageSize, total)} of ${total}`}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Prev
            </Button>
            <div className="text-sm">
              {currentPage} / {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <PackageModal
        key={editingPkg?.id ?? "new"}
        isOpen={pkgModalOpen}
        editingPkg={editingPkg}
        categories={categories}
        eventCategories={eventCategories}
        onClose={closeModal}
        onSave={handleSave}
        isSaving={createPkg.isPending || updatePkg.isPending}
      />
    </section>
  );
};
