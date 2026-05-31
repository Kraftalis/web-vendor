import { useQuery } from "@tanstack/react-query";
import { getBookingLink } from "@/services/event";
import { eventKeys } from "@/constants/query-key";

export function useBookingLink(token: string) {
  return useQuery({
    queryKey: eventKeys.bookingLink(token),
    queryFn: () => getBookingLink(token),
    enabled: !!token,
  });
}
