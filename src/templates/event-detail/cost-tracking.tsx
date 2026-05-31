import { useState } from "react";
import { format } from "date-fns";
import {
  IconPlus,
  IconReceipt,
  IconCalendar,
  IconCash,
  IconFileText,
  IconTag,
  IconPhoto,
  IconTrash,
} from "@tabler/icons-react";
import Button from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency } from "../event/types";
import type { FinanceTransactionSerialized } from "../event/types";
import { UploadButton } from "@/components/form/upload-button";
import Input from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CostTrackingProps {
  transactions: FinanceTransactionSerialized[];
  eventId: string;
  onAddCost: () => void;
  onEditCost?: (transaction: FinanceTransactionSerialized) => void;
  onDeleteCost?: (id: string) => void;
  onViewReceipt: (receipt: { name: string; url: string; type: string }) => void;
}

export const CostTracking = ({
  transactions,
  onAddCost,
  onDeleteCost,
  onViewReceipt,
}: CostTrackingProps) => {
  const costs = transactions.filter((t) => t.type === "EXPENSE");
  const totalCost = costs.reduce((sum, t) => sum + parseFloat(t.amount), 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-5 pb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
            <IconCash size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">
              Catatan Biaya
            </h3>
            <p className="text-xs text-slate-500">
              Total:{" "}
              {formatCurrency(
                totalCost.toString(),
                costs[0]?.currency || "IDR",
              )}
            </p>
          </div>
        </div>
        <Button onClick={onAddCost} size="sm">
          <IconPlus size={16} />
          Tambah Biaya
        </Button>
      </div>

      <div className="p-5">
        {costs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-100 bg-slate-50 py-12 text-center">
            <div className="mb-3 rounded-full bg-white p-3 shadow-sm ring-1 ring-slate-100">
              <IconTag size={24} className="text-slate-400" />
            </div>
            <h4 className="font-medium text-slate-700">
              Tidak ada biaya
            </h4>
            <p className="mt-1 text-sm text-slate-500 max-w-sm">
              Belum ada biaya yang dicatat untuk acara ini
            </p>
            <Button
              onClick={onAddCost}
              variant="outline"
              size="sm"
              className="mt-4"
            >
              <IconPlus size={14} className="mr-1" />
              Tambah Biaya
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">Label</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Receipt</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {costs.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="group border-b border-slate-50 transition-colors hover:bg-slate-50/50"
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-800">
                        {transaction.description || "Event Cost"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-bold text-slate-900">
                        {formatCurrency(
                          transaction.amount,
                          transaction.currency,
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <IconCalendar size={14} />
                        {format(
                          new Date(transaction.transactionDate),
                          "d MMM yyyy",
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {transaction.receiptUrl && (
                        <button
                          onClick={() =>
                            onViewReceipt({
                              name: transaction.receiptName || "Receipt",
                              url: transaction.receiptUrl!,
                              type: transaction.receiptUrl?.endsWith(".pdf")
                                ? "application/pdf"
                                : "image/jpeg",
                            })
                          }
                          className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          <IconReceipt size={14} />
                          Receipt
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {onDeleteCost && (
                        <button
                          onClick={() => {
                            if (window.confirm("Hapus biaya ini?")) {
                              onDeleteCost(transaction.id);
                            }
                          }}
                          className="opacity-0 transition-opacity group-hover:opacity-100 text-slate-400 hover:text-red-500"
                          title="Delete cost"
                        >
                          <IconTrash size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

