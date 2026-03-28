"use client";

import Link from "next/link";
import { Card, CardBody, Badge, Button } from "@/components/ui";
import {
  IconCalendar,
  IconClock,
  IconMapPin,
  IconEye,
} from "@/components/icons";
import type { BadgeVariant } from "@/components/ui";
import type { ScheduleEvent } from "./types";
import { eventStatusVariant } from "./types";

// ─── Agenda View ────────────────────────────────────────────

interface AgendaViewProps {
  upcomingEvents: ScheduleEvent[];
  pastEvents: ScheduleEvent[];
  eventStatusMap: Record<string, string>;
  paymentStatusMap: Record<string, string>;
  paymentStatusVariant: Record<string, BadgeVariant>;
  viewLabel: string;
  bookingDict: Record<string, string>;
  relativeDayLabel: (dateStr: string) => string;
  labels: {
    upcoming: string;
    past: string;
    noUpcoming: string;
    noUpcomingDesc: string;
  };
}

export function AgendaView({
  upcomingEvents,
  pastEvents,
  eventStatusMap,
  paymentStatusMap,
  paymentStatusVariant,
  viewLabel,
  bookingDict,
  relativeDayLabel,
  labels,
}: AgendaViewProps) {
  return (
    <div className="space-y-8">
      {/* Upcoming */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          {labels.upcoming}
          <span className="text-sm font-normal text-gray-400">
            ({upcomingEvents.length})
          </span>
        </h2>

        {upcomingEvents.length === 0 ? (
          <Card>
            <CardBody className="py-12 text-center">
              <IconCalendar size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium text-gray-500">
                {labels.noUpcoming}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {labels.noUpcomingDesc}
              </p>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map((ev) => (
              <AgendaRow
                key={ev.id}
                event={ev}
                relativeLabel={relativeDayLabel(ev.eventDate)}
                eventStatusMap={eventStatusMap}
                paymentStatusMap={paymentStatusMap}
                paymentStatusVariant={paymentStatusVariant}
                viewLabel={viewLabel}
                bookingDict={bookingDict}
              />
            ))}
          </div>
        )}
      </section>

      {/* Past */}
      {pastEvents.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
            <span className="h-2 w-2 rounded-full bg-gray-400" />
            {labels.past}
            <span className="text-sm font-normal text-gray-400">
              ({pastEvents.length})
            </span>
          </h2>
          <div className="space-y-3 opacity-75">
            {pastEvents.map((ev) => (
              <AgendaRow
                key={ev.id}
                event={ev}
                relativeLabel={relativeDayLabel(ev.eventDate)}
                eventStatusMap={eventStatusMap}
                paymentStatusMap={paymentStatusMap}
                paymentStatusVariant={paymentStatusVariant}
                viewLabel={viewLabel}
                bookingDict={bookingDict}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ─── Agenda Row ─────────────────────────────────────────────

interface AgendaRowProps {
  event: ScheduleEvent;
  relativeLabel: string;
  eventStatusMap: Record<string, string>;
  paymentStatusMap: Record<string, string>;
  paymentStatusVariant: Record<string, BadgeVariant>;
  viewLabel: string;
  bookingDict: Record<string, string>;
}

function AgendaRow({
  event,
  relativeLabel,
  eventStatusMap,
  paymentStatusMap,
  paymentStatusVariant,
  viewLabel,
  bookingDict,
}: AgendaRowProps) {
  const date = new Date(event.eventDate);

  // Event type label from booking dict or event category name
  const typeKey = `type${event.eventType}` as keyof typeof bookingDict;
  const typeLabel =
    event.eventCategoryName ?? bookingDict[typeKey] ?? event.eventType;

  return (
    <Card>
      <CardBody className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
        {/* Date block */}
        <div className="flex shrink-0 items-center gap-3 sm:w-28 sm:flex-col sm:gap-0 sm:text-center">
          <div className="flex flex-col items-center">
            <span className="text-xs font-medium text-gray-400 uppercase">
              {date.toLocaleDateString("en-US", { month: "short" })}
            </span>
            <span className="text-2xl font-bold text-gray-900">
              {date.getDate()}
            </span>
            <span className="text-[10px] text-gray-400">
              {date.toLocaleDateString("en-US", { weekday: "short" })}
            </span>
          </div>
          <span className="text-[10px] text-gray-400 sm:mt-1">
            {relativeLabel}
          </span>
        </div>

        {/* Divider */}
        <div className="hidden h-16 w-px bg-gray-200 sm:block" />

        {/* Event info */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">
                {event.clientName}
              </p>
              <p className="flex items-center gap-1.5 text-xs text-gray-500">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: event.eventCategoryColor || "#3B82F6",
                  }}
                />
                {typeLabel}
                {event.packageName && (
                  <>
                    <span className="text-gray-300">·</span>
                    {event.packageName}
                  </>
                )}
              </p>
            </div>
            <Link href={`/event/${event.id}`} className="shrink-0">
              <Button variant="outline" size="sm">
                <IconEye size={14} />
                <span className="ml-1 hidden sm:inline">{viewLabel}</span>
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {event.eventTime && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <IconClock size={12} />
                {event.eventTime}
              </span>
            )}
            {event.eventLocation && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <IconMapPin size={12} />
                <span className="truncate max-w-50">{event.eventLocation}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            <Badge variant={eventStatusVariant(event.eventStatus)}>
              {eventStatusMap[event.eventStatus] ?? event.eventStatus}
            </Badge>
            <Badge
              variant={paymentStatusVariant[event.paymentStatus] ?? "default"}
            >
              {paymentStatusMap[event.paymentStatus] ?? event.paymentStatus}
            </Badge>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
