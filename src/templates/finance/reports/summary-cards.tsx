"use client";

import { Card, CardBody } from "@/components/ui";
import {
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { fmtCurrency } from "./utils";

interface Summary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  incomeCount: number;
  expenseCount: number;
}

interface Props {
  summary: Summary;
  netIsPositive: boolean;
}

export const SummaryCards = ({ summary, netIsPositive }: Props) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <CardBody>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
              <ArrowDownLeft size={18} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">
                Total Pendapatan
              </p>
              <p className="text-lg font-bold text-emerald-600">
                {fmtCurrency(summary.totalIncome)}
              </p>
              <p className="text-xs text-gray-400">
                {summary.incomeCount} Transaksi
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
              <ArrowUpRight size={18} className="text-red-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">
                Total Pengeluaran
              </p>
              <p className="text-lg font-bold text-red-600">
                {fmtCurrency(summary.totalExpense)}
              </p>
              <p className="text-xs text-gray-400">
                {summary.expenseCount} Transaksi
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                netIsPositive ? "bg-blue-100" : "bg-amber-100"
              }`}
            >
              {netIsPositive ? (
                <TrendingUp size={18} className="text-blue-600" />
              ) : (
                <TrendingDown size={18} className="text-amber-600" />
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">
                {netIsPositive ? "Laba Bersih" : "Rugi Bersih"}
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
  );
};
