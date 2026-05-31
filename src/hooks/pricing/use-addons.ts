import { useQuery } from "@tanstack/react-query";
import { getAddOns } from "@/services/pricing";
import type { AddOnQueryParams } from "@/services/pricing";
import { pricingKeys } from "@/constants/query-key";

export const useAddOns = (params?: AddOnQueryParams) => {
  return useQuery({
    queryKey: pricingKeys.addOns(params),
    queryFn: () => getAddOns(params),
  });
};
