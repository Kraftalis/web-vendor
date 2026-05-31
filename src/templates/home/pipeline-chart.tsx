"use client";

import Link from "next/link";
import { ChevronRight, Zap } from "lucide-react";
import { cn } from "@heroui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { EmptyState } from "./empty-state";
import { PIPELINE_BAR_COLORS, STATUS_PILL } from "./types";
import type { PipelineDataItem } from "./types";

interface Props {
  pipelineData: PipelineDataItem[];
  isEmpty: boolean;
}

export const PipelineChart = ({ pipelineData, isEmpty }: Props) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm shadow-gray-100/50 transition-all hover:shadow-md">
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h2 className="text-sm font-bold text-gray-900">Pipeline Bisnis</h2>
        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
          Status Acara
        </p>
      </div>
      <Link
        href="/event"
        className="rounded-lg bg-gray-50 p-2 text-blue-600 transition-colors hover:bg-blue-50"
      >
        <ChevronRight size={16} />
      </Link>
    </div>

    {isEmpty ? (
      <EmptyState
        icon={<Zap size={24} />}
        title="Belum ada pipeline"
        desc="Mulai buat acara pertama Anda"
      />
    ) : (
      <>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pipelineData}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fontWeight: 600, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: "#f1f5f9" }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 6, 6]} barSize={32}>
                {pipelineData.map((entry) => (
                  <Cell
                    key={entry.key}
                    fill={PIPELINE_BAR_COLORS[entry.key] ?? "#cbd5e1"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {pipelineData.map((item) => (
            <div
              key={item.key}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold transition-all",
                STATUS_PILL[item.key],
              )}
            >
              <span className="text-xs">{item.count}</span>
              {item.name}
            </div>
          ))}
        </div>
      </>
    )}
  </div>
);
