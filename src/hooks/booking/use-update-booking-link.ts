import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBookingLink } from "@/services/booking";
import type { UpdateBookingLinkPayload } from "@/services/booking";
import { bookingKeys } from "./keys";

export function useUpdateBookingLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateBookingLinkPayload;
    }) => updateBookingLink(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookingKeys.links });
    },
  });
}
