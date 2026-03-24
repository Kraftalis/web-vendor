import { useQuery } from "@tanstack/react-query";
import { getAccounts } from "@/services/finance";
import { financeKeys } from "./keys";

export function useAccounts() {
  return useQuery({
    queryKey: financeKeys.accounts,
    queryFn: getAccounts,
  });
}
