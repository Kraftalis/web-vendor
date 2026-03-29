"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Select,
  Textarea,
} from "@/components/ui";
import { IconPlus, IconTrash } from "@/components/icons";
import type { EventDetail, EventScheduleItem } from "./types";

// ─── Edit Mode ──────────────────────────────────────────────

export interface ScheduleRow {
  id?: string;
  date: string;
  startTime: string;
  endTime: string;
  label: string;
}

export type EditSection =
  | "client"
  | "event"
  | "status"
  | "notes"
  | "schedule"
  | "all";

interface EventDetailEditProps {
  event: EventDetail;
  onSave: (formData: FormData) => void;
  onSaveSchedules?: (schedules: ScheduleRow[]) => void;
  onCancel: () => void;
  isSaving: boolean;
  eventCategories: { value: string; label: string }[];
  eventStatusOptions: { value: string; label: string }[];
  paymentStatusOptions: { value: string; label: string }[];
  /** Which section to render in edit mode. Defaults to "all" */
  section?: EditSection;
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
    paymentInfo: string;
    totalAmount: string;
    notes: string;
    saveChanges: string;
    updateStatus: string;
    paymentStatus: string;
    // Schedule
    scheduleTitle?: string;
    scheduleDate?: string;
    scheduleStartTime?: string;
    scheduleEndTime?: string;
    scheduleLabel?: string;
    addScheduleDate?: string;
    removeScheduleDate?: string;
  };
  cancelLabel: string;
}

export function EventDetailEdit({
  event,
  onSave,
  onSaveSchedules,
  onCancel,
  isSaving,
  eventCategories,
  eventStatusOptions,
  paymentStatusOptions,
  section = "all",
  labels,
  cancelLabel,
}: EventDetailEditProps) {
  const showClient = section === "all" || section === "client";
  const showEvent = section === "all" || section === "event";
  const showStatus = section === "all" || section === "status";
  const showPayment = section === "all";
  const showNotes = section === "all" || section === "notes";
  const showSchedule = section === "schedule";

  // ─── Schedule local state ─────────────────────────────────
  const [scheduleRows, setScheduleRows] = useState<ScheduleRow[]>(() => {
    if (event.schedules && event.schedules.length > 0) {
      return event.schedules.map((s: EventScheduleItem) => ({
        id: s.id,
        date: s.date.slice(0, 10),
        startTime: s.startTime ?? "",
        endTime: s.endTime ?? "",
        label: s.label ?? "",
      }));
    }
    return [{ date: "", startTime: "", endTime: "", label: "" }];
  });

  function addRow() {
    setScheduleRows((prev) => [
      ...prev,
      { date: "", startTime: "", endTime: "", label: "" },
    ]);
  }

  function removeRow(idx: number) {
    setScheduleRows((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateRow(idx: number, field: keyof ScheduleRow, value: string) {
    setScheduleRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)),
    );
  }

  function handleScheduleSave() {
    if (onSaveSchedules) {
      onSaveSchedules(scheduleRows.filter((r) => r.date));
    }
  }

  if (showSchedule) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-gray-900">
              {labels.scheduleTitle ?? "Schedule"}
            </h2>
          </CardHeader>
          <CardBody className="space-y-4">
            {scheduleRows.map((row, idx) => (
              <div
                key={idx}
                className="space-y-3 rounded-lg border border-gray-100 bg-gray-50 p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">
                    #{idx + 1}
                  </span>
                  {scheduleRows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(idx)}
                      className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                    >
                      <IconTrash size={12} />
                      {labels.removeScheduleDate ?? "Remove"}
                    </button>
                  )}
                </div>
                <Input
                  id={`schedule-label-${idx}`}
                  name={`schedule-label-${idx}`}
                  label={labels.scheduleLabel ?? "Label"}
                  placeholder="e.g. Day 1, Ceremony"
                  value={row.label}
                  onChange={(e) => updateRow(idx, "label", e.target.value)}
                />
                <Input
                  id={`schedule-date-${idx}`}
                  name={`schedule-date-${idx}`}
                  type="date"
                  label={labels.scheduleDate ?? "Date"}
                  value={row.date}
                  onChange={(e) => updateRow(idx, "date", e.target.value)}
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    id={`schedule-start-${idx}`}
                    name={`schedule-start-${idx}`}
                    type="time"
                    label={labels.scheduleStartTime ?? "Start Time"}
                    value={row.startTime}
                    onChange={(e) =>
                      updateRow(idx, "startTime", e.target.value)
                    }
                  />
                  <Input
                    id={`schedule-end-${idx}`}
                    name={`schedule-end-${idx}`}
                    type="time"
                    label={labels.scheduleEndTime ?? "End Time"}
                    value={row.endTime}
                    onChange={(e) => updateRow(idx, "endTime", e.target.value)}
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRow}
              className="w-full"
            >
              <IconPlus size={14} />
              {labels.addScheduleDate ?? "Add Date"}
            </Button>
          </CardBody>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="ghost" type="button" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            isLoading={isSaving}
            onClick={handleScheduleSave}
          >
            {labels.saveChanges}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form action={onSave} className="space-y-6">
      {/* Client Info */}
      {showClient && (
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-gray-900">
              {labels.clientInfo}
            </h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input
              id="clientName"
              name="clientName"
              label={labels.clientName}
              defaultValue={event.clientName}
              required
            />
            <Input
              id="clientPhone"
              name="clientPhone"
              label={labels.clientPhone}
              defaultValue={event.clientPhone}
              required
            />
            <Input
              id="clientPhoneSecondary"
              name="clientPhoneSecondary"
              label={labels.clientPhoneSecondary}
              defaultValue={event.clientPhoneSecondary ?? ""}
            />
            <Input
              id="clientEmail"
              name="clientEmail"
              type="email"
              label={labels.clientEmail}
              defaultValue={event.clientEmail ?? ""}
            />
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
          </CardHeader>
          <CardBody className="space-y-4">
            <Select
              id="eventCategoryId"
              name="eventCategoryId"
              label={labels.eventCategory}
              defaultValue={event.eventCategoryId ?? ""}
              options={eventCategories}
            />
            <Input
              id="eventLocation"
              name="eventLocation"
              label={labels.eventLocation}
              defaultValue={event.eventLocation ?? ""}
            />
          </CardBody>
        </Card>
      )}

      {/* Status */}
      {showStatus && (
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-gray-900">
              {labels.updateStatus}
            </h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <Select
              id="eventStatus"
              name="eventStatus"
              label={labels.updateStatus}
              defaultValue={event.eventStatus}
              options={eventStatusOptions}
            />
            <Select
              id="paymentStatus"
              name="paymentStatus"
              label={labels.paymentStatus}
              defaultValue={event.paymentStatus}
              options={paymentStatusOptions}
            />
          </CardBody>
        </Card>
      )}

      {/* Payment */}
      {showPayment && (
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-gray-900">
              {labels.paymentInfo}
            </h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input
              id="amount"
              name="amount"
              type="number"
              label={labels.totalAmount}
              defaultValue={event.amount ?? ""}
            />
          </CardBody>
        </Card>
      )}

      {/* Notes */}
      {showNotes && (
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-gray-900">
              {labels.notes}
            </h2>
          </CardHeader>
          <CardBody>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={event.notes ?? ""}
            />
          </CardBody>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="ghost" type="button" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button type="submit" isLoading={isSaving}>
          {labels.saveChanges}
        </Button>
      </div>
    </form>
  );
}
