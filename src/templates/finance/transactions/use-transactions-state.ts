"use client";

import { useState, useMemo } from "react";
import {
  useAccounts,
  useTransactions,
  useCreateAccount,
  useUpdateAccount,
  useDeleteAccount,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
} from "@/hooks/finance";
import { useConfirmDelete } from "@/hooks/use-confirm-delete";
import type {
  FinanceAccount,
  FinanceTransaction,
  TransactionType,
  TransactionQueryParams,
  CreateTransactionPayload,
} from "@/services/finance";

export const useTransactionsState = () => {
  // ─── Filters ──────────────────────────────────────────────
  const [filterType, setFilterType] = useState<TransactionType | "">("");
  const [filterAccountId, setFilterAccountId] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const params = useMemo<TransactionQueryParams>(() => {
    const p: TransactionQueryParams = { page, limit: 20 };
    if (filterType) p.type = filterType;
    if (filterAccountId) p.accountId = filterAccountId;
    if (filterStartDate) p.startDate = filterStartDate;
    if (filterEndDate) p.endDate = filterEndDate;
    return p;
  }, [page, filterType, filterAccountId, filterStartDate, filterEndDate]);

  // ─── Queries ──────────────────────────────────────────────
  const accountsQuery = useAccounts();
  const txQuery = useTransactions(params);
  const accounts: FinanceAccount[] = useMemo(
    () => accountsQuery.data ?? [],
    [accountsQuery.data],
  );
  const transactions: FinanceTransaction[] = txQuery.data?.data ?? [];
  const total = txQuery.data?.meta?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  const accountOptions = useMemo(
    () => accounts.map((a) => ({ value: a.id, label: a.name })),
    [accounts],
  );

  // ─── Account mutations ────────────────────────────────────
  const createAcctMut = useCreateAccount();
  const updateAcctMut = useUpdateAccount();
  const deleteAcctMut = useDeleteAccount();
  const acctDelete = useConfirmDelete((id) => deleteAcctMut.mutate(id));

  // ─── Transaction mutations ────────────────────────────────
  const createTxMut = useCreateTransaction();
  const updateTxMut = useUpdateTransaction();
  const deleteTxMut = useDeleteTransaction();
  const txDelete = useConfirmDelete((id) => deleteTxMut.mutate(id));

  // ─── Account modal ────────────────────────────────────────
  const [acctModalOpen, setAcctModalOpen] = useState(false);
  const [editingAcct, setEditingAcct] = useState<FinanceAccount | null>(null);

  const openAddAcct = () => {
    setEditingAcct(null);
    setAcctModalOpen(true);
  };
  const openEditAcct = (a: FinanceAccount) => {
    setEditingAcct(a);
    setAcctModalOpen(true);
  };
  const closeAcctModal = () => {
    setAcctModalOpen(false);
    setEditingAcct(null);
  };

  const handleSaveAccount = (fd: FormData) => {
    const name = (fd.get("name") as string).trim();
    const description = (fd.get("description") as string).trim() || null;
    if (!name) return;
    if (editingAcct) {
      updateAcctMut.mutate(
        { id: editingAcct.id, payload: { name, description } },
        { onSuccess: closeAcctModal },
      );
    } else {
      createAcctMut.mutate(
        { name, description },
        { onSuccess: closeAcctModal },
      );
    }
  };

  // ─── Transaction modal ────────────────────────────────────
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<FinanceTransaction | null>(null);

  const openAddTx = () => {
    setEditingTx(null);
    setTxModalOpen(true);
  };
  const openEditTx = (tx: FinanceTransaction) => {
    setEditingTx(tx);
    setTxModalOpen(true);
  };
  const closeTxModal = () => {
    setTxModalOpen(false);
    setEditingTx(null);
  };

  const handleSaveTx = (fd: FormData) => {
    const accountId = fd.get("accountId") as string;
    const type = fd.get("type") as TransactionType;
    const category = (fd.get("category") as string).trim();
    const description = (fd.get("description") as string).trim() || null;
    const amount = parseFloat(fd.get("amount") as string);
    const transactionDate = fd.get("transactionDate") as string;
    const notes = (fd.get("notes") as string).trim() || null;

    if (!accountId || !type || !category || !amount || !transactionDate) return;

    const payload: CreateTransactionPayload = {
      accountId,
      type,
      category,
      description,
      amount,
      transactionDate,
      notes,
    };

    if (editingTx) {
      updateTxMut.mutate(
        { id: editingTx.id, payload },
        { onSuccess: closeTxModal },
      );
    } else {
      createTxMut.mutate(payload, { onSuccess: closeTxModal });
    }
  };

  return {
    // Filters
    filterType,
    setFilterType,
    filterAccountId,
    setFilterAccountId,
    filterStartDate,
    setFilterStartDate,
    filterEndDate,
    setFilterEndDate,
    page,
    setPage,
    showFilters,
    setShowFilters,
    // Data
    accounts,
    transactions,
    total,
    totalPages,
    accountOptions,
    isLoadingAccounts: accountsQuery.isLoading,
    isLoadingTx: txQuery.isLoading,
    // Account modal
    acctModalOpen,
    editingAcct,
    openAddAcct,
    openEditAcct,
    closeAcctModal,
    handleSaveAccount,
    isSavingAcct: createAcctMut.isPending || updateAcctMut.isPending,
    acctDelete,
    // Tx modal
    txModalOpen,
    editingTx,
    openAddTx,
    openEditTx,
    closeTxModal,
    handleSaveTx,
    isSavingTx: createTxMut.isPending || updateTxMut.isPending,
    txDelete,
  };
};
