import { useQuery } from "@tanstack/react-query";
import { getReport } from "@/services/finance";
import type { ReportQueryParams } from "@/services/finance";
import { financeKeys } from "./keys";

export function useReport(params: ReportQueryParams | null) {
  return useQuery({
    queryKey: financeKeys.report(params ?? undefined),
    queryFn: () => getReport(params!),
    enabled: !!params,
  });
}
