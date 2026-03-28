"use client";

import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Select,
  Textarea,
} from "@/components/ui";
import type { EventDetail } from "./types";

// ─── Edit Mode ──────────────────────────────────────────────

export type EditSection = "client" | "event" | "status" | "notes" | "all";

interface EventDetailEditProps {
  event: EventDetail;
  onSave: (formData: FormData) => void;
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
  };
  cancelLabel: string;
}

export function EventDetailEdit({
  event,
  onSave,
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
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="eventDate"
                name="eventDate"
                type="date"
                label={labels.eventDate}
                defaultValue={event.eventDate.slice(0, 10)}
                required
              />
              <Input
                id="eventTime"
                name="eventTime"
                type="time"
                label={labels.eventTime}
                defaultValue={event.eventTime ?? ""}
              />
            </div>
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
