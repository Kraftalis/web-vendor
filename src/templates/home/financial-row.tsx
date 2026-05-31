"use client";

import { cn } from "@heroui/react";

interface Props {
  label: string;
  count: number;
  total: number;
  color: string;
}

export const FinancialRow = ({ label, count, total, color }: Props) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("h-1.5 w-1.5 rounded-full", color)} />
          <span className="text-xs font-bold text-gray-600">{label}</span>
        </div>
        <span className="text-xs font-extrabold text-gray-900">
          {count}{" "}
          <span className="text-[10px] font-medium text-gray-400 uppercase ml-1">
            ({pct}%)
          </span>
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            color,
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};
