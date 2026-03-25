"use client";

import React from "react";
import { Select } from "@/components/ui";
import { IconGrid, IconList } from "@/components/icons";

interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  sortBy: string;
  setSortBy: (v: "name" | "price" | "status") => void;
  sortDir: string;
  setSortDir: (v: "asc" | "desc") => void;
  pageSize: number;
  setPageSize: (v: number) => void;
  categoryId: string;
  setCategoryId: (v: string) => void;
  categoryOptions: SelectOption[];
  viewMode: "grid" | "list";
  setViewMode: (v: "grid" | "list") => void;
}

/**
 * Inline filter selects + view toggle for the pricing page.
 * Renders as a flat row — the parent owns the flex container.
 */
export default function PricingControls({
  sortBy,
  setSortBy,
  sortDir,
  setSortDir,
  pageSize,
  setPageSize,
  categoryId,
  setCategoryId,
  categoryOptions,
  viewMode,
  setViewMode,
}: Props) {
  return (
    <>
      <Select
        value={categoryId}
        onChange={(e) => {
          setCategoryId(e.target.value);
        }}
        options={[{ value: "", label: "All categories" }, ...categoryOptions]}
        className="w-auto"
      />
      <Select
        value={`${sortBy}_${sortDir}`}
        onChange={(e) => {
          const [s, d] = e.target.value.split("_");
          setSortBy(s as "name" | "price" | "status");
          setSortDir(d as "asc" | "desc");
        }}
        options={[
          { value: "name_asc", label: "Name ↑" },
          { value: "name_desc", label: "Name ↓" },
          { value: "price_asc", label: "Price ↑" },
          { value: "price_desc", label: "Price ↓" },
          { value: "status_desc", label: "Status" },
        ]}
        className="w-auto"
      />
      <Select
        value={String(pageSize)}
        onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
        options={[
          { value: "5", label: "5 / page" },
          { value: "8", label: "8 / page" },
          { value: "12", label: "12 / page" },
        ]}
        className="w-auto"
      />

      {/* View toggle */}
      <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shrink-0">
        <button
          onClick={() => setViewMode("grid")}
          className={`rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
            viewMode === "grid"
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          title="Grid view"
        >
          <IconGrid size={16} />
        </button>
        <button
          onClick={() => setViewMode("list")}
          className={`rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
            viewMode === "list"
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          title="List view"
        >
          <IconList size={16} />
        </button>
      </div>
    </>
  );
}
