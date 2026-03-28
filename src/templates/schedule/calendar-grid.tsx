"use client";

import { Card, CardBody, Button } from "@/components/ui";
import { IconChevronLeft, IconChevronRight } from "@/components/icons";
import type { CalendarDay, ScheduleEvent } from "./types";
import { isSameDay } from "./types";

// ─── Calendar Grid ──────────────────────────────────────────

interface CalendarGridProps {
  now: Date;
  currentMonth: number;
  currentYear: number;
  selectedDate: Date;
  calendarDays: CalendarDay[];
  monthNames: string[];
  weekDays: string[];
  onSelectDate: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onGoToToday: () => void;
  labels: {
    today: string;
    previousMonth: string;
    nextMonth: string;
  };
  legendItems: { type: string; label: string; color?: string | null }[];
}

export function CalendarGrid({
  now,
  currentMonth,
  currentYear,
  selectedDate,
  calendarDays,
  monthNames,
  weekDays,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onGoToToday,
  labels,
  legendItems,
}: CalendarGridProps) {
  return (
    <Card>
      <CardBody className="p-4">
        {/* Month navigation */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <Button variant="outline" size="sm" onClick={onGoToToday}>
              {labels.today}
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onPrevMonth}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
              aria-label={labels.previousMonth}
            >
              <IconChevronLeft size={18} />
            </button>
            <button
              onClick={onNextMonth}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
              aria-label={labels.nextMonth}
            >
              <IconChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-gray-200 pb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold tracking-wide text-gray-400 uppercase"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((cell, idx) => (
            <CalendarCell
              key={idx}
              cell={cell}
              now={now}
              selectedDate={selectedDate}
              onSelect={onSelectDate}
            />
          ))}
        </div>

        {/* Event type legend */}
        <div className="mt-4 flex flex-wrap gap-3 border-t border-gray-100 pt-3">
          {legendItems.map(({ type, label, color }) => (
            <span
              key={type}
              className="flex items-center gap-1.5 text-xs text-gray-500"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: color || "#3B82F6" }}
              />
              {label}
            </span>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

// ─── Single Calendar Cell ───────────────────────────────────

interface CalendarCellProps {
  cell: CalendarDay;
  now: Date;
  selectedDate: Date;
  onSelect: (date: Date) => void;
}

function CalendarCell({
  cell,
  now,
  selectedDate,
  onSelect,
}: CalendarCellProps) {
  const isToday = isSameDay(cell.date, now);
  const isSelected = isSameDay(cell.date, selectedDate);
  const hasEvents = cell.events.length > 0;

  return (
    <button
      onClick={() => onSelect(cell.date)}
      className={`relative flex min-h-18 flex-col items-center gap-0.5 border-b border-r border-gray-100 p-1.5 text-sm transition-colors last:border-r-0 hover:bg-blue-50 sm:min-h-21 ${
        !cell.inMonth ? "text-gray-300" : "text-gray-700"
      } ${isSelected ? "bg-blue-50 ring-2 ring-blue-500 ring-inset rounded-lg" : ""}`}
    >
      {/* Day number */}
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
          isToday
            ? "bg-blue-600 text-white"
            : isSelected
              ? "font-bold text-blue-700"
              : ""
        }`}
      >
        {cell.date.getDate()}
      </span>

      {/* Event dots / mini labels */}
      {hasEvents && cell.inMonth && <EventDots events={cell.events} />}

      {/* Dot indicator for out-of-month days with events */}
      {hasEvents && !cell.inMonth && (
        <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
      )}
    </button>
  );
}

// ─── Event Dots (inside calendar cell) ──────────────────────

function EventDots({ events }: { events: ScheduleEvent[] }) {
  return (
    <div className="flex w-full flex-col gap-0.5">
      {events.slice(0, 2).map((ev) => (
        <span
          key={ev.id}
          className="truncate rounded px-1 py-px text-[10px] font-medium leading-tight text-white"
          style={{ backgroundColor: ev.eventCategoryColor || "#3B82F6" }}
          title={`${ev.clientName}${ev.eventCategoryName ? ` — ${ev.eventCategoryName}` : ev.eventType ? ` — ${ev.eventType}` : ""}`}
        >
          {ev.clientName.length > 10
            ? ev.clientName.slice(0, 10) + "…"
            : ev.clientName}
        </span>
      ))}
      {events.length > 2 && (
        <span className="text-center text-[10px] font-medium text-gray-400">
          +{events.length - 2}
        </span>
      )}
    </div>
  );
}
