"use client";

import { useState, useMemo } from "react";
import { useReport, useAccounts } from "@/hooks/finance";
import type { ReportQueryParams } from "@/services/finance";
import { presetRange } from "./utils";
import type { Preset } from "./utils";
import { PeriodSelector } from "./period-selector";
import { SummaryCards } from "./summary-cards";
import { MonthlyBreakdown } from "./monthly-breakdown";
import { CategoryBreakdown } from "./category-breakdown";

export const ReportsTab = () => {
  const [preset, setPreset] = useState<Preset>("this-month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [filterAccountId, setFilterAccountId] = useState("");

  const accountsQuery = useAccounts();
  const accounts = useMemo(
    () => accountsQuery.data ?? [],
    [accountsQuery.data],
  );
  const accountOptions = useMemo(
    () => accounts.map((a) => ({ value: a.id, label: a.name })),
    [accounts],
  );

  const range = useMemo(() => {
    if (preset === "custom")
      return { startDate: customStart, endDate: customEnd };
    return presetRange(preset);
  }, [preset, customStart, customEnd]);

  const reportParams = useMemo<ReportQueryParams | null>(() => {
    if (!range.startDate || !range.endDate) return null;
    return {
      startDate: range.startDate,
      endDate: range.endDate,
      ...(filterAccountId ? { accountId: filterAccountId } : {}),
    };
  }, [range, filterAccountId]);

  const reportQuery = useReport(reportParams);
  const report = reportQuery.data;
  const summary = report?.summary;
  const monthly = report?.monthly ?? [];
  const categories = report?.categories ?? [];
  const isLoading = reportQuery.isLoading;
  const netIsPositive = (summary?.netProfit ?? 0) >= 0;

  return (
    <div className="space-y-6">
      <PeriodSelector
        preset={preset}
        setPreset={setPreset}
        customStart={customStart}
        setCustomStart={setCustomStart}
        customEnd={customEnd}
        setCustomEnd={setCustomEnd}
        filterAccountId={filterAccountId}
        setFilterAccountId={setFilterAccountId}
        accountOptions={accountOptions}
      />

      {isLoading && (
        <div className="py-12 text-center text-sm text-gray-400">
          Memuat laporan...
        </div>
      )}

      {!isLoading && !summary && (
        <div className="py-12 text-center">
          <p className="text-sm font-medium text-gray-500">
            Tidak ada data laporan untuk periode ini
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Coba ubah periode atau tambah transaksi terlebih dahulu
          </p>
        </div>
      )}

      {summary && (
        <>
          <SummaryCards summary={summary} netIsPositive={netIsPositive} />
          <MonthlyBreakdown monthly={monthly} netIsPositive={netIsPositive} />
          <CategoryBreakdown categories={categories} />
        </>
      )}
    </div>
  );
};
