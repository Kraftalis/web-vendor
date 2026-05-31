import { useQuery } from "@tanstack/react-query";
import { getPricing } from "@/services/pricing";
import type { PricingQueryParams } from "@/services/pricing";
import { pricingKeys } from "@/constants/query-key";

export const usePricing = (params?: PricingQueryParams) => {
  return useQuery({
    queryKey: pricingKeys.list(params),
    queryFn: () => getPricing(params),
  });
};
