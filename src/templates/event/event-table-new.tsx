"use client";

import Link from "next/link";
import { Card, CardBody, Badge } from "@/components/ui";
import {
  IconEvent,
  IconEye,
  IconClock,
  IconMapPin,
  IconPhone,
} from "@/components/icons";
import type { EventItem } from "./types";
import {
  eventStatusVariant,
  paymentStatusVariant,
  formatCurrency,
} from "./types";

interface EventTableProps {
  events: EventItem[];
  allEventsCount: number;
  eventStatusLabel: Record<string, string>;
  paymentStatusLabel: Record<string, string>;
  viewLabel: string;
  formatDate: (dateStr: string) => string;
  columns: {
    colEventDate: string;
    colClientName: string;
    colEventType: string;
    colPackage: string;
    colPaymentStatus: string;
    colEventStatus: string;
    colActions: string;
    colAmount: string;
  };
  emptyLabels: {
    noEvents: string;
    noEventsDesc: string;
    noMatchingEvents: string;
    noMatchingEventsDesc: string;
  };
}

export function EventTable({
  events,
  allEventsCount,
  eventStatusLabel,
  paymentStatusLabel,
  viewLabel,
  emptyLabels,
}: EventTableProps) {
  if (events.length === 0) {
    return (
      <Card>
        <CardBody>
          <div className="flex flex-col items-center py-16">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <IconEvent size={32} className="text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">
              {allEventsCount === 0
                ? emptyLabels.noEvents
                : emptyLabels.noMatchingEvents}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {allEventsCount === 0
                ? emptyLabels.noEventsDesc
                : emptyLabels.noMatchingEventsDesc}
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((e) => (
        <EventCard
          key={e.id}
          event={e}
          eventStatusLabel={eventStatusLabel}
          paymentStatusLabel={paymentStatusLabel}
          viewLabel={viewLabel}
        />
      ))}
    </div>
  );
}

// ─── Event Card (list item) ─────────────────────────────────

interface EventCardProps {
  event: EventItem;
  eventStatusLabel: Record<string, string>;
  paymentStatusLabel: Record<string, string>;
  viewLabel: string;
}

function EventCard({
  event,
  eventStatusLabel,
  paymentStatusLabel,
  viewLabel,
}: EventCardProps) {
  const firstSchedule = event.schedules?.[0];
  const eventDate = firstSchedule ? new Date(firstSchedule.date) : null;
  const isUpcoming = eventDate ? eventDate >= new Date() : false;

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardBody className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          {/* Left: main info */}
          <div className="flex gap-3 sm:gap-4 min-w-0 flex-1">
            {/* Date pill */}
            <div
              className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl text-center ${
                isUpcoming
                  ? "bg-blue-50 text-blue-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {eventDate && (
                <>
                  <span className="text-xs font-medium leading-none opacity-70">
                    {eventDate.toLocaleDateString("en-US", {
                      month: "short",
                    })}
                  </span>
                  <span className="mt-0.5 text-lg font-bold leading-tight">
                    {eventDate.getDate()}
                  </span>
                </>
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              {/* Row 1: client name + badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="truncate text-sm font-semibold text-slate-900">
                  {event.clientName}
                </h3>
                <Badge variant={eventStatusVariant(event.eventStatus)} dot>
                  {eventStatusLabel[event.eventStatus] ?? event.eventStatus}
                </Badge>
                <Badge variant={paymentStatusVariant(event.paymentStatus)} dot>
                  {paymentStatusLabel[event.paymentStatus] ??
                    event.paymentStatus}
                </Badge>
              </div>

              {/* Row 2: event type + package */}
              <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  {event.eventType}
                </span>
                {firstSchedule?.startTime && (
                  <span className="inline-flex items-center gap-1">
                    <IconClock size={12} className="shrink-0" />
                    {firstSchedule.startTime}
                  </span>
                )}
                {event.packageName && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    📦 {event.packageName}
                  </span>
                )}
              </div>

              {/* Row 3: meta details */}
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                {event.eventLocation && (
                  <span className="inline-flex items-center gap-1 truncate">
                    <IconMapPin size={12} />
                    <span className="truncate max-w-50">
                      {event.eventLocation}
                    </span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <IconPhone size={12} />
                  {event.clientPhone}
                </span>
              </div>
            </div>
          </div>

          {/* Right: amount + action */}
          <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
            {event.amount && (
              <p className="text-sm font-bold text-slate-900">
                {formatCurrency(event.amount, event.currency)}
              </p>
            )}
            <Link
              href={`/event/${event.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:border-blue-200"
            >
              <IconEye size={14} />
              {viewLabel}
            </Link>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
