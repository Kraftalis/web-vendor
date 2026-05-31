import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePackage } from "@/services/pricing";
import { pricingKeys } from "@/constants/query-key";

export const useDeletePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePackage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pricingKeys.all });
    },
  });
};
