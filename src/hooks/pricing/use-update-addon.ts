import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAddOn } from "@/services/pricing";
import type { UpdateAddOnPayload } from "@/services/pricing";
import { pricingKeys } from "@/constants/query-key";

export const useUpdateAddOn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateAddOnPayload;
    }) => updateAddOn(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pricingKeys.all });
    },
  });
};
