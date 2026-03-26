"use client";

import { Controller, type Control } from "react-hook-form";
import { Input } from "@/components/ui";
import type { BookingLinkFormValues } from "./types";

interface Props {
  control: Control<BookingLinkFormValues>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  labels: Record<string, any>;
}

export default function ClientEventFields({ control, labels }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">
        {labels.clientInfoTitle ?? "Client & Event Info"}
      </h3>

      <div className="grid gap-3 sm:grid-cols-2">
        <Controller
          control={control}
          name="clientName"
          render={({ field }) => (
            <Input
              label={labels.clientName ?? "Client Name"}
              placeholder={labels.clientNamePlaceholder ?? "e.g. Budi Santoso"}
              {...field}
            />
          )}
        />
        <Controller
          control={control}
          name="clientPhone"
          render={({ field }) => (
            <Input
              label={labels.clientPhone ?? "Phone"}
              placeholder="+62..."
              {...field}
            />
          )}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Controller
          control={control}
          name="eventDate"
          render={({ field }) => (
            <Input
              label={labels.eventDate ?? "Event Date"}
              type="date"
              {...field}
            />
          )}
        />
        <Controller
          control={control}
          name="eventTime"
          render={({ field }) => (
            <Input
              label={labels.eventTime ?? "Event Time"}
              type="time"
              {...field}
            />
          )}
        />
      </div>

      <Controller
        control={control}
        name="eventLocation"
        render={({ field }) => (
          <Input
            label={labels.eventLocation ?? "Location"}
            placeholder={labels.eventLocationPlaceholder ?? "Venue address"}
            {...field}
          />
        )}
      />
    </div>
  );
}
