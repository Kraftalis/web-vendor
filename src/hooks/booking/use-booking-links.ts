import { useQuery } from "@tanstack/react-query";
import { getBookingLinks } from "@/services/booking";
import { bookingKeys } from "@/constants/query-key";

export function useBookingLinks() {
  return useQuery({
    queryKey: bookingKeys.links,
    queryFn: getBookingLinks,
  });
}
