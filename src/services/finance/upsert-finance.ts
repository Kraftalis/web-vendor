import api from "@/services/api-client";
import type { ApiResponse } from "@/lib/api/types";
import type {
  FinanceAccount,
  FinanceTransaction,
  CreateAccountPayload,
  UpdateAccountPayload,
  CreateTransactionPayload,
  UpdateTransactionPayload,
} from "./types";

// ─── Account mutations ──────────────────────────────────────

export async function createAccount(
  payload: CreateAccountPayload,
): Promise<FinanceAccount> {
  const { data } = await api.post<ApiResponse<FinanceAccount>>(
    "/finance/accounts",
    payload,
  );
  return data.data!;
}

export async function updateAccount(
  id: string,
  payload: UpdateAccountPayload,
): Promise<FinanceAccount> {
  const { data } = await api.patch<ApiResponse<FinanceAccount>>(
    "/finance/accounts",
    { id, ...payload },
  );
  return data.data!;
}

export async function deleteAccount(id: string): Promise<void> {
  await api.patch("/finance/accounts", { deleteId: id });
}

// ─── Transaction mutations ──────────────────────────────────

export async function createTransaction(
  payload: CreateTransactionPayload,
): Promise<FinanceTransaction> {
  const { data } = await api.post<ApiResponse<FinanceTransaction>>(
    "/finance/transactions",
    payload,
  );
  return data.data!;
}

export async function updateTransaction(
  id: string,
  payload: UpdateTransactionPayload,
): Promise<FinanceTransaction> {
  const { data } = await api.put<ApiResponse<FinanceTransaction>>(
    `/finance/transactions/${id}`,
    payload,
  );
  return data.data!;
}

export async function deleteTransaction(id: string): Promise<void> {
  await api.delete(`/finance/transactions/${id}`);
}
