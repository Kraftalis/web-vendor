"use client";

import { Card, CardBody, CardFooter, Button } from "@/components/ui";
import { formatCurrency } from "../event/types";

interface PaymentProgressProps {
  totalAmount: number;
  totalPaid: number;
  remaining: number;
  onAddPayment?: () => void;
}

export const PaymentProgress = ({
  totalAmount,
  totalPaid,
  remaining,
  onAddPayment,
}: PaymentProgressProps) => {
  const percentage =
    totalAmount > 0 ? Math.min((totalPaid / totalAmount) * 100, 100) : 0;

  return (
    <Card>
      <CardBody className="p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">
          Kemajuan Pembayaran
        </h3>

        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-gray-500">
              {formatCurrency(totalPaid.toString())} dari{" "}
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

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-green-50 p-2.5">
            <p className="text-xs text-green-600">Jumlah Dibayar</p>
            <p className="font-semibold text-green-700">
              {formatCurrency(totalPaid.toString())}
            </p>
          </div>
          <div className="rounded-lg bg-red-50 p-2.5">
            <p className="text-xs text-red-600">Sisa</p>
            <p className="font-semibold text-red-700">
              {formatCurrency(remaining.toString())}
            </p>
          </div>
        </div>
      </CardBody>

      {onAddPayment && (
        <CardFooter className="flex justify-end">
          <Button size="sm" onClick={onAddPayment}>
            Tambah Pembayaran
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
