"use client";

import { useState } from "react";
import { Button, Input, SkeletonCard } from "@/components/ui";
import { IconSearch } from "@/components/icons";
import PricingControls from "./pricing-controls";
import PackageGridCard from "./package-grid-card";
import PackageListItem from "./package-list-item";
import type { Package } from "./types";

interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  packages: Package[];
  isLoading: boolean;
  query: string;
  setQuery: (v: string) => void;
  sortBy: "name" | "price" | "status";
  setSortBy: (v: "name" | "price" | "status") => void;
  sortDir: "asc" | "desc";
  setSortDir: (v: "asc" | "desc") => void;
  pageSize: number;
  setPageSize: (v: number) => void;
  categoryId: string;
  setCategoryId: (v: string) => void;
  categoryOptions: SelectOption[];
  page: number;
  setPage: (v: number | ((p: number) => number)) => void;
  total: number;
  onEdit: (pkg: Package) => void;
  onDelete: (id: string) => void;
  deletingPkgId: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: Record<string, any>;
}

export default function PackageSection({
  packages,
  isLoading,
  query,
  setQuery,
  sortBy,
  setSortBy,
  sortDir,
  setSortDir,
  pageSize,
  setPageSize,
  categoryId,
  setCategoryId,
  categoryOptions,
  page,
  setPage,
  total,
  onEdit,
  onDelete,
  deletingPkgId,
  dict,
}: Props) {
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggleExpanded = (id: string) =>
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;

  return (
    <section className="space-y-4">
      {/* Filters + Search + View Toggle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        <div className="relative flex-1 min-w-48">
          <IconSearch
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
          />
          <Input
            type="text"
            placeholder="Search packages..."
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
              onEdit={onEdit}
              onDelete={onDelete}
              isDeleting={deletingPkgId === pkg.id}
              dict={dict}
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
              onEdit={onEdit}
              onDelete={onDelete}
              isDeleting={deletingPkgId === pkg.id}
              dict={dict}
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
              onClick={() => setPage((p: number) => Math.max(1, p - 1))}
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
              onClick={() =>
                setPage((p: number) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
