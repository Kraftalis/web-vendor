import type {
  TransactionQueryParams,
  ReportQueryParams,
} from "@/services/finance";

/**
 * Shared query keys for finance-related queries.
 */
export const financeKeys = {
  all: ["finance"] as const,
  accounts: ["finance", "accounts"] as const,
  transactions: (params?: TransactionQueryParams) =>
    ["finance", "transactions", params] as const,
  transactionDetail: (id: string) => ["finance", "transaction", id] as const,
  report: (params?: ReportQueryParams) =>
    ["finance", "report", params] as const,
};
