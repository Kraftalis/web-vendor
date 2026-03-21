"use client";

import { useState, useMemo, useCallback } from "react";
import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui";
import { IconCalendar, IconLink } from "@/components/icons";
import { useDictionary } from "@/i18n";
import { useEvents } from "@/hooks/event";
import type { BadgeVariant } from "@/components/ui";
import type { ScheduleEvent, ScheduleTemplateProps, ViewMode } from "./types";
import { toDateKey } from "./types";
import { CalendarGrid } from "./calendar-grid";
import { CalendarSidebar } from "./calendar-sidebar";
import { AgendaView } from "./agenda-view";
import { BookingLinkModal } from "@/templates/event/event-modals";

export type { ScheduleEvent, ScheduleTemplateProps };

export default function ScheduleTemplate({ user }: ScheduleTemplateProps) {
  const { dict } = useDictionary();
  const sched = dict.schedule;
  const eventDict = dict.event;

  // Fetch events client-side
  const { data: rawEvents = [] } = useEvents();
  const events: ScheduleEvent[] = useMemo(
    () =>
      rawEvents.map((e) => ({
        id: e.id,
        clientName: e.clientName,
        eventType: e.eventType,
        eventDate: e.eventDate,
        eventTime: e.eventTime,
        eventLocation: e.eventLocation,
        packageName: e.packageName,
        eventStatus: e.eventStatus,
        paymentStatus: e.paymentStatus,
      })),
    [rawEvents],
  );

  const now = useMemo(() => new Date(), []);
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [currentMonth, setCurrentMonth] = useState(() => now.getMonth());
  const [currentYear, setCurrentYear] = useState(() => now.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date>(now);
  const [showLinkModal, setShowLinkModal] = useState(false);

  // Format selected date as YYYY-MM-DD for pre-filling the booking form
  const selectedDateISO = useMemo(() => {
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDate.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [selectedDate]);

  const monthNames = sched.months.split(",");
  const weekDays = [
    sched.sun,
    sched.mon,
    sched.tue,
    sched.wed,
    sched.thu,
    sched.fri,
    sched.sat,
  ];

  const eventStatusMap: Record<string, string> = {
    INQUIRY: eventDict.statusInquiry,
    WAITING_PAYMENT: eventDict.statusWaitingPayment,
    CONFIRMED: eventDict.statusConfirmed,
    ONGOING: eventDict.statusOngoing,
    COMPLETED: eventDict.statusCompleted,
  };

  const paymentStatusMap: Record<string, string> = {
    UNPAID: eventDict.paymentUnpaid,
    DP_PAID: eventDict.paymentDpPaid,
    PAID: eventDict.paymentPaid,
  };

  const paymentStatusVariant: Record<string, BadgeVariant> = {
    UNPAID: "danger",
    DP_PAID: "warning",
    PAID: "success",
  };

  const eventsByDate = useMemo(() => {
    const map = new Map<string, ScheduleEvent[]>();
    for (const ev of events) {
      const key = toDateKey(new Date(ev.eventDate));
      const arr = map.get(key) ?? [];
      arr.push(ev);
      map.set(key, arr);
    }
    return map;
  }, [events]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    const days: { date: Date; inMonth: boolean; events: ScheduleEvent[] }[] =
      [];

    for (let i = startOffset - 1; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1, prevMonthDays - i);
      days.push({
        date: d,
        inMonth: false,
        events: eventsByDate.get(toDateKey(d)) ?? [],
      });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(currentYear, currentMonth, i);
      days.push({
        date: d,
        inMonth: true,
        events: eventsByDate.get(toDateKey(d)) ?? [],
      });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(currentYear, currentMonth + 1, i);
      days.push({
        date: d,
        inMonth: false,
        events: eventsByDate.get(toDateKey(d)) ?? [],
      });
    }

    return days;
  }, [currentYear, currentMonth, eventsByDate]);

  const selectedDateEvents = useMemo(() => {
    return eventsByDate.get(toDateKey(selectedDate)) ?? [];
  }, [selectedDate, eventsByDate]);

  const agendaEvents = useMemo(() => {
    const sorted = [...events].sort(
      (a, b) =>
        new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime(),
    );
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const upcoming = sorted.filter((e) => new Date(e.eventDate) >= todayStart);
    const past = sorted
      .filter((e) => new Date(e.eventDate) < todayStart)
      .reverse();
    return { upcoming, past };
  }, [events, now]);

  const goToPrevMonth = useCallback(() => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }, [currentMonth]);

  const goToNextMonth = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }, [currentMonth]);

  const goToToday = useCallback(() => {
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
    setSelectedDate(now);
  }, [now]);

  const relativeDayLabel = useCallback(
    (dateStr: string): string => {
      const d = new Date(dateStr);
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      const diff = Math.round(
        (d.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (diff === 0) return sched.today;
      if (diff === 1) return sched.tomorrow;
      if (diff === -1) return sched.yesterday;
      if (diff > 0) return `${diff} ${sched.daysAway}`;
      return `${Math.abs(diff)} ${sched.daysAgo}`;
    },
    [now, sched],
  );

  const legendItems = useMemo(
    () => [
      { type: "Wedding", label: dict.booking.typeWedding },
      { type: "Engagement", label: dict.booking.typeEngagement },
      { type: "Birthday", label: dict.booking.typeBirthday },
      { type: "Graduation", label: dict.booking.typeGraduation },
      { type: "Corporate", label: dict.booking.typeCorporate },
      { type: "Other", label: dict.booking.typeOther },
    ],
    [dict.booking],
  );

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{sched.title}</h1>
            <p className="mt-1 text-sm text-gray-500">{sched.subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <ViewToggle
              viewMode={viewMode}
              onChangeView={setViewMode}
              labels={sched}
            />
          </div>
        </div>

        {viewMode === "calendar" ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <CalendarGrid
              now={now}
              currentMonth={currentMonth}
              currentYear={currentYear}
              selectedDate={selectedDate}
              calendarDays={calendarDays}
              monthNames={monthNames}
              weekDays={weekDays}
              onSelectDate={setSelectedDate}
              onPrevMonth={goToPrevMonth}
              onNextMonth={goToNextMonth}
              onGoToToday={goToToday}
              labels={{
                today: sched.today,
                previousMonth: sched.previousMonth,
                nextMonth: sched.nextMonth,
              }}
              legendItems={legendItems}
            />
            <CalendarSidebar
              selectedDate={selectedDate}
              selectedDateEvents={selectedDateEvents}
              upcomingEvents={agendaEvents.upcoming}
              eventStatusMap={eventStatusMap}
              paymentStatusMap={paymentStatusMap}
              paymentStatusVariant={paymentStatusVariant}
              viewLabel={eventDict.view}
              noEventsOnDayLabel={sched.noEventsOnDay}
              upcomingLabel={sched.upcoming}
              noUpcomingLabel={sched.noUpcoming}
              relativeDayLabel={relativeDayLabel}
              onCreateBooking={() => setShowLinkModal(true)}
              createBookingLabel={sched.createBooking}
            />
          </div>
        ) : (
          <AgendaView
            upcomingEvents={agendaEvents.upcoming}
            pastEvents={agendaEvents.past}
            eventStatusMap={eventStatusMap}
            paymentStatusMap={paymentStatusMap}
            paymentStatusVariant={paymentStatusVariant}
            viewLabel={eventDict.view}
            bookingDict={dict.booking}
            relativeDayLabel={relativeDayLabel}
            labels={{
              upcoming: sched.upcoming,
              past: sched.past,
              noUpcoming: sched.noUpcoming,
              noUpcomingDesc: sched.noUpcomingDesc,
            }}
          />
        )}
      </div>

      {/* Booking Link Modal — accessible from schedule page */}
      <BookingLinkModal
        open={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        defaultEventDate={selectedDateISO}
        labels={dict.bookingLink}
      />
    </AppLayout>
  );
}

function ViewToggle({
  viewMode,
  onChangeView,
  labels,
}: {
  viewMode: ViewMode;
  onChangeView: (mode: ViewMode) => void;
  labels: { calendarView: string; listView: string };
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
      <button
        onClick={() => onChangeView("calendar")}
        className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          viewMode === "calendar"
            ? "bg-blue-600 text-white"
            : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        <span className="flex items-center gap-1.5">
          <IconCalendar size={14} />
          {labels.calendarView}
        </span>
      </button>
      <button
        onClick={() => onChangeView("agenda")}
        className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          viewMode === "agenda"
            ? "bg-blue-600 text-white"
            : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        <span className="flex items-center gap-1.5">
          <svg
            width={14}
            height={14}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8.25 6.75h12M8.25 12h12M8.25 17.25h12M3.75 6.75h.007v.008H3.75V6.75zm0 5.25h.007v.008H3.75V12zm0 5.25h.007v.008H3.75v-.008z" />
          </svg>
          {labels.listView}
        </span>
      </button>
    </div>
  );
}
