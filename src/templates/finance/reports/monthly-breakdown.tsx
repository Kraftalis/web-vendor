"use client";

import { Card, CardBody, CardHeader } from "@/components/ui";
import { fmtCurrency, fmtMonth } from "./utils";

interface MonthlyEntry {
  month: string;
  income: number;
  expense: number;
}

interface Props {
  monthly: MonthlyEntry[];
  netIsPositive: boolean;
}

export const MonthlyBreakdown = ({ monthly, netIsPositive }: Props) => {
  if (monthly.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-gray-800">Rincian Bulanan</h3>
      </CardHeader>
      <CardBody>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="pb-2 pr-4 font-medium text-gray-500">Bulan</th>
                <th className="pb-2 pr-4 text-right font-medium text-emerald-600">
                  Pendapatan
                </th>
                <th className="pb-2 pr-4 text-right font-medium text-red-600">
                  Pengeluaran
                </th>
                <th className="pb-2 text-right font-medium text-gray-700">
                  {netIsPositive ? "Laba" : "Rugi"}
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
                      {net < 0 && <span className="ml-1 text-xs">(Rugi)</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
};
