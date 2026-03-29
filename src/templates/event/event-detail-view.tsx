"use client";

import { Card, CardHeader, CardBody, Button } from "@/components/ui";
import {
  IconPhone,
  IconMail,
  IconMapPin,
  IconClock,
  IconCalendar,
  IconNotes,
  IconEdit,
} from "@/components/icons";
import type {
  EventDetail,
  EventScheduleItem,
  PackageSnapshot,
  AddOnSnapshot,
} from "./types";
import { formatCurrency } from "./types";

// ─── View Mode ──────────────────────────────────────────────

interface EventDetailViewProps {
  event: EventDetail;
  formatDate: (dateStr: string) => string;
  labels: {
    clientInfo: string;
    clientName: string;
    clientPhone: string;
    clientPhoneSecondary: string;
    clientEmail: string;
    eventInfo: string;
    eventCategory: string;
    eventDate: string;
    eventTime: string;
    eventLocation: string;
    eventLocationUrl?: string;
    notes: string;
    noNotes: string;
    editLabel?: string;
    notSet?: string;
    updateStatus?: string;
    paymentStatus?: string;
    // Schedule
    scheduleTitle?: string;
    scheduleDate?: string;
    scheduleStartTime?: string;
    scheduleEndTime?: string;
    scheduleLabel?: string;
    noScheduleDates?: string;
  };
  /** Which cards to show */
  variant?:
    | "general"
    | "package-only"
    | "client-only"
    | "event-only"
    | "status-only"
    | "notes-only"
    | "schedule-only";
  /** Callbacks to enable per-card edit buttons */
  onEditClient?: () => void;
  onEditEvent?: () => void;
  onEditNotes?: () => void;
  onEditStatus?: () => void;
  onEditPackage?: () => void;
  onEditAddOns?: () => void;
  onEditSchedule?: () => void;
  bookingLabels?: {
    totalPaid: string;
    remaining: string;
  };
  totalPaid?: number;
  remaining?: number;
  /** Status display helpers */
  eventStatusLabel?: string;
  paymentStatusLabel?: string;
}

export function EventDetailView({
  event,
  formatDate,
  labels,
  variant = "general",
  onEditClient,
  onEditEvent,
  onEditNotes,
  onEditStatus,
  onEditPackage,
  onEditAddOns,
  onEditSchedule,
  bookingLabels,
  totalPaid = 0,
  remaining = 0,
  eventStatusLabel,
  paymentStatusLabel,
}: EventDetailViewProps) {
  if (variant === "package-only") {
    return (
      <div className="space-y-6">
        {/* Package (from snapshot) */}
        {event.packageSnapshot != null && (
          <PackageSnapshotCard
            snapshot={event.packageSnapshot as PackageSnapshot}
            currency={event.currency}
            onEdit={onEditPackage}
            editLabel={labels.editLabel}
          />
        )}

        {/* Add-ons (from snapshot) */}
        <AddOnsSnapshotCard
          snapshot={(event.addOnsSnapshot as AddOnSnapshot[] | undefined) ?? []}
          currency={event.currency}
          onEdit={onEditAddOns}
          editLabel={labels.editLabel}
        />

        {/* Payment Summary */}
        {bookingLabels && (
          <Card>
            <CardHeader>
              <h2 className="text-base font-semibold text-gray-900">
                Payment Summary
              </h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <InfoRow label="Total">
                {formatCurrency(event.amount, event.currency)}
              </InfoRow>
              <InfoRow label={bookingLabels.totalPaid}>
                <span className="text-green-600">
                  {formatCurrency(totalPaid.toString())}
                </span>
              </InfoRow>
              <InfoRow label={bookingLabels.remaining}>
                <span
                  className={remaining > 0 ? "text-red-600" : "text-green-600"}
                >
                  {formatCurrency(remaining.toString())}
                </span>
              </InfoRow>
            </CardBody>
          </Card>
        )}
      </div>
    );
  }

  // Determine which cards to show
  const showClient = variant === "general" || variant === "client-only";
  const showEvent = variant === "general" || variant === "event-only";
  const showSchedule = variant === "general" || variant === "schedule-only";
  const showStatus = variant === "status-only";
  const showNotes = variant === "general" || variant === "notes-only";

  return (
    <div className="space-y-6">
      {/* Client Info */}
      {showClient && (
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-gray-900">
              {labels.clientInfo}
            </h2>
            {onEditClient && (
              <Button variant="ghost" size="sm" onClick={onEditClient}>
                <IconEdit size={14} />
                {labels.editLabel ?? "Edit"}
              </Button>
            )}
          </CardHeader>
          <CardBody className="space-y-3">
            <InfoRow label={labels.clientName}>{event.clientName}</InfoRow>
            <InfoRow label={labels.clientPhone} icon={<IconPhone size={14} />}>
              {event.clientPhone}
            </InfoRow>
            <InfoRow
              label={labels.clientPhoneSecondary}
              icon={<IconPhone size={14} />}
            >
              {event.clientPhoneSecondary || labels.notSet || "—"}
            </InfoRow>
            <InfoRow label={labels.clientEmail} icon={<IconMail size={14} />}>
              {event.clientEmail || labels.notSet || "—"}
            </InfoRow>
          </CardBody>
        </Card>
      )}

      {/* Event Info */}
      {showEvent && (
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-gray-900">
              {labels.eventInfo}
            </h2>
            {onEditEvent && (
              <Button variant="ghost" size="sm" onClick={onEditEvent}>
                <IconEdit size={14} />
                {labels.editLabel ?? "Edit"}
              </Button>
            )}
          </CardHeader>
          <CardBody className="space-y-3">
            <InfoRow label={labels.eventCategory}>
              {event.eventCategoryName ??
                event.eventType ??
                labels.notSet ??
                "—"}
            </InfoRow>
            <InfoRow
              label={labels.eventLocation}
              icon={<IconMapPin size={14} />}
            >
              {event.eventLocation ? (
                event.eventLocationUrl ? (
                  <a
                    href={event.eventLocationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {event.eventLocation}
                  </a>
                ) : (
                  event.eventLocation
                )
              ) : (
                (labels.notSet ?? "—")
              )}
            </InfoRow>
            {event.eventLocationUrl && (
              <InfoRow
                label={labels.eventLocationUrl ?? "Map Link"}
                icon={<IconMapPin size={14} />}
              >
                <a
                  href={event.eventLocationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {labels.eventLocationUrl ?? "View Map"}
                </a>
              </InfoRow>
            )}
          </CardBody>
        </Card>
      )}

      {/* Schedule */}
      {showSchedule && (
        <Card>
          <CardHeader>
            <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
              <IconCalendar size={16} />
              {labels.scheduleTitle ?? "Schedule"}
            </h2>
            {onEditSchedule && (
              <Button variant="ghost" size="sm" onClick={onEditSchedule}>
                <IconEdit size={14} />
                {labels.editLabel ?? "Edit"}
              </Button>
            )}
          </CardHeader>
          <CardBody>
            {event.schedules && event.schedules.length > 0 ? (
              <div className="space-y-3">
                {event.schedules.map((s: EventScheduleItem, idx: number) => (
                  <div
                    key={s.id ?? idx}
                    className="flex flex-col gap-1 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                  >
                    {s.label && (
                      <span className="text-xs font-medium text-gray-500">
                        {s.label}
                      </span>
                    )}
                    <div className="flex items-center gap-3 text-sm">
                      <span className="flex items-center gap-1.5 font-medium text-gray-900">
                        <IconCalendar size={13} />
                        {formatDate(s.date)}
                      </span>
                      {(s.startTime || s.endTime) && (
                        <span className="flex items-center gap-1 text-gray-500">
                          <IconClock size={13} />
                          {s.startTime ?? "—"}
                          {s.endTime ? ` – ${s.endTime}` : ""}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                {labels.noScheduleDates ?? "No schedule dates set."}
              </p>
            )}
          </CardBody>
        </Card>
      )}

      {/* Status */}
      {showStatus && (
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-gray-900">
              {labels.updateStatus ?? "Status"}
            </h2>
            {onEditStatus && (
              <Button variant="ghost" size="sm" onClick={onEditStatus}>
                <IconEdit size={14} />
                {labels.editLabel ?? "Edit"}
              </Button>
            )}
          </CardHeader>
          <CardBody className="space-y-3">
            <InfoRow label={labels.updateStatus ?? "Event Status"}>
              {eventStatusLabel ?? event.eventStatus}
            </InfoRow>
            <InfoRow label={labels.paymentStatus ?? "Payment Status"}>
              {paymentStatusLabel ?? event.paymentStatus}
            </InfoRow>
          </CardBody>
        </Card>
      )}

      {/* Notes */}
      {showNotes && (
        <Card>
          <CardHeader>
            <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
              <IconNotes size={16} />
              {labels.notes}
            </h2>
            {onEditNotes && (
              <Button variant="ghost" size="sm" onClick={onEditNotes}>
                <IconEdit size={14} />
                {labels.editLabel ?? "Edit"}
              </Button>
            )}
          </CardHeader>
          <CardBody>
            <p className="text-sm text-gray-600">
              {event.notes || labels.noNotes}
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

// ─── InfoRow helper ─────────────────────────────────────────

function InfoRow({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="flex items-center gap-1.5 text-sm text-gray-500">
        {icon}
        {label}
      </span>
      <span className="text-right text-sm font-medium text-gray-900">
        {children}
      </span>
    </div>
  );
}

// ─── Package Snapshot Card ──────────────────────────────────

function PackageSnapshotCard({
  snapshot,
  currency,
  labels,
  onEdit,
  editLabel,
}: {
  snapshot: PackageSnapshot;
  currency: string;
  labels?: { packageInfo: string; packageName: string };
  onEdit?: () => void;
  editLabel?: string;
}) {
  const inclusions = (snapshot.inclusions as string[] | undefined) ?? [];

  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-semibold text-gray-900">
          {labels?.packageInfo ?? "Package"}
        </h2>
        {onEdit && (
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <IconEdit size={14} />
            {editLabel ?? "Edit"}
          </Button>
        )}
      </CardHeader>
      <CardBody className="space-y-3">
        <InfoRow label={labels?.packageName ?? "Selected Package"}>
          {(snapshot.name as string) ?? "-"}
        </InfoRow>
        {typeof snapshot.description === "string" && snapshot.description && (
          <p className="text-sm text-gray-600">{snapshot.description}</p>
        )}
        {inclusions.length > 0 && (
          <ul className="mt-2 space-y-1 pl-4">
            {inclusions.map((item, i) => (
              <li key={i} className="list-disc text-xs text-gray-500">
                {item}
              </li>
            ))}
          </ul>
        )}
        {snapshot.price != null && (
          <p className="mt-2 text-sm font-medium text-gray-900">
            {formatCurrency(String(snapshot.price), currency)}
          </p>
        )}
      </CardBody>
    </Card>
  );
}

// ─── AddOns Snapshot Card ───────────────────────────────────

function AddOnsSnapshotCard({
  snapshot,
  currency,
  label,
  onEdit,
  editLabel,
}: {
  snapshot: AddOnSnapshot[];
  currency: string;
  label?: string;
  onEdit?: () => void;
  editLabel?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-semibold text-gray-900">
          {label ?? "Add-ons"}
        </h2>
        {onEdit && (
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <IconEdit size={14} />
            {editLabel ?? "Edit"}
          </Button>
        )}
      </CardHeader>
      <CardBody>
        {snapshot.length > 0 ? (
          <div className="space-y-2">
            {snapshot.map((addon, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-gray-700">
                  {addon.name as string}
                  {(addon.quantity as number) > 1 && (
                    <span className="ml-1 text-gray-400">
                      ×{addon.quantity as number}
                    </span>
                  )}
                </span>
                {addon.price != null && (
                  <span className="font-medium text-gray-900">
                    {formatCurrency(String(addon.price), currency)}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No add-ons selected.</p>
        )}
      </CardBody>
    </Card>
  );
}
