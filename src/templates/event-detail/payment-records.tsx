"use client";

import { Card, CardHeader, CardBody, Badge, Button } from "@/components/ui";
import { IconDollar, IconImage, IconCheck } from "@/components/icons";
import type { PaymentSerialized } from "../event/types";
import { formatCurrency } from "../event/types";

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
  formatDate: (dateStr: string) => string;
}

export const PaymentRecords = ({
  payments,
  paymentTypeMap,
  onVerify,
  onReject,
  onViewReceipt,
  formatDate,
}: PaymentRecordsProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            Catatan Pembayaran
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
              Belum ada pembayaran
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Tidak ada pembayaran yang tercatat untuk acara ini
            </p>
          </div>
        ) : (
          <div className="-mx-1 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="px-3 py-2 font-medium">Jenis</th>
                  <th className="px-3 py-2 font-medium">Jumlah</th>
                  <th className="px-3 py-2 font-medium">Tanggal</th>
                  <th className="px-3 py-2 font-medium">Tanda Terima</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Aksi</th>
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
};

// ─── Support: single payment row (unexported) ───────────────

const PaymentRow = ({
  payment,
  paymentTypeMap,
  onVerify,
  onReject,
  onViewReceipt,
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
  formatDate: (dateStr: string) => string;
}) => {
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
      <td className="px-3 py-2.5 font-medium">
        {payment.paymentType === "REFUND" ? (
          <span className="text-red-600">
            -{formatCurrency(payment.amount)}
          </span>
        ) : (
          <span className="text-gray-900">
            {formatCurrency(payment.amount)}
          </span>
        )}
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
            Lihat Tanda Terima
          </button>
        ) : (
          <span className="text-xs text-gray-400">Tidak ada tanda terima</span>
        )}
      </td>
      <td className="px-3 py-2.5">
        <Badge variant={payment.isVerified ? "success" : "warning"}>
          {payment.isVerified ? "Terverifikasi" : "Menunggu"}
        </Badge>
      </td>
      <td className="px-3 py-2.5">
        {!payment.isVerified && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onVerify(payment.id)}
              className="rounded px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50"
            >
              Verifikasi
            </button>
            <button
              onClick={() => onReject(payment.id)}
              className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              Tolak
            </button>
          </div>
        )}
        {payment.isVerified && (
          <IconCheck size={14} className="text-green-500" />
        )}
      </td>
    </tr>
  );
};
