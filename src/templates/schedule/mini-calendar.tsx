"use client";

import { useMemo } from "react";
import dayjs from "dayjs";
import { useScheduleStore } from "@/stores/schedule-store";
import { IconChevronLeft, IconChevronRight } from "@/components/icons";
import type { ScheduleEvent } from "./types";

interface MiniCalendarProps {
  events: ScheduleEvent[];
}

export function MiniCalendar({ events }: MiniCalendarProps) {
  const { currentDate, setCurrentDate } = useScheduleStore();

  const currentMonth = currentDate.getMonth();

  // Highlight dates with events
  const eventDates = useMemo(() => {
    const set = new Set<string>();
    events.forEach((ev) => set.add(dayjs(ev.eventDate).format("YYYY-MM-DD")));
    return set;
  }, [events]);

  const days = useMemo(() => {
    const startOfMonth = dayjs(currentDate).startOf("month");
    const endOfMonth = dayjs(currentDate).endOf("month");
    const startDay = startOfMonth.startOf("week");
    const endDay = endOfMonth.endOf("week");

    const calendar = [];
    let day = startDay;

    while (day.isBefore(endDay) || day.isSame(endDay, "day")) {
      calendar.push(day);
      day = day.add(1, "day");
    }
    return calendar;
  }, [currentDate]);

  const weekDays = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  return (
    <div className="p-4 bg-white select-none">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-sm font-bold text-gray-900">
          {dayjs(currentDate).format("MMMM YYYY")}
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() =>
              setCurrentDate(dayjs(currentDate).subtract(1, "month").toDate())
            }
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <IconChevronLeft size={16} className="text-gray-500" />
          </button>
          <button
            onClick={() =>
              setCurrentDate(dayjs(currentDate).add(1, "month").toDate())
            }
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <IconChevronRight size={16} className="text-gray-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px text-center mb-1">
        {weekDays.map((d) => (
          <span
            key={d}
            className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter"
          >
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((date, i) => {
          const isCurrentMonth = date.month() === currentMonth;
          const isToday = date.isSame(dayjs(), "day");
          const isSelected = date.isSame(dayjs(currentDate), "day");
          const hasEvent = eventDates.has(date.format("YYYY-MM-DD"));

          return (
            <button
              key={i}
              onClick={() => setCurrentDate(date.toDate())}
              className={`
                relative h-8 w-8 flex items-center justify-center text-xs rounded-full transition-all
                ${!isCurrentMonth ? "text-gray-300" : "text-gray-700"}
                ${isSelected ? "bg-blue-600 text-white! font-bold hover:bg-blue-700" : "hover:bg-gray-100"}
                ${isToday && !isSelected ? "text-blue-600 font-bold border border-blue-200" : ""}
                ${hasEvent && !isSelected ? "border-2 border-red-500!" : ""}
              `}
            >
              {date.date()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
