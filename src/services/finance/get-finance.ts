import api from "@/services/api-client";
import type { ApiResponse } from "@/lib/api/types";
import type {
  FinanceAccount,
  FinanceTransaction,
  TransactionQueryParams,
  ReportQueryParams,
  ReportData,
} from "./types";

/**
 * Fetch all finance accounts for the current vendor.
 */
export async function getAccounts(): Promise<FinanceAccount[]> {
  const { data } =
    await api.get<ApiResponse<FinanceAccount[]>>("/finance/accounts");
  return data.data!;
}

/**
 * Fetch transactions with optional filtering, pagination, sorting.
 */
export async function getTransactions(
  params?: TransactionQueryParams,
): Promise<{
  data: FinanceTransaction[];
  meta: ApiResponse["meta"];
}> {
  const { data } = await api.get<ApiResponse<FinanceTransaction[]>>(
    "/finance/transactions",
    { params },
  );
  return { data: data.data!, meta: data.meta };
}

/**
 * Fetch finance report (summary, monthly, category breakdowns).
 */
export async function getReport(
  params: ReportQueryParams,
): Promise<ReportData> {
  const { data } = await api.get<ApiResponse<ReportData>>("/finance/reports", {
    params,
  });
  return data.data!;
}
