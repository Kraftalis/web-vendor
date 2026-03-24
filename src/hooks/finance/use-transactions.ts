import { useQuery } from "@tanstack/react-query";
import { getTransactions } from "@/services/finance";
import type { TransactionQueryParams } from "@/services/finance";
import { financeKeys } from "./keys";

export function useTransactions(params?: TransactionQueryParams) {
  return useQuery({
    queryKey: financeKeys.transactions(params),
    queryFn: () => getTransactions(params),
  });
}
