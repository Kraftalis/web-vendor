"use client";

import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui";
import type { Package } from "@/services/pricing";
import type { CreatedSummary } from "./types";

interface Props {
  existingPackages: Package[];
  createdPackages: CreatedSummary[];
  onAddMore: () => void;
}

export const PackageList = ({
  existingPackages,
  createdPackages,
  onAddMore,
}: Props) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Paket Tersimpan
          </h3>
          <p className="text-sm text-slate-500">
            {existingPackages.length + createdPackages.length} paket aktif.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={onAddMore}
          className="rounded-xl border-slate-200 font-semibold text-slate-700"
        >
          <Plus size={16} className="mr-2" />
          Tambah Paket
        </Button>
      </div>
      <div className="space-y-3">
        {existingPackages.map((pkg) => (
          <div
            key={pkg.id}
            className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-slate-900">
                {pkg.name}
              </p>
              <p className="text-sm font-medium text-slate-600">
                Rp {parseFloat(pkg.price).toLocaleString("id-ID")}
              </p>
            </div>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
              <Check size={16} />
            </div>
          </div>
        ))}
        {createdPackages.map((pkg) => (
          <div
            key={pkg.id}
            className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-slate-900">
                {pkg.name}
              </p>
              <p className="text-sm font-medium text-slate-600">
                Rp {pkg.price.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
              <Check size={16} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
