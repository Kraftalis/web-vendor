import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBookingLink } from "@/services/booking";
import { bookingKeys } from "./keys";

export function useDeleteBookingLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBookingLink(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookingKeys.links });
    },
  });
}
