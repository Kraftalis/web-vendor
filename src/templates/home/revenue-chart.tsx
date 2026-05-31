"use client";

import { BadgeDollarSign } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { EmptyState } from "./empty-state";
import { formatCurrency } from "./utils";

interface Props {
  monthlyRevenue: { month: string; amount: number }[];
  collectedRevenue: number;
  outstandingRevenue: number;
  isEmpty: boolean;
}

export const RevenueChart = ({
  monthlyRevenue,
  collectedRevenue,
  outstandingRevenue,
  isEmpty,
}: Props) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm shadow-gray-100/50 transition-all hover:shadow-md">
    <div className="mb-6">
      <h2 className="text-sm font-bold text-gray-900">Pertumbuhan Omzet</h2>
      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
        6 Bulan Terakhir
      </p>
    </div>

    {isEmpty ? (
      <EmptyState
        icon={<BadgeDollarSign size={24} />}
        title="Data belum tersedia"
        desc="Penjualan akan muncul di sini"
      />
    ) : (
      <>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyRevenue}>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fontWeight: 600, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: "#f1f5f9" }}
                formatter={(value) => [
                  formatCurrency(Number(value)),
                  "Revenue",
                ]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                }}
              />
              <Bar
                dataKey="amount"
                fill="#3b82f6"
                radius={[6, 6, 6, 6]}
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-4">
          <div className="text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase">
              Terkumpul
            </p>
            <p className="text-xs font-bold text-emerald-600">
              {formatCurrency(collectedRevenue)}
            </p>
          </div>
          <div className="h-4 w-px bg-gray-100" />
          <div className="text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase">
              Pending
            </p>
            <p className="text-xs font-bold text-amber-600">
              {formatCurrency(outstandingRevenue)}
            </p>
          </div>
        </div>
      </>
    )}
  </div>
);
