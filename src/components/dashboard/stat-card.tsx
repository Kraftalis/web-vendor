"use client";

import { type ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

/**
 * StatCard — Modern SaaS-style metric card.
 */

interface StatCardProps {
  icon: ReactNode;
  title: string;
  value: string;
  trend?: {
    value: string;
    direction: "up" | "down";
  };
  className?: string;
}

export default function StatCard({
  icon,
  title,
  value,
  trend,
  className = "",
}: StatCardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 transition-all duration-200 hover:border-blue-200 hover:shadow-md ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          {/* Title */}
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            {title}
          </p>
          {/* Value */}
          <h3 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
            {value}
          </h3>
        </div>

        {/* Icon Container */}
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
          {icon}
        </div>
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-1.5">
          <div
            className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
              trend.direction === "up"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-rose-50 text-rose-600"
            }`}
          >
            {trend.direction === "up" ? (
              <TrendingUp size={12} strokeWidth={2.5} />
            ) : (
              <TrendingDown size={12} strokeWidth={2.5} />
            )}
            {trend.value}
          </div>
          <span className="text-[10px] font-medium text-gray-400">
            vs bulan lalu
          </span>
        </div>
      )}
    </div>
  );
}

export type { StatCardProps };
