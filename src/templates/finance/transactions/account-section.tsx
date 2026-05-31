"use client";

import { Badge } from "@/components/ui";
import type { FinanceAccount } from "@/services/finance";

interface Props {
  accounts: FinanceAccount[];
  isLoading: boolean;
  onAdd: () => void;
  onEdit: (a: FinanceAccount) => void;
  onDelete: (id: string) => void;
}

export const AccountSection = ({
  accounts,
  isLoading,
  onAdd,
  onEdit,
  onDelete,
}: Props) => {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          Rekening Keuangan
        </h3>
        <button
          onClick={onAdd}
          className="text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          + Tambah Rekening
        </button>
      </div>
      {accounts.length === 0 && !isLoading && (
        <p className="mt-2 text-sm text-gray-400">
          Belum ada rekening. Buat rekening baru untuk memulai
        </p>
      )}
      {accounts.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {accounts.map((acct) => (
            <button
              key={acct.id}
              onClick={() => onEdit(acct)}
              className="group relative rounded-lg border border-gray-200 bg-white px-4 py-2 text-left transition-colors hover:border-blue-300"
            >
              <span className="text-sm font-medium text-gray-900">
                {acct.name}
              </span>
              {acct.isPrimary && (
                <Badge variant="info" className="ml-1.5 text-[10px]">
                  Primary
                </Badge>
              )}
              {acct.description && (
                <span className="ml-2 text-xs text-gray-400">
                  {acct.description}
                </span>
              )}
              {!acct.isPrimary && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(acct.id);
                  }}
                  className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 items-center justify-center rounded-full bg-red-100 text-xs text-red-600 group-hover:flex"
                  title="Hapus Rekening"
                >
                  ×
                </button>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
