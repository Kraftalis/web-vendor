"use client";

import Link from "next/link";
import { Card, CardBody, Badge, Button } from "@/components/ui";
import {
  IconCalendar,
  IconClock,
  IconMapPin,
  IconEye,
  IconPlus,
} from "@/components/icons";
import type { BadgeVariant } from "@/components/ui";
import type { ScheduleEvent } from "./types";
import { eventStatusVariant, eventTypeColor } from "./types";

// ─── Event Card (Day detail) ────────────────────────────────

interface EventCardProps {
  event: ScheduleEvent;
  eventStatusMap: Record<string, string>;
  paymentStatusMap: Record<string, string>;
  paymentStatusVariant: Record<string, BadgeVariant>;
  viewLabel: string;
}

export function EventCard({
  event,
  eventStatusMap,
  paymentStatusMap,
  paymentStatusVariant,
  viewLabel,
}: EventCardProps) {
  return (
    <div className="rounded-lg border border-gray-100 p-3 transition-shadow hover:shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">
            {event.clientName}
          </p>
          <p className="flex items-center gap-1 text-xs text-gray-500">
            <span
              className={`inline-block h-2 w-2 rounded-full ${eventTypeColor(event.eventType)}`}
            />
            {event.eventCategoryName ?? event.eventType}
          </p>
        </div>
        <Badge variant={eventStatusVariant(event.eventStatus)}>
          {eventStatusMap[event.eventStatus] ?? event.eventStatus}
        </Badge>
      </div>

      {(event.eventTime || event.eventLocation) && (
        <div className="mb-2 space-y-1">
          {event.eventTime && (
            <p className="flex items-center gap-1.5 text-xs text-gray-500">
              <IconClock size={12} />
              {event.eventTime}
            </p>
          )}
          {event.eventLocation && (
            <p className="flex items-center gap-1.5 text-xs text-gray-500">
              <IconMapPin size={12} />
              <span className="truncate">{event.eventLocation}</span>
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <Badge variant={paymentStatusVariant[event.paymentStatus] ?? "default"}>
          {paymentStatusMap[event.paymentStatus] ?? event.paymentStatus}
        </Badge>
        <Link
          href={`/event/${event.id}`}
          className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-500"
        >
          <IconEye size={12} />
          {viewLabel}
        </Link>
      </div>
    </div>
  );
}

// ─── Calendar Sidebar ───────────────────────────────────────

interface CalendarSidebarProps {
  selectedDate: Date;
  selectedDateEvents: ScheduleEvent[];
  upcomingEvents: ScheduleEvent[];
  eventStatusMap: Record<string, string>;
  paymentStatusMap: Record<string, string>;
  paymentStatusVariant: Record<string, BadgeVariant>;
  viewLabel: string;
  noEventsOnDayLabel: string;
  upcomingLabel: string;
  noUpcomingLabel: string;
  relativeDayLabel: (dateStr: string) => string;
  onCreateBooking?: () => void;
  createBookingLabel?: string;
}

export function CalendarSidebar({
  selectedDate,
  selectedDateEvents,
  upcomingEvents,
  eventStatusMap,
  paymentStatusMap,
  paymentStatusVariant,
  viewLabel,
  noEventsOnDayLabel,
  upcomingLabel,
  noUpcomingLabel,
  relativeDayLabel,
  onCreateBooking,
  createBookingLabel,
}: CalendarSidebarProps) {
  return (
    <div className="space-y-4">
      {/* Day detail */}
      <Card>
        <CardBody className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h3>
          </div>

          {selectedDateEvents.length === 0 ? (
            <div className="py-6 text-center">
              <IconCalendar size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-xs text-gray-400">{noEventsOnDayLabel}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDateEvents.map((ev) => (
                <EventCard
                  key={ev.id}
                  event={ev}
                  eventStatusMap={eventStatusMap}
                  paymentStatusMap={paymentStatusMap}
                  paymentStatusVariant={paymentStatusVariant}
                  viewLabel={viewLabel}
                />
              ))}
            </div>
          )}

          {/* Quick action — create booking for this date */}
          {onCreateBooking && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full"
              onClick={onCreateBooking}
            >
              <IconPlus size={14} />
              {createBookingLabel ?? "Create Booking"}
            </Button>
          )}
        </CardBody>
      </Card>

      {/* Upcoming mini-list */}
      <Card>
        <CardBody className="p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">
            {upcomingLabel}
          </h3>
          {upcomingEvents.length === 0 ? (
            <p className="py-4 text-center text-xs text-gray-400">
              {noUpcomingLabel}
            </p>
          ) : (
            <div className="space-y-2">
              {upcomingEvents.slice(0, 5).map((ev) => (
                <Link
                  key={ev.id}
                  href={`/event/${ev.id}`}
                  className="flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-gray-50"
                >
                  <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${eventTypeColor(ev.eventType)}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-gray-900">
                      {ev.clientName}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(ev.eventDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                      {ev.eventTime && ` · ${ev.eventTime}`}
                    </p>
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {relativeDayLabel(ev.eventDate)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
