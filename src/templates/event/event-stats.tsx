"use client";

import { Card, CardBody } from "@/components/ui";
import { Calendar, Clock, CheckCircle2, DollarSign } from "lucide-react";
import type { EventItem } from "./types";
import { formatCurrency } from "./types";

interface EventStatsProps {
  events: EventItem[];
}

export const EventStats = ({ events }: EventStatsProps) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const upcomingCount = events.filter((e) => {
    if (!e.schedules || e.schedules.length === 0) return false;
    // Check if any schedule date is in the future
    return (
      e.schedules.some((s) => new Date(s.date) >= now) &&
      e.eventStatus !== "COMPLETED"
    );
  }).length;

  const confirmedCount = events.filter(
    (e) => e.eventStatus === "BOOKED" || e.eventStatus === "ONGOING",
  ).length;

  const totalRevenue = events.reduce((sum, e) => {
    if (e.amount) {
      const n = parseFloat(e.amount);
      if (!isNaN(n)) return sum + n;
    }
    return sum;
  }, 0);

  const currency = events[0]?.currency ?? "IDR";

  const stats = [
    {
      label: "Total Acara",
      value: events.length.toString(),
      icon: Calendar,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Mendatang",
      value: upcomingCount.toString(),
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Terkonfirmasi",
      value: confirmedCount.toString(),
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Pendapatan",
      value: formatCurrency(totalRevenue.toString(), currency),
      icon: DollarSign,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardBody className="flex items-center gap-3 py-3! px-4!">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${s.bg}`}
            >
              <s.icon size={20} className={s.color} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className="truncate text-lg font-bold text-slate-900">
                {s.value}
              </p>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
};
