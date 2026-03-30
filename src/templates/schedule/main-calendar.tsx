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
  calendarEvents: initialCalendarEvents,
  legendItems,
}: MainCalendarProps) {
  const { currentDate, setCurrentDate } = useScheduleStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const calendarEvents = useMemo(() => {
    return initialCalendarEvents
      .filter((ev) => ev.start && ev.end)
      .map((ev) => ({
        ...ev,
        start: new Date(ev.start),
        end: new Date(ev.end),
      }));
  }, [initialCalendarEvents]);

  const eventPropGetter = useCallback((event: CalendarEvent) => {
    return {
      style: {
        backgroundColor: event.resource.eventCategoryColor || "#3b82f6",
        borderRadius: "4px",
        opacity: 1,
        color: "white",
        border: "none",
        display: "block",
        fontWeight: "bold",
        padding: "0px 2px",
      },
    };
  }, []);

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
    return { hour, label };
  });

  const timelineEvents = useMemo(() => {
    const dStr = dayjs(currentDate).format("YYYY-MM-DD");
    return selectedDateEvents
      .map((ev) => {
        const schedule = ev.schedules?.find(
          (s) => dayjs(s.date).format("YYYY-MM-DD") === dStr,
        );

        if (!schedule || !schedule.startTime) return null;

        const [startH, startM] = schedule.startTime.split(":").map(Number);
        const [endH, endM] = (schedule.endTime || "23:59")
          .split(":")
          .map(Number);

        const startInMinutes = startH * 60 + startM;
        const endInMinutes = endH * 60 + endM;
        const duration = Math.max(endInMinutes - startInMinutes, 30); // Min 30 mins for visibility

        return {
          ...ev,
          startInMinutes,
          duration,
          schedule,
        };
      })
      .filter(Boolean) as (ScheduleEvent & {
      startInMinutes: number;
      duration: number;
      schedule: NonNullable<ScheduleEvent["schedules"]>[number];
    })[];
  }, [selectedDateEvents, currentDate]);

  // Simple overlap detection (naive column based)
  const positionedEvents = useMemo(() => {
    const sorted = [...timelineEvents].sort(
      (a, b) => a.startInMinutes - b.startInMinutes,
    );
    const columns: (typeof sorted)[] = [];

    sorted.forEach((event) => {
      let placed = false;
      for (let i = 0; i < columns.length; i++) {
        const lastInCol = columns[i][columns[i].length - 1];
        if (
          event.startInMinutes >=
          lastInCol.startInMinutes + lastInCol.duration
        ) {
          columns[i].push(event);
          placed = true;
          break;
        }
      }
      if (!placed) {
        columns.push([event]);
      }
    });

    return sorted.map((event) => {
      const colIndex = columns.findIndex((col) => col.includes(event));

      const overlappingCols = columns.filter((col) =>
        col.some(
          (e) =>
            event.startInMinutes < e.startInMinutes + e.duration &&
            e.startInMinutes < event.startInMinutes + event.duration,
        ),
      );

      return {
        ...event,
        colIndex,
        colCount: Math.max(overlappingCols.length, 1),
      };
    });
  }, [timelineEvents]);

  const SLOT_HEIGHT = 80; // pixels per hour

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
          eventPropGetter={eventPropGetter}
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
        <div className="relative min-h-full bg-white flex flex-col overflow-y-auto">
          <div
            className="relative w-full"
            style={{ height: `${24 * SLOT_HEIGHT}px` }}
          >
            {/* Hour markers */}
            {hourlySlots.map((slot) => (
              <div
                key={slot.hour}
                className="absolute w-full border-t border-gray-100 flex"
                style={{
                  top: `${parseInt(slot.hour) * SLOT_HEIGHT}px`,
                  height: `${SLOT_HEIGHT}px`,
                }}
              >
                <div className="w-16 shrink-0 text-right pr-3 pt-1 border-r border-gray-100 bg-white z-10">
                  <span className="text-[10px] font-bold text-gray-400 tabular-nums">
                    {slot.label}
                  </span>
                </div>
                <div className="flex-1 bg-slate-50/20" />
              </div>
            ))}

            {/* Events Overlay */}
            <div className="absolute top-0 left-16 right-0 bottom-0 pointer-events-none">
              {positionedEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="absolute p-1 pointer-events-auto"
                  style={{
                    top: `${(ev.startInMinutes / 60) * SLOT_HEIGHT}px`,
                    height: `${(ev.duration / 60) * SLOT_HEIGHT}px`,
                    left: `${(ev.colIndex / ev.colCount) * 100}%`,
                    width: `${(1 / ev.colCount) * 100}%`,
                  }}
                >
                  <div className="h-full bg-white border border-gray-200 rounded-md shadow-sm hover:border-blue-400 transition-all cursor-pointer relative overflow-hidden flex flex-col p-2">
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1"
                      style={{
                        backgroundColor: ev.eventCategoryColor || "#1a73e8",
                      }}
                    />
                    <div className="pl-1 h-full flex flex-col min-h-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="text-[11px] font-extrabold text-gray-900 truncate">
                          {ev.clientName}
                        </h4>
                        <span className="text-[9px] font-extrabold text-blue-600 shrink-0">
                          {ev.schedule.startTime?.slice(0, 5)}
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-gray-500 truncate mb-1">
                        {ev.eventCategoryName}
                      </p>
                      {ev.duration > 45 && (
                        <p className="text-[9px] text-gray-400 truncate mt-auto">
                          {ev.schedule.startTime?.slice(0, 5)} -{" "}
                          {ev.schedule.endTime?.slice(0, 5)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
