"use client";

import dayjs from "dayjs";
import { useMemo } from "react";
import { useDictionary } from "@/i18n";
import type { ScheduleEvent } from "./types";
import DefaultBadge from "@/components/ui/badge";

interface EventListProps {
  events: ScheduleEvent[];
  selectedDate: Date;
}

export function EventList({ events, selectedDate }: EventListProps) {
  const { dict } = useDictionary();
  const eventDict = dict.event;
  const dateStr = dayjs(selectedDate).format("YYYY-MM-DD");

  const filteredEvents = useMemo(() => {
    return events
      .filter((ev) => {
        // Check if any schedule date matches the selected date
        if (ev.schedules && ev.schedules.length > 0) {
          return ev.schedules.some(
            (s) => dayjs(s.date).format("YYYY-MM-DD") === dateStr,
          );
        }
        return false;
      })
      .sort((a, b) => {
        const timeA =
          a.schedules?.find(
            (s) => dayjs(s.date).format("YYYY-MM-DD") === dateStr,
          )?.startTime || "00:00";
        const timeB =
          b.schedules?.find(
            (s) => dayjs(s.date).format("YYYY-MM-DD") === dateStr,
          )?.startTime || "00:00";
        return timeA.localeCompare(timeB);
      });
  }, [events, dateStr]);

  const eventStatusMap: Record<string, string> = {
    INQUIRY: eventDict.statusInquiry,
    WAITING_CONFIRMATION: eventDict.statusWaitingConfirmation,
    BOOKED: eventDict.statusBooked,
    ONGOING: eventDict.statusOngoing,
    COMPLETED: eventDict.statusCompleted,
  };

  return (
    <div className="flex-1 overflow-y-auto mt-2 border-t border-gray-100">
      <div className="p-4">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
          Acara pada {dayjs(selectedDate).format("DD MMM YYYY")}
        </h4>

        {filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-2">
              <span className="text-blue-500 text-lg">📅</span>
            </div>
            <p className="text-[11px] font-medium text-gray-400">
              Tidak ada acara
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEvents.map((ev) => (
              <div
                key={ev.id}
                className="group relative bg-white rounded-xl border border-gray-200 p-3 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer"
              >
                <div
                  className="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-lg"
                  style={{
                    backgroundColor: ev.eventCategoryColor || "#1a73e8",
                  }}
                />

                <div className="pl-2.5">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h5 className="text-[13px] font-bold text-gray-800 leading-tight truncate">
                      {ev.clientName}
                    </h5>
                    <span className="shrink-0 text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">
                      {ev.schedules
                        ?.find(
                          (s) => dayjs(s.date).format("YYYY-MM-DD") === dateStr,
                        )
                        ?.startTime?.slice(0, 5) || "--:--"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-[11px] font-medium text-gray-500">
                      {ev.eventCategoryName}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <DefaultBadge
                      variant="default"
                      className="text-[9px] py-0 px-1.5 border-gray-200 text-gray-500 font-semibold bg-gray-50/50"
                    >
                      {eventStatusMap[ev.eventStatus] || ev.eventStatus}
                    </DefaultBadge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
