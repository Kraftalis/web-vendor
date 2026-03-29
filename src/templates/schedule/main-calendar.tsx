"use client";

import { useMemo, useCallback, useState } from "react";
import {
  Calendar,
  dayjsLocalizer,
  type EventProps,
  Views,
} from "react-big-calendar";
import dayjs from "dayjs";
import { useScheduleStore } from "@/stores/schedule-store";
import { Drawer } from "@/components/ui/drawer";
import type { ScheduleEvent } from "./types";

const localizer = dayjsLocalizer(dayjs);

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

  const EventComponent = ({ event }: EventProps<CalendarEvent>) => {
    const ev = event.resource;
    const bgColor = ev.eventCategoryColor || "#1a73e8";

    return (
      <div
        className="flex flex-col gap-0.5 px-1.5 py-0.5 border-l-2 shadow-none overflow-hidden transition-all hover:brightness-95"
        style={{
          backgroundColor: `${bgColor}10`,
          borderLeftColor: bgColor,
          color: bgColor,
        }}
      >
        <div className="flex items-center justify-between gap-1">
          <span className="truncate text-[9px] font-bold leading-tight">
            {ev.clientName}
          </span>
        </div>
      </div>
    );
  };

  const selectedDateEvents = useMemo(() => {
    const d = dayjs(currentDate).format("YYYY-MM-DD");
    return events
      .filter((ev) => dayjs(ev.eventDate).format("YYYY-MM-DD") === d)
      .sort((a, b) =>
        (a.eventTime || "00:00").localeCompare(b.eventTime || "00:00"),
      );
  }, [events, currentDate]);

  // Create hourly slots from 00:00 to 23:00
  const hourlySlots = Array.from({ length: 24 }, (_, i) => {
    const hour = String(i).padStart(2, "0");
    const label = `${hour}:00`;
    const hourEvents = selectedDateEvents.filter((ev) =>
      ev.eventTime?.startsWith(hour),
    );
    return { hour, label, events: hourEvents };
  });

  return (
    <div className="h-full no-border-radius-calendar flex flex-col">
      <div className="flex-1">
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          date={currentDate}
          onNavigate={setCurrentDate}
          view={Views.MONTH}
          onView={() => {}} // Strictly Month View
          views={[Views.MONTH]}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          selected={currentDate}
          toolbar={false}
          components={{
            event: EventComponent,
          }}
          popup
          messages={{
            showMore: (count) => `+${count} more`,
          }}
        />
      </div>

      {/* Legend Section (Desktop Overlay) */}
      {legendItems.length > 0 && (
        <div className="px-2 py-4 bg-white/80 backdrop-blur-md flex flex-wrap gap-x-4 gap-y-1 max-w-[80%] pointer-events-auto">
          {legendItems.map((item) => (
            <div key={item.type} className="flex items-center gap-2 group">
              <div
                className="w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm shrink-0 transition-transform group-hover:scale-125"
                style={{ backgroundColor: item.color || "#1a73e8" }}
              />
              <span className="text-[10px] font-bold text-gray-500 truncate group-hover:text-blue-600 transition-colors uppercase tabular-nums tracking-tighter">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      )}

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
                      className="mb-2 bg-white rounded-xl border border-gray-100 p-3 shadow-sm hover:border-blue-300 transition-all cursor-pointer relative overflow-hidden"
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
                            {ev.eventTime?.slice(0, 5)}
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
