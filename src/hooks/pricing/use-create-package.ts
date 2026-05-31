import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPackage } from "@/services/pricing";
import type { CreatePackagePayload } from "@/services/pricing";
import { pricingKeys } from "@/constants/query-key";

export const useCreatePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<CreatePackagePayload, "type">) =>
      createPackage(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pricingKeys.all });
    },
  });
};
