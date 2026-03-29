"use client";

import { useState, useMemo, useCallback } from "react";
import { AppLayout } from "@/components/layout";
import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
} from "@/components/icons";
import { useDictionary } from "@/i18n";
import { useEvents } from "@/hooks/event";
import type { ScheduleEvent, ScheduleTemplateProps, ViewMode } from "./types";
import { AgendaView } from "./agenda-view";
import { BookingLinkModal } from "@/templates/event/event-modals";
import "dayjs/locale/id";
import { dayjsLocalizer, Views } from "react-big-calendar";
import dayjs from "dayjs";
import "./calendar.css";
import { useScheduleStore } from "@/stores/schedule-store";
import { MiniCalendar } from "./mini-calendar";
import { EventList } from "./event-list";
import { MainCalendar } from "./main-calendar";

export type { ScheduleEvent, ScheduleTemplateProps };

export default function ScheduleTemplate({ user }: ScheduleTemplateProps) {
  const { dict } = useDictionary();
  const sched = dict.schedule;
  const eventDict = dict.event;

  const { currentDate, viewMode, setViewMode, navigate } = useScheduleStore();

  // Fetch events client-side
  const { data: rawEvents = [] } = useEvents();
  const events: ScheduleEvent[] = useMemo(
    () =>
      rawEvents.map((e) => ({
        id: e.id,
        clientName: e.clientName,
        eventType: e.eventType,
        eventCategoryId: e.eventCategoryId ?? null,
        eventCategoryName: e.eventCategoryName ?? null,
        eventCategoryColor: e.eventCategoryColor ?? null,
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
  const [showLinkModal, setShowLinkModal] = useState(false);

  // Format selected date as YYYY-MM-DD for pre-filling the booking form
  const selectedDateISO = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, "0");
    const d = String(currentDate.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [currentDate]);

  // Convert events to Big Calendar format
  const calendarEvents = useMemo(() => {
    return events.map((ev) => ({
      id: ev.id,
      title: ev.clientName,
      start: dayjs(ev.eventDate).toDate(),
      end: dayjs(ev.eventDate).endOf("day").toDate(),
      resource: ev,
    }));
  }, [events]);

  const viewLabels: Record<string, string> = {
    month: sched.month,
  };

  const eventStatusMap: Record<string, string> = {
    INQUIRY: eventDict.statusInquiry,
    WAITING_CONFIRMATION: eventDict.statusWaitingConfirmation,
    BOOKED: eventDict.statusBooked,
    ONGOING: eventDict.statusOngoing,
    COMPLETED: eventDict.statusCompleted,
  };

  const paymentStatusMap: Record<string, string> = {
    UNPAID: eventDict.paymentUnpaid,
    DP_PAID: eventDict.paymentDpPaid,
    PAID: eventDict.paymentPaid,
  };

  const paymentStatusVariant = {
    UNPAID: "danger" as const,
    DP_PAID: "warning" as const,
    PAID: "success" as const,
  };

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

  const legendItems = useMemo(() => {
    // Get unique categories from the current list of events
    const categoryMap = new Map<
      string,
      { label: string; color: string | null }
    >();

    for (const ev of events) {
      if (ev.eventCategoryName && !categoryMap.has(ev.eventCategoryName)) {
        categoryMap.set(ev.eventCategoryName, {
          label: ev.eventCategoryName,
          color: ev.eventCategoryColor,
        });
      }
    }

    return Array.from(categoryMap.entries()).map(([type, data]) => ({
      type,
      label: data.label,
      color: data.color,
    }));
  }, [events]);

  return (
    <AppLayout title={sched.title} user={user} fullWidth>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-white">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-72 border-r border-gray-100 flex flex-col h-full bg-white transition-all shrink-0">
          <div className="p-4 border-b border-gray-100 mb-2">
            <button
              onClick={() => setShowLinkModal(true)}
              className="w-full bg-blue-600 text-white px-4 py-2 h-11 rounded-lg text-sm font-bold shadow-md hover:bg-blue-700 hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
            >
              <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
                <IconPlus />
              </div>
              {dict.bookingLink.configTitle}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden mini-calendar-section scrollbar-hide">
            <MiniCalendar events={events} />
            <EventList events={events} selectedDate={currentDate} />
          </div>
        </aside>

        {/* Main Content (Big Calendar) */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <div className="p-4 flex flex-wrap items-center justify-between gap-4 border-b border-gray-50 z-20 bg-white">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-gray-900 transition-all capitalize">
                {dayjs(currentDate).format("MMMM YYYY")}
              </h2>
              <div className="flex items-center bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => navigate("PREV")}
                  className="p-1.5 text-gray-500 hover:bg-white hover:text-blue-600 hover:shadow-sm rounded-lg transition-all"
                >
                  <IconChevronLeft size={18} />
                </button>
                <button
                  onClick={() => navigate("TODAY")}
                  className="px-3 py-1 text-sm font-bold text-gray-700 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                >
                  {sched.today}
                </button>
                <button
                  onClick={() => navigate("NEXT")}
                  className="p-1.5 text-gray-500 hover:bg-white hover:text-blue-600 hover:shadow-sm rounded-lg transition-all"
                >
                  <IconChevronRight size={18} />
                </button>
              </div>
            </div>

            <ViewToggle
              viewMode={viewMode}
              onChangeView={setViewMode}
              labels={sched}
            />
          </div>

          <div className="flex-1 min-w-0 relative">
            {viewMode === "calendar" ? (
              <div className="h-full calendar-wrapper-full scroll-smooth">
                <MainCalendar
                  events={events}
                  calendarEvents={calendarEvents}
                  legendItems={legendItems}
                />
              </div>
            ) : (
              <div className="h-full overflow-y-auto p-6 scroll-smooth">
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
              </div>
            )}
          </div>
        </main>
      </div>

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
