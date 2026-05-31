"use client";

import { Button } from "@/components/ui";
import { Edit, Trash2 } from "lucide-react";
import type { FinanceTransaction } from "@/services/finance";
import { fmtCurrency, fmtDate } from "./utils";

interface Props {
  transactions: FinanceTransaction[];
  isLoading: boolean;
  total: number;
  page: number;
  totalPages: number;
  setPage: (v: number) => void;
  onEdit: (tx: FinanceTransaction) => void;
  onDelete: (id: string) => void;
}

export const TransactionList = ({
  transactions,
  isLoading,
  total,
  page,
  totalPages,
  setPage,
  onEdit,
  onDelete,
}: Props) => {
  if (isLoading) {
    return (
      <div className="py-12 text-center text-sm text-gray-400">
        Memuat transaksi...
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm font-medium text-gray-500">Belum ada transaksi</p>
        <p className="mt-1 text-xs text-gray-400">
          Buat rekening dan transaksi pertama Anda untuk mulai
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-4 py-3">Tanggal Transaksi</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Rekening</th>
              <th className="px-4 py-3 text-right">Jumlah</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map((tx) => {
              const isIncome = tx.type === "INCOME";
              return (
                <tr
                  key={tx.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                    {fmtDate(tx.transactionDate)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900">
                        {tx.category}
                      </span>
                      {tx.description && (
                        <span className="text-[11px] text-gray-400 line-clamp-1">
                          {tx.description}
                        </span>
                      )}
                      {tx.event && (
                        <span className="text-[10px] text-blue-500 font-medium">
                          #{tx.event.clientName}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                      {tx.account?.name}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <span
                      className={`font-bold ${
                        isIncome ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {isIncome ? "+" : "−"}
                      {fmtCurrency(tx.amount, tx.currency)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    {!tx.eventId ? (
                      <div className="flex justify-end gap-1.5 px-2">
                        <button
                          onClick={() => onEdit(tx)}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => onDelete(tx.id)}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-gray-300 uppercase tracking-tighter pr-4">
                        System
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4 pb-3">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            ‹
          </Button>
          <span className="text-sm text-gray-600">
            {page} / {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            ›
          </Button>
        </div>
      )}
    </div>
  );
};
