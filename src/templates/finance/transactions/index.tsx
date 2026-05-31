"use client";

import { Button, Card, CardBody, Select, Input } from "@/components/ui";
import { Plus, Filter } from "lucide-react";
import type { TransactionType } from "@/services/finance";
import { useTransactionsState } from "./use-transactions-state";
import { AccountSection } from "./account-section";
import { TransactionList } from "./transaction-list";
import { AccountModal } from "./account-modal";
import { TransactionModal } from "./transaction-modal";

export const TransactionsTab = () => {
  const s = useTransactionsState();

  return (
    <div className="space-y-6">
      {/* Accounts strip */}
      <AccountSection
        accounts={s.accounts}
        isLoading={s.isLoadingAccounts}
        onAdd={s.openAddAcct}
        onEdit={s.openEditAcct}
        onDelete={s.acctDelete.handleDelete}
      />

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          size="md"
          onClick={s.openAddTx}
          disabled={s.accounts.length === 0}
        >
          <Plus size={16} />
          Tambah Transaksi
        </Button>
        <button
          onClick={() => s.setShowFilters((v) => !v)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <Filter size={14} />
          Filter
        </button>
      </div>

      {/* Filters row */}
      {s.showFilters && (
        <Card>
          <CardBody>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <Select
                label="Jenis Transaksi"
                options={[
                  { value: "", label: "Semua Jenis" },
                  { value: "INCOME", label: "Pendapatan" },
                  { value: "EXPENSE", label: "Pengeluaran" },
                ]}
                value={s.filterType}
                onChange={(e) => {
                  s.setFilterType(e.target.value as TransactionType | "");
                  s.setPage(1);
                }}
              />
              <Select
                label="Semua Rekening"
                options={[
                  { value: "", label: "Semua Rekening" },
                  ...s.accountOptions,
                ]}
                value={s.filterAccountId}
                onChange={(e) => {
                  s.setFilterAccountId(e.target.value);
                  s.setPage(1);
                }}
              />
              <Input
                type="date"
                label="Tanggal Mulai"
                value={s.filterStartDate}
                onChange={(e) => {
                  s.setFilterStartDate(e.target.value);
                  s.setPage(1);
                }}
              />
              <Input
                type="date"
                label="Tanggal Akhir"
                value={s.filterEndDate}
                onChange={(e) => {
                  s.setFilterEndDate(e.target.value);
                  s.setPage(1);
                }}
              />
            </div>
          </CardBody>
        </Card>
      )}

      {/* Transaction list */}
      <TransactionList
        transactions={s.transactions}
        isLoading={s.isLoadingTx}
        total={s.total}
        page={s.page}
        totalPages={s.totalPages}
        setPage={s.setPage}
        onEdit={s.openEditTx}
        onDelete={s.txDelete.handleDelete}
      />

      {/* Account Modal */}
      <AccountModal
        isOpen={s.acctModalOpen}
        editingAcct={s.editingAcct}
        onClose={s.closeAcctModal}
        onSave={s.handleSaveAccount}
        isSaving={s.isSavingAcct}
      />

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={s.txModalOpen}
        editingTx={s.editingTx}
        accounts={s.accounts}
        accountOptions={s.accountOptions}
        onClose={s.closeTxModal}
        onSave={s.handleSaveTx}
        isSaving={s.isSavingTx}
      />
    </div>
  );
};
