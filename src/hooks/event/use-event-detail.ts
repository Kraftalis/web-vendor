import { useQuery } from "@tanstack/react-query";
import { getEventById } from "@/services/event";
import { eventKeys } from "@/constants/query-key";

export function useEventDetail(id: string) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => getEventById(id),
    enabled: !!id,
  });
}
