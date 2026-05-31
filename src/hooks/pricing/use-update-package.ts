import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePackage } from "@/services/pricing";
import type { UpdatePackagePayload } from "@/services/pricing";
import { pricingKeys } from "@/constants/query-key";

export const useUpdatePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdatePackagePayload;
    }) => updatePackage(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pricingKeys.all });
    },
  });
};
