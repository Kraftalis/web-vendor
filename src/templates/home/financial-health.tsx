"use client";

import { TrendingUp } from "lucide-react";
import { FinancialRow } from "./financial-row";
import { formatCurrency } from "./utils";

interface Props {
  paymentCounts: { UNPAID: number; DP_PAID: number; PAID: number };
  totalEvents: number;
  conversionRate: number;
  avgEventValue: number;
}

export const FinancialHealth = ({
  paymentCounts,
  totalEvents,
  conversionRate,
  avgEventValue,
}: Props) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm shadow-gray-100/50">
    <h2 className="mb-6 text-sm font-bold text-gray-900 uppercase tracking-tight">
      Kesehatan Keuangan
    </h2>
    <div className="space-y-6">
      <FinancialRow
        label="Lunas"
        count={paymentCounts.PAID}
        total={totalEvents}
        color="bg-emerald-500"
      />
      <FinancialRow
        label="DP Saja"
        count={paymentCounts.DP_PAID}
        total={totalEvents}
        color="bg-amber-500"
      />
      <FinancialRow
        label="Menunggak"
        count={paymentCounts.UNPAID}
        total={totalEvents}
        color="bg-rose-500"
      />
    </div>

    <div className="mt-8 grid grid-cols-2 gap-4 border-t border-gray-50 pt-6">
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase">
          Konversi
        </p>
        <div className="flex items-baseline gap-1">
          <p className="text-lg font-extrabold text-gray-900">
            {conversionRate}%
          </p>
          <TrendingUp size={12} className="text-emerald-500" />
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase">
          Rata-rata Order
        </p>
        <p className="text-xs font-bold text-gray-900">
          {formatCurrency(avgEventValue)}
        </p>
      </div>
    </div>
  </div>
);
