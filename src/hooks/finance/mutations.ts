import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createAccount,
  updateAccount,
  deleteAccount,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/services/finance";
import type {
  CreateAccountPayload,
  UpdateAccountPayload,
  CreateTransactionPayload,
  UpdateTransactionPayload,
} from "@/services/finance";
import { financeKeys } from "./keys";

// ─── Account mutations ──────────────────────────────────────

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAccountPayload) => createAccount(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: financeKeys.accounts }),
  });
}

export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateAccountPayload;
    }) => updateAccount(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: financeKeys.accounts }),
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAccount(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: financeKeys.accounts }),
  });
}

// ─── Transaction mutations ──────────────────────────────────

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTransactionPayload) =>
      createTransaction(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: financeKeys.all });
    },
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateTransactionPayload;
    }) => updateTransaction(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: financeKeys.all });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: financeKeys.all });
    },
  });
}
