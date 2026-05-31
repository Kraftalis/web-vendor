import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAddOn } from "@/services/pricing";
import type { CreateAddOnPayload } from "@/services/pricing";
import { pricingKeys } from "@/constants/query-key";

export const useCreateAddOn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<CreateAddOnPayload, "type">) =>
      createAddOn(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pricingKeys.all });
    },
  });
};
