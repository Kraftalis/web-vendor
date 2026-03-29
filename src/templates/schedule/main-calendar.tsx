"use client";

import { useMemo, useCallback, useState } from "react";
import { Calendar, dayjsLocalizer, Views } from "react-big-calendar";
import dayjs from "dayjs";
import { useScheduleStore } from "@/stores/schedule-store";
import { Drawer } from "@/components/ui/drawer";
import type { ScheduleEvent } from "./types";

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: ScheduleEvent;
};

interface MainCalendarProps {
  events: ScheduleEvent[];
  calendarEvents: CalendarEvent[];
  legendItems: { type: string; label: string; color: string | null }[];
}

export function MainCalendar({
  events,
  calendarEvents,
  legendItems,
}: MainCalendarProps) {
  const { currentDate, setCurrentDate } = useScheduleStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleSelectSlot = useCallback(
    (slotInfo: { start: Date; action: string }) => {
      setCurrentDate(slotInfo.start);
      // Only open drawer on click/select, not just navigation if selectable is used
      if (slotInfo.action === "select" || slotInfo.action === "click") {
        setIsDrawerOpen(true);
      }
    },
    [setCurrentDate],
  );

  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      setCurrentDate(event.start);
      setIsDrawerOpen(true);
    },
    [setCurrentDate],
  );

  const selectedDateEvents = useMemo(() => {
    const d = dayjs(currentDate).format("YYYY-MM-DD");
    return events
      .filter((ev) =>
        ev.schedules?.some((s) => dayjs(s.date).format("YYYY-MM-DD") === d),
      )
      .sort((a, b) => {
        const timeA =
          a.schedules?.find((s) => dayjs(s.date).format("YYYY-MM-DD") === d)
            ?.startTime || "00:00";
        const timeB =
          b.schedules?.find((s) => dayjs(s.date).format("YYYY-MM-DD") === d)
            ?.startTime || "00:00";
        return timeA.localeCompare(timeB);
      });
  }, [events, currentDate]);

  // Create hourly slots from 00:00 to 23:00
  const hourlySlots = Array.from({ length: 24 }, (_, i) => {
    const hour = String(i).padStart(2, "0");
    const label = `${hour}:00`;
    const dStr = dayjs(currentDate).format("YYYY-MM-DD");
    const hourEvents = selectedDateEvents.filter((ev) => {
      const schedule = ev.schedules?.find(
        (s) => dayjs(s.date).format("YYYY-MM-DD") === dStr,
      );
      return schedule?.startTime?.startsWith(hour);
    });
    return { hour, label, events: hourEvents };
  });

  return (
    <div className="h-full relative flex flex-col">
      <div className="flex-1 relative">
        <Calendar
          localizer={dayjsLocalizer(dayjs)}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%", width: "100%" }}
          views={["month"]}
          defaultView={Views.MONTH}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          selectable
          toolbar={false}
          date={currentDate}
          onNavigate={() => {}} // Controlled by store
          components={{
            month: {
              dateHeader: ({
                label,
                date,
                onDrillDown,
              }: {
                label: string;
                date: Date;
                onDrillDown: () => void;
              }) => {
                const isSelected = dayjs(date).isSame(currentDate, "day");
                return (
                  <div className="rbc-header-container p-0.5 sm:p-1">
                    <button
                      type="button"
                      onClick={onDrillDown}
                      className={`rbc-button-link ${isSelected ? "rbc-selected-date" : ""} 
                        w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm mx-auto`}
                    >
                      {label}
                    </button>
                  </div>
                );
              },
            },
          }}
        />
      </div>

      <div className="hidden lg:block">
        <div className="absolute bottom-6 right-6 flex flex-wrap gap-2 z-10 pointer-events-auto">
          {legendItems.map((item) => (
            <div
              key={item.type}
              className="flex items-center gap-1.5 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-[10px] font-bold text-gray-700 shadow-sm border border-gray-100"
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: item.color || "#3b82f6" }}
              />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={dayjs(currentDate).format("DD MMMM YYYY")}
      >
        <div className="relative min-h-full bg-white flex">
          {/* Vertical Timeline */}
          <div className="w-full h-full flex flex-col overflow-y-auto pt-4 pb-8">
            {hourlySlots.map((slot) => (
              <div key={slot.hour} className="group flex min-h-16 relative">
                <div className="w-16 shrink-0 text-right pr-3 pt-1 border-r border-gray-100 relative">
                  <span className="text-[10px] font-bold text-gray-400 tabular-nums">
                    {slot.label}
                  </span>
                  {/* Subtle dash extension */}
                  <div className="absolute top-3 right-0 w-1.5 h-px bg-gray-200"></div>
                </div>

                <div className="flex-1 p-2 min-h-16 group-hover:bg-slate-50/50 transition-colors">
                  {slot.events.map((ev) => (
                    <div
                      key={ev.id}
                      className="mb-2 bg-white border border-gray-100 p-3 shadow-sm hover:border-blue-300 transition-all cursor-pointer relative overflow-hidden"
                    >
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1"
                        style={{
                          backgroundColor: ev.eventCategoryColor || "#1a73e8",
                        }}
                      />
                      <div className="pl-2">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="text-[13px] font-extrabold text-gray-900 truncate">
                            {ev.clientName}
                          </h4>
                          <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                            {ev.schedules
                              ?.find(
                                (s) =>
                                  dayjs(s.date).format("YYYY-MM-DD") ===
                                  dayjs(currentDate).format("YYYY-MM-DD"),
                              )
                              ?.startTime?.slice(0, 5) || "--:--"}
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-gray-500 truncate">
                          {ev.eventType}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Drawer>
    </div>
  );
}
