import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBookingLink } from "@/services/booking";
import { bookingKeys } from "./keys";
import { useToast } from "@/components/ui/toast";

export function useCreateBookingLink() {
  const qc = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: createBookingLink,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookingKeys.links });
      addToast("Sukses membuat booking link!", "success");
    },
    onError: (error: Error) => {
      console.error("[Mutation Error] Create Booking Link:", error);
      addToast(error.message || "Gagal membuat booking link", "error", 6000);
    },
  });
}
