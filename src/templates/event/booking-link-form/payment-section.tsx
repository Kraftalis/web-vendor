"use client";

import { useRef } from "react";
import {
  Controller,
  useWatch,
  type Control,
  type UseFormSetValue,
} from "react-hook-form";
import { Input, Select, CurrencyInput } from "@/components/ui";
import type { BookingLinkFormValues } from "./types";

interface Props {
  control: Control<BookingLinkFormValues>;
  setValue: UseFormSetValue<BookingLinkFormValues>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  labels: Record<string, any>;
}

export default function PaymentSection({ control, setValue, labels }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const paymentType = useWatch({ control, name: "paymentType" });
  const paymentReceipt = useWatch({ control, name: "paymentReceipt" });

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-700">
          {labels.paymentSectionTitle ?? "Payment (optional)"}
        </h3>
        <p className="text-xs text-gray-500">
          {labels.paymentSectionDesc ??
            "Record a payment to automatically mark the event as booked."}
        </p>
      </div>

      <Controller
        control={control}
        name="paymentType"
        render={({ field }) => (
          <Select
            label={labels.paymentTypeLabel ?? "Payment Type"}
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            options={[
              { value: "", label: labels.noPayment ?? "No payment" },
              {
                value: "DOWN_PAYMENT",
                label: labels.dpOption ?? "Down Payment (DP)",
              },
              {
                value: "FULL_PAYMENT",
                label: labels.fullPaymentOption ?? "Full Payment",
              },
            ]}
          />
        )}
      />

      {paymentType && (
        <div className="space-y-3">
          <Controller
            control={control}
            name="paymentAmount"
            render={({ field }) => (
              <CurrencyInput
                label={labels.paymentAmountLabel ?? "Payment Amount"}
                placeholder="0"
                value={field.value}
                onValueChange={(val) => field.onChange(val)}
              />
            )}
          />

          {/* Receipt upload */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {labels.receiptLabel ?? "Transfer Receipt (optional)"}
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) =>
                setValue("paymentReceipt", e.target.files?.[0] ?? null)
              }
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2.5 text-sm text-gray-600 transition hover:border-gray-400 hover:bg-gray-50"
            >
              {paymentReceipt ? (
                <span className="max-w-50 truncate text-gray-900">
                  {paymentReceipt.name}
                </span>
              ) : (
                <span>{labels.selectReceipt ?? "Select file"}</span>
              )}
            </button>
            {paymentReceipt && (
              <button
                type="button"
                onClick={() => {
                  setValue("paymentReceipt", null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                className="ml-2 text-xs text-red-500 hover:underline"
              >
                {labels.removeFile ?? "Remove"}
              </button>
            )}
            <p className="mt-1 text-xs text-gray-400">
              {labels.acceptedFormats ?? "JPG, PNG, or PDF (max 5 MB)"}
            </p>
          </div>

          <Controller
            control={control}
            name="paymentNote"
            render={({ field }) => (
              <Input
                label={labels.paymentNoteLabel ?? "Note (optional)"}
                placeholder={
                  labels.paymentNotePlaceholder ?? "e.g. DP transfer via BCA"
                }
                {...field}
              />
            )}
          />
        </div>
      )}
    </div>
  );
}
