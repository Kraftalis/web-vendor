"use client";

import { useState, useMemo } from "react";
import { Card, CardHeader, CardBody, Select } from "@/components/ui";
import {
  IconArrowDownLeft,
  IconArrowUpRight,
  IconTrendUp,
  IconTrendDown,
} from "@/components/icons";
import { useDictionary } from "@/i18n";
import { useReport, useAccounts } from "@/hooks/finance";
import type { ReportQueryParams } from "@/services/finance";

// ─── Period helpers ─────────────────────────────────────────

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10);
}

function monthsAgo(n: number) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d;
}

type Preset =
  | "this-month"
  | "last-month"
  | "3-months"
  | "6-months"
  | "year"
  | "custom";

function presetRange(preset: Preset): { startDate: string; endDate: string } {
  const now = new Date();
  switch (preset) {
    case "this-month":
      return { startDate: startOfMonth(now), endDate: endOfMonth(now) };
    case "last-month": {
      const lm = monthsAgo(1);
      return { startDate: startOfMonth(lm), endDate: endOfMonth(lm) };
    }
    case "3-months":
      return {
        startDate: startOfMonth(monthsAgo(2)),
        endDate: endOfMonth(now),
      };
    case "6-months":
      return {
        startDate: startOfMonth(monthsAgo(5)),
        endDate: endOfMonth(now),
      };
    case "year":
      return {
        startDate: `${now.getFullYear()}-01-01`,
        endDate: endOfMonth(now),
      };
    default:
      return { startDate: "", endDate: "" };
  }
}

function fmtCurrency(val: number, currency = "IDR") {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
}

function fmtMonth(yyyyMM: string) {
  const [y, m] = yyyyMM.split("-");
  const d = new Date(Number(y), Number(m) - 1);
  return d.toLocaleDateString("id-ID", { month: "short", year: "numeric" });
}

// ─── Component ──────────────────────────────────────────────

export default function ReportsTab() {
  const { dict } = useDictionary();
  const f = dict.finance;

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

  const presetOptions = [
    { value: "this-month", label: f.thisMonth },
    { value: "last-month", label: f.lastMonth },
    { value: "3-months", label: f.last3Months },
    { value: "6-months", label: f.last6Months },
    { value: "year", label: f.thisYear },
    { value: "custom", label: f.customRange },
  ];

  const isLoading = reportQuery.isLoading;
  const netIsPositive = (summary?.netProfit ?? 0) >= 0;

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <Select
              label={f.period}
              options={presetOptions}
              value={preset}
              onChange={(e) => setPreset(e.target.value as Preset)}
            />
            {preset === "custom" && (
              <>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    {f.startDate}
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    {f.endDate}
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                  />
                </div>
              </>
            )}
            <Select
              label={f.allAccounts}
              options={[{ value: "", label: f.allAccounts }, ...accountOptions]}
              value={filterAccountId}
              onChange={(e) => setFilterAccountId(e.target.value)}
            />
          </div>
        </CardBody>
      </Card>

      {/* Loading */}
      {isLoading && (
        <div className="py-12 text-center text-sm text-gray-400">
          {dict.common.loading}
        </div>
      )}

      {/* No data */}
      {!isLoading && !summary && (
        <div className="py-12 text-center">
          <p className="text-sm font-medium text-gray-500">{f.noReportData}</p>
          <p className="mt-1 text-xs text-gray-400">{f.noReportDataDesc}</p>
        </div>
      )}

      {/* Summary cards */}
      {summary && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Income */}
            <Card>
              <CardBody>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                    <IconArrowDownLeft size={18} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      {f.totalIncome}
                    </p>
                    <p className="text-lg font-bold text-emerald-600">
                      {fmtCurrency(summary.totalIncome)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {summary.incomeCount} {f.incomeCount}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Expense */}
            <Card>
              <CardBody>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                    <IconArrowUpRight size={18} className="text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      {f.totalExpense}
                    </p>
                    <p className="text-lg font-bold text-red-600">
                      {fmtCurrency(summary.totalExpense)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {summary.expenseCount} {f.expenseCount}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Net */}
            <Card>
              <CardBody>
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      netIsPositive ? "bg-blue-100" : "bg-amber-100"
                    }`}
                  >
                    {netIsPositive ? (
                      <IconTrendUp size={18} className="text-blue-600" />
                    ) : (
                      <IconTrendDown size={18} className="text-amber-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      {netIsPositive ? f.netProfit : f.netLoss}
                    </p>
                    <p
                      className={`text-lg font-bold ${
                        netIsPositive ? "text-blue-600" : "text-amber-600"
                      }`}
                    >
                      {fmtCurrency(Math.abs(summary.netProfit))}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Monthly Breakdown */}
          {monthly.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold text-gray-800">
                  {f.monthlyBreakdown}
                </h3>
              </CardHeader>
              <CardBody>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-left">
                        <th className="pb-2 pr-4 font-medium text-gray-500">
                          {f.month}
                        </th>
                        <th className="pb-2 pr-4 text-right font-medium text-emerald-600">
                          {f.income}
                        </th>
                        <th className="pb-2 pr-4 text-right font-medium text-red-600">
                          {f.expense}
                        </th>
                        <th className="pb-2 text-right font-medium text-gray-700">
                          {netIsPositive ? f.netProfit : f.netLoss}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthly.map((m) => {
                        const net = m.income - m.expense;
                        return (
                          <tr key={m.month} className="border-b border-gray-50">
                            <td className="py-2 pr-4 text-gray-700">
                              {fmtMonth(m.month)}
                            </td>
                            <td className="py-2 pr-4 text-right text-emerald-600">
                              {fmtCurrency(m.income)}
                            </td>
                            <td className="py-2 pr-4 text-right text-red-600">
                              {fmtCurrency(m.expense)}
                            </td>
                            <td
                              className={`py-2 text-right font-medium ${
                                net >= 0 ? "text-blue-600" : "text-amber-600"
                              }`}
                            >
                              {fmtCurrency(Math.abs(net))}
                              {net < 0 && (
                                <span className="ml-1 text-xs">(Rugi)</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Category Breakdown */}
          {categories.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold text-gray-800">
                  {f.categoryBreakdown}
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-2">
                  {categories.map((c, idx) => {
                    const isInc = c.type === "INCOME";
                    const maxTotal = Math.max(
                      ...categories.map((cc) => cc.total),
                    );
                    const pct = maxTotal > 0 ? (c.total / maxTotal) * 100 : 0;
                    return (
                      <div key={`${c.category}-${c.type}-${idx}`}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{c.category}</span>
                          <span
                            className={`font-medium ${
                              isInc ? "text-emerald-600" : "text-red-600"
                            }`}
                          >
                            {fmtCurrency(c.total)}
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isInc ? "bg-emerald-400" : "bg-red-400"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardBody>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
