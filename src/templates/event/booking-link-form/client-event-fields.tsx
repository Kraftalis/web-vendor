"use client";

import { Controller, useFieldArray, type Control } from "react-hook-form";
import { Input, PhoneInput } from "@/components/ui";
import { IconPlus } from "@/components/icons";
import type { BookingLinkFormValues } from "./types";

interface Props {
  control: Control<BookingLinkFormValues>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  labels: Record<string, any>;
}

export default function ClientEventFields({ control, labels }: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "scheduleDates",
  });

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
            <PhoneInput
              label={labels.clientPhone ?? "Phone"}
              placeholder="08..."
              {...field}
            />
          )}
        />
      </div>

      {/* Schedule Dates */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-700">
            {labels.scheduleDates ?? "Schedule Dates"}
          </h4>
          <button
            type="button"
            onClick={() =>
              append({ date: "", startTime: "", endTime: "", label: "" })
            }
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <IconPlus size={14} />
            {labels.addDate ?? "Add Date"}
          </button>
        </div>

        {fields.map((field, index) => (
          <div
            key={field.id}
            className="rounded-lg border border-gray-200 bg-gray-50/50 p-3 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">
                {labels.day ?? "Day"} {index + 1}
              </span>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
                >
                  {labels.remove ?? "Remove"}
                </button>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Controller
                control={control}
                name={`scheduleDates.${index}.date`}
                render={({ field: f }) => (
                  <Input
                    label={labels.eventDate ?? "Date"}
                    type="date"
                    value={f.value ?? ""}
                    onChange={(e) =>
                      f.onChange((e.target as HTMLInputElement).value)
                    }
                  />
                )}
              />
              <Controller
                control={control}
                name={`scheduleDates.${index}.startTime`}
                render={({ field: f }) => (
                  <Input
                    label={labels.startTime ?? "Start Time"}
                    type="time"
                    value={f.value ?? ""}
                    onChange={(e) =>
                      f.onChange((e.target as HTMLInputElement).value)
                    }
                  />
                )}
              />
              <Controller
                control={control}
                name={`scheduleDates.${index}.endTime`}
                render={({ field: f }) => (
                  <Input
                    label={labels.endTime ?? "End Time"}
                    type="time"
                    value={f.value ?? ""}
                    onChange={(e) =>
                      f.onChange((e.target as HTMLInputElement).value)
                    }
                  />
                )}
              />
            </div>
            <Controller
              control={control}
              name={`scheduleDates.${index}.label`}
              render={({ field: f }) => (
                <Input
                  label={labels.scheduleLabel ?? "Label (optional)"}
                  placeholder={
                    labels.scheduleLabelPlaceholder ??
                    "e.g. Akad Nikah, Resepsi"
                  }
                  {...f}
                />
              )}
            />
          </div>
        ))}
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
