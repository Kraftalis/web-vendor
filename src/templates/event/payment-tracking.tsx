"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  Button,
  Input,
  Select,
} from "@/components/ui";
import {
  IconUpload,
  IconImage,
  IconCheck,
  IconDollar,
} from "@/components/icons";
import type { PaymentSerialized } from "./types";
import { formatCurrency } from "./types";

// ─── Payment Progress Bar ───────────────────────────────────

interface PaymentProgressProps {
  totalAmount: number;
  totalPaid: number;
  remaining: number;
  onAddPayment?: () => void;
  labels: {
    paymentProgress: string;
    paidOf: string;
    totalPaid: string;
    remaining: string;
    addPayment?: string;
  };
}

export function PaymentProgress({
  totalAmount,
  totalPaid,
  remaining,
  onAddPayment,
  labels,
}: PaymentProgressProps) {
  const percentage =
    totalAmount > 0 ? Math.min((totalPaid / totalAmount) * 100, 100) : 0;

  return (
    <Card>
      <CardBody className="p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">
          {labels.paymentProgress}
        </h3>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-gray-500">
              {formatCurrency(totalPaid.toString())} {labels.paidOf}{" "}
              {formatCurrency(totalAmount.toString())}
            </span>
            <span className="font-medium text-gray-700">
              {Math.round(percentage)}%
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentage >= 100
                  ? "bg-green-500"
                  : percentage >= 50
                    ? "bg-blue-500"
                    : percentage > 0
                      ? "bg-amber-500"
                      : "bg-gray-200"
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-green-50 p-2.5">
            <p className="text-xs text-green-600">{labels.totalPaid}</p>
            <p className="font-semibold text-green-700">
              {formatCurrency(totalPaid.toString())}
            </p>
          </div>
          <div className="rounded-lg bg-red-50 p-2.5">
            <p className="text-xs text-red-600">{labels.remaining}</p>
            <p className="font-semibold text-red-700">
              {formatCurrency(remaining.toString())}
            </p>
          </div>
        </div>
      </CardBody>

      {/* Add Payment button in footer (requirement #8) */}
      {onAddPayment && (
        <CardFooter className="flex justify-end">
          <Button size="sm" onClick={onAddPayment}>
            {labels.addPayment ?? "Add Payment"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

// ─── Payment Records Table ──────────────────────────────────

interface PaymentRecordsProps {
  payments: PaymentSerialized[];
  paymentTypeMap: Record<string, string>;
  onVerify: (paymentId: string) => void;
  onReject: (paymentId: string) => void;
  onViewReceipt?: (receipt: {
    url: string;
    name: string;
    type: string;
  }) => void;
  labels: {
    paymentRecords: string;
    noPaymentsYet: string;
    noPaymentsDesc: string;
    amountLabel: string;
    typeLabel: string;
    dateLabel: string;
    statusLabel: string;
    receiptLabel: string;
    actionLabel: string;
    viewReceipt: string;
    verifyPayment: string;
    rejectPayment: string;
    verified: string;
    pending: string;
    receiptUploaded: string;
    noReceipt: string;
  };
  formatDate: (dateStr: string) => string;
}

export function PaymentRecords({
  payments,
  paymentTypeMap,
  onVerify,
  onReject,
  onViewReceipt,
  labels,
  formatDate,
}: PaymentRecordsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            {labels.paymentRecords}
          </h2>
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
            {payments.length}
          </span>
        </div>
      </CardHeader>
      <CardBody>
        {payments.length === 0 ? (
          <div className="py-8 text-center">
            <IconDollar size={32} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">
              {labels.noPaymentsYet}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              {labels.noPaymentsDesc}
            </p>
          </div>
        ) : (
          <div className="-mx-1 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="px-3 py-2 font-medium">{labels.typeLabel}</th>
                  <th className="px-3 py-2 font-medium">
                    {labels.amountLabel}
                  </th>
                  <th className="px-3 py-2 font-medium">{labels.dateLabel}</th>
                  <th className="px-3 py-2 font-medium">
                    {labels.receiptLabel}
                  </th>
                  <th className="px-3 py-2 font-medium">
                    {labels.statusLabel}
                  </th>
                  <th className="px-3 py-2 font-medium">
                    {labels.actionLabel}
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <PaymentRow
                    key={p.id}
                    payment={p}
                    paymentTypeMap={paymentTypeMap}
                    onVerify={onVerify}
                    onReject={onReject}
                    onViewReceipt={onViewReceipt}
                    labels={labels}
                    formatDate={formatDate}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// ─── Single Payment Row ─────────────────────────────────────

function PaymentRow({
  payment,
  paymentTypeMap,
  onVerify,
  onReject,
  onViewReceipt,
  labels,
  formatDate,
}: {
  payment: PaymentSerialized;
  paymentTypeMap: Record<string, string>;
  onVerify: (id: string) => void;
  onReject: (id: string) => void;
  onViewReceipt?: (receipt: {
    url: string;
    name: string;
    type: string;
  }) => void;
  labels: PaymentRecordsProps["labels"];
  formatDate: (dateStr: string) => string;
}) {
  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="px-3 py-2.5 text-gray-700">
        <div className="flex items-center gap-1.5">
          {paymentTypeMap[payment.paymentType] ?? payment.paymentType}
          <span
            className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium leading-none ${
              payment.paidBy === "VENDOR"
                ? "bg-purple-50 text-purple-600"
                : "bg-sky-50 text-sky-600"
            }`}
          >
            {payment.paidBy === "VENDOR" ? "Vendor" : "Client"}
          </span>
        </div>
        {payment.note && (
          <p className="mt-0.5 text-[10px] text-gray-400">{payment.note}</p>
        )}
      </td>
      <td className="px-3 py-2.5 font-medium text-gray-900">
        {formatCurrency(payment.amount)}
      </td>
      <td className="px-3 py-2.5 text-gray-500">
        {formatDate(payment.createdAt)}
      </td>
      <td className="px-3 py-2.5">
        {payment.receiptUrl ? (
          <button
            type="button"
            onClick={() =>
              onViewReceipt?.({
                url: payment.receiptUrl!,
                name: payment.receiptName ?? "Receipt",
                type: payment.receiptUrl!.match(/\.(jpg|jpeg|png|gif|webp)$/i)
                  ? "image/jpeg"
                  : "application/pdf",
              })
            }
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-500"
          >
            <IconImage size={12} />
            {labels.viewReceipt}
          </button>
        ) : (
          <span className="text-xs text-gray-400">{labels.noReceipt}</span>
        )}
      </td>
      <td className="px-3 py-2.5">
        <Badge variant={payment.isVerified ? "success" : "warning"}>
          {payment.isVerified ? labels.verified : labels.pending}
        </Badge>
      </td>
      <td className="px-3 py-2.5">
        {!payment.isVerified && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onVerify(payment.id)}
              className="rounded px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50"
            >
              {labels.verifyPayment}
            </button>
            <button
              onClick={() => onReject(payment.id)}
              className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              {labels.rejectPayment}
            </button>
          </div>
        )}
        {payment.isVerified && (
          <IconCheck size={14} className="text-green-500" />
        )}
      </td>
    </tr>
  );
}

// ─── Add Payment Modal Content ──────────────────────────────

interface AddPaymentFormProps {
  onSubmit: (data: {
    amount: string;
    paymentType: string;
    note: string;
    receiptFile: File | null;
  }) => void;
  isSubmitting: boolean;
  paymentTypeMap: Record<string, string>;
  labels: {
    amountLabel: string;
    typeLabel: string;
    receiptLabel: string;
    addPayment: string;
  };
  bookingLabels: {
    paymentAmount: string;
    paymentType: string;
    paymentNote: string;
    paymentNotePlaceholder: string;
    selectFile: string;
    noFileSelected: string;
    dpPayment: string;
    fullPayment: string;
    installment: string;
    submitPayment: string;
    uploading: string;
  };
  cancelLabel: string;
  onCancel: () => void;
}

export function AddPaymentForm({
  onSubmit,
  isSubmitting,
  bookingLabels,
  cancelLabel,
  onCancel,
}: AddPaymentFormProps) {
  const [amount, setAmount] = useState("");
  const [paymentType, setPaymentType] = useState("INSTALLMENT");
  const [note, setNote] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ amount, paymentType, note, receiptFile });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label={bookingLabels.paymentAmount}
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        placeholder="0"
      />

      <Select
        label={bookingLabels.paymentType}
        value={paymentType}
        onChange={(e) => setPaymentType(e.target.value)}
        options={[
          { value: "DOWN_PAYMENT", label: bookingLabels.dpPayment },
          { value: "INSTALLMENT", label: bookingLabels.installment },
          { value: "FULL_PAYMENT", label: bookingLabels.fullPayment },
        ]}
      />

      <Input
        label={bookingLabels.paymentNote}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={bookingLabels.paymentNotePlaceholder}
      />

      {/* File upload */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {bookingLabels.selectFile}
        </label>
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-gray-300 p-3 transition-colors hover:border-blue-400 hover:bg-blue-50/50">
          <IconUpload size={20} className="text-gray-400" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-gray-600">
              {receiptFile ? receiptFile.name : bookingLabels.noFileSelected}
            </p>
            {receiptFile && (
              <p className="text-xs text-gray-400">
                {(receiptFile.size / 1024).toFixed(0)} KB
              </p>
            )}
          </div>
          <input
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" type="button" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {isSubmitting ? bookingLabels.uploading : bookingLabels.submitPayment}
        </Button>
      </div>
    </form>
  );
}
