import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/services/pricing";
import { pricingKeys } from "@/constants/query-key";

export const useCategories = () => {
  return useQuery({
    queryKey: pricingKeys.categories,
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000, // categories are master data, cache 5 min
  });
};
