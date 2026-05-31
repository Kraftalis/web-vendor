"use client";

import Link from "next/link";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui";
import { EmptyState } from "./empty-state";
import { daysUntil } from "./utils";
import type { UpcomingSummaryItem } from "./types";

interface Props {
  upcomingSummary: UpcomingSummaryItem[];
  isLoading: boolean;
}

export const UpcomingEvents = ({ upcomingSummary, isLoading }: Props) => (
  <div className="rounded-2xl border border-gray-100 bg-white shadow-sm shadow-gray-100/50">
    <div className="flex items-center justify-between border-b border-gray-50 px-6 py-5">
      <div>
        <h2 className="text-sm font-bold text-gray-900">Acara Mendatang</h2>
        <p className="text-[10px] font-bold text-gray-400 uppercase">
          Konfirmasi &amp; Jadwal
        </p>
      </div>
      <Link
        href="/schedule"
        className="text-xs font-bold text-blue-600 hover:underline"
      >
        Lihat Kalender
      </Link>
    </div>

    {upcomingSummary.length === 0 && !isLoading ? (
      <div className="p-8">
        <EmptyState
          icon={<Calendar size={24} />}
          title="Jadwal kosong"
          desc="Semua acara telah selesai atau belum ada kegiatan baru"
        />
      </div>
    ) : (
      <div className="divide-y divide-gray-50">
        {upcomingSummary.slice(0, 5).map((group) => (
          <div key={group.date} className="px-6 py-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
                {new Date(group.date).toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "short",
                })}
              </span>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                {daysUntil(group.date) === 0
                  ? "Hari Ini"
                  : `${daysUntil(group.date)} Hari Lagi`}
              </span>
            </div>
            <div className="space-y-3">
              {group.items.map((item) => (
                <Link
                  key={`${item.id}-${item.schedule.id}`}
                  href={`/event/${item.id}`}
                  className="group flex items-center justify-between rounded-xl bg-gray-50/50 p-3 transition-all hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm transition-transform group-hover:scale-110">
                      <Calendar size={18} className="text-gray-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-gray-900">
                        {item.clientName}
                      </p>
                      <p className="text-[11px] font-medium text-gray-500">
                        {item.eventType} •{" "}
                        {item.schedule.startTime || "Anytime"}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      item.eventStatus === "BOOKED"
                        ? "success"
                        : item.eventStatus === "WAITING_CONFIRMATION"
                          ? "warning"
                          : "default"
                    }
                    className="text-[10px] uppercase tracking-wider"
                  >
                    {item.eventStatus.replace("_", " ")}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
