"use client";

import { Search, List, Kanban } from "lucide-react";
import { Input, Select } from "@/components/ui";

export type ViewMode = "list" | "kanban";

interface EventFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  paymentFilter: string;
  onPaymentFilterChange: (value: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const EventFilterBar = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  paymentFilter,
  onPaymentFilterChange,
  viewMode,
  onViewModeChange,
}: EventFilterBarProps) => {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
      <div className="relative flex-1 w-full">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
        />
        <Input
          type="text"
          placeholder="Cari acara atau klien..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 w-full bg-gray-50/50 border-gray-200"
        />
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <Select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          options={[
            { value: "", label: "Semua Status" },
            { value: "INQUIRY", label: "Pertanyaan" },
            { value: "WAITING_CONFIRMATION", label: "Menunggu" },
            { value: "BOOKED", label: "Terkonfirmasi" },
            { value: "ONGOING", label: "Berjalan" },
            { value: "COMPLETED", label: "Selesai" },
          ]}
          className="flex-1 sm:w-40 bg-gray-50/50"
        />
        <Select
          value={paymentFilter}
          onChange={(e) => onPaymentFilterChange(e.target.value)}
          options={[
            { value: "", label: "Pembayaran" },
            { value: "UNPAID", label: "Belum Bayar" },
            { value: "DP_PAID", label: "DP Terbayar" },
            { value: "PAID", label: "Lunas" },
          ]}
          className="flex-1 sm:w-40 bg-gray-50/50"
        />
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 shrink-0">
        <button
          onClick={() => onViewModeChange("list")}
          className={`rounded-md flex-1 sm:flex-none flex justify-center items-center px-4 sm:px-2.5 py-1.5 text-sm font-medium transition-colors ${
            viewMode === "list"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          }`}
          title="Tampilan Daftar"
        >
          <List size={16} />
        </button>
        <button
          onClick={() => onViewModeChange("kanban")}
          className={`rounded-md flex-1 sm:flex-none flex justify-center items-center px-4 sm:px-2.5 py-1.5 text-sm font-medium transition-colors ${
            viewMode === "kanban"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          }`}
          title="Tampilan Kanban"
        >
          <Kanban size={16} />
        </button>
      </div>
    </div>
  );
};
