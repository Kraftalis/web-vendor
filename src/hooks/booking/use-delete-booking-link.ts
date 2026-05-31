import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBookingLink } from "@/services/booking";
import { bookingKeys } from "@/constants/query-key";

export function useDeleteBookingLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBookingLink(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookingKeys.links });
    },
  });
}
