"use client";

import { Card, CardHeader, CardBody, Button } from "@/components/ui";
import {
  IconCalendar,
  IconClock,
  IconMapPin,
  IconCheck,
  IconEvent,
  IconGoogleCalendar,
} from "@/components/icons";
import { buildGoogleCalendarUrl } from "@/lib/google-calendar";
import type { PortalEvent } from "./types";
import { formatCurrency } from "./types";

// ─── Event Info Card ────────────────────────────────────────

interface PortalEventInfoProps {
  event: PortalEvent;
  labels: {
    portalEventDetails: string;
    portalEventType: string;
    portalEventDate: string;
    portalEventTime: string;
    portalEventLocation: string;
    portalYourPackage: string;
    portalNoPackage: string;
    portalYourAddOns: string;
    portalNoAddOns: string;
    portalIncluded: string;
    addToCalendar: string;
  };
  addOnLabels: {
    qty: string;
    perUnit: string;
  };
  formatDate: (dateStr: string) => string;
}

export function PortalEventInfo({
  event,
  labels,
  addOnLabels,
  formatDate,
}: PortalEventInfoProps) {
  const pkg = event.packageSnapshot;
  const addOns = event.addOnsSnapshot ?? [];

  return (
    <div className="space-y-4">
      {/* Event Details */}
      <Card>
        <CardHeader>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <IconEvent size={16} className="text-blue-500" />
            {labels.portalEventDetails}
          </h2>
        </CardHeader>
        <CardBody>
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoItem
              icon={<IconEvent size={14} className="text-gray-400" />}
              label={labels.portalEventType}
              value={event.eventType}
            />
            <InfoItem
              icon={<IconCalendar size={14} className="text-gray-400" />}
              label={labels.portalEventDate}
              value={formatDate(event.eventDate)}
            />
            {event.eventTime && (
              <InfoItem
                icon={<IconClock size={14} className="text-gray-400" />}
                label={labels.portalEventTime}
                value={event.eventTime}
              />
            )}
            {event.eventLocation && (
              <InfoItem
                icon={<IconMapPin size={14} className="text-gray-400" />}
                label={labels.portalEventLocation}
                value={event.eventLocation}
              />
            )}
            {event.eventLocationUrl && (
              <div className="sm:col-span-2">
                <a
                  href={event.eventLocationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:underline"
                >
                  <IconMapPin size={12} />
                  Open in Google Maps ↗
                </a>
              </div>
            )}
          </div>

          {/* Google Calendar link */}
          <div className="mt-4 border-t border-gray-100 pt-4">
            <a
              href={buildGoogleCalendarUrl({
                title: event.eventType ?? "Event",
                date: event.eventDate,
                time: event.eventTime ?? null,
                location: event.eventLocation ?? null,
              })}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                type="button"
              >
                <IconGoogleCalendar size={14} />
                {labels.addToCalendar}
              </Button>
            </a>
          </div>
        </CardBody>
      </Card>

      {/* Package (from snapshot) */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-gray-900">
            {labels.portalYourPackage}
          </h2>
        </CardHeader>
        <CardBody>
          {pkg ? (
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{pkg.name}</p>
                  {pkg.variationLabel && (
                    <p className="mt-0.5 text-xs text-blue-600">
                      {pkg.variationLabel}
                    </p>
                  )}
                  {pkg.description && (
                    <p className="mt-0.5 text-xs text-gray-500">
                      {pkg.description}
                    </p>
                  )}
                </div>
                <p className="text-sm font-bold text-blue-600">
                  {formatCurrency(pkg.price, pkg.currency)}
                </p>
              </div>

              {pkg.inclusions && pkg.inclusions.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    {labels.portalIncluded}
                  </p>
                  <ul className="space-y-1.5">
                    {pkg.inclusions.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-sm text-gray-600"
                      >
                        <IconCheck
                          size={14}
                          className="shrink-0 text-green-500"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-gray-400">
              {labels.portalNoPackage}
            </p>
          )}
        </CardBody>
      </Card>

      {/* Add-ons (from snapshot) */}
      {addOns.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-gray-900">
              {labels.portalYourAddOns}
            </h2>
          </CardHeader>
          <CardBody>
            <div className="divide-y divide-gray-100">
              {addOns.map((ao, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {ao.name}
                    </p>
                    {ao.description && (
                      <p className="text-xs text-gray-500">{ao.description}</p>
                    )}
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium text-gray-900">
                      {formatCurrency(ao.price, ao.currency)}
                    </p>
                    {ao.quantity > 1 && (
                      <p className="text-xs text-gray-400">
                        {addOnLabels.qty}: {ao.quantity} ×{" "}
                        {formatCurrency(ao.price, ao.currency)}{" "}
                        {addOnLabels.perUnit}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

// ─── InfoItem helper ────────────────────────────────────────

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}
