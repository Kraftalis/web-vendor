"use client";

import { useMemo, useState } from "react";
import { usePricing } from "@/hooks/pricing";
import { Button } from "@/components/ui";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PackageList } from "./package-list";
import { PackageForm } from "./package-form";
import type { CreatedSummary } from "./types";

interface Props {
  onBack: () => void;
  onNext: () => void;
}

export const PackageStep = ({ onBack, onNext }: Props) => {
  const pricingQuery = usePricing();
  const [createdPackages, setCreatedPackages] = useState<CreatedSummary[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const existingPackages = useMemo(
    () => pricingQuery.data?.data.packages ?? [],
    [pricingQuery.data],
  );
  const hasPackages = createdPackages.length > 0 || existingPackages.length > 0;
  const showForm = isAdding || (!pricingQuery.isLoading && !hasPackages);

  const handleSaved = (summary: CreatedSummary) => {
    setCreatedPackages((prev) => [...prev, summary]);
    setIsAdding(false);
  };

  if (pricingQuery.isLoading && !hasPackages) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {hasPackages && !showForm && (
        <PackageList
          existingPackages={existingPackages}
          createdPackages={createdPackages}
          onAddMore={() => setIsAdding(true)}
        />
      )}

      {showForm && (
        <PackageForm
          hasPackages={hasPackages}
          onSaved={handleSaved}
          onClose={hasPackages ? () => setIsAdding(false) : undefined}
        />
      )}

      <div className="flex gap-4 pt-4">
        <Button
          variant="outline"
          className="flex-1 rounded-xl border-slate-300 bg-white py-3.5 font-semibold text-slate-700 hover:bg-slate-50"
          onClick={onBack}
        >
          <span className="flex items-center justify-center gap-2">
            <ChevronLeft size={18} />
            Kembali
          </span>
        </Button>
        <Button
          variant="primary"
          className="flex-1 rounded-xl bg-slate-900 py-3.5 font-semibold text-white transition-all hover:bg-slate-800 disabled:opacity-50"
          onClick={onNext}
          disabled={!hasPackages}
        >
          <span className="flex items-center justify-center gap-2">
            Selanjutnya
            <ChevronRight size={18} />
          </span>
        </Button>
      </div>
      {!hasPackages && (
        <p className="text-center text-sm text-slate-500">
          Buat setidaknya 1 paket untuk melanjutkan.
        </p>
      )}
    </div>
  );
};
