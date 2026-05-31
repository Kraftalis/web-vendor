"use client";

import { Card, CardBody, CardHeader } from "@/components/ui";
import { fmtCurrency } from "./utils";

interface CategoryEntry {
  category: string;
  type: "INCOME" | "EXPENSE";
  total: number;
}

interface Props {
  categories: CategoryEntry[];
}

export const CategoryBreakdown = ({ categories }: Props) => {
  if (categories.length === 0) return null;

  const maxTotal = Math.max(...categories.map((c) => c.total));

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-gray-800">
          Rincian Kategori
        </h3>
      </CardHeader>
      <CardBody>
        <div className="space-y-2">
          {categories.map((c, idx) => {
            const isInc = c.type === "INCOME";
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
  );
};
