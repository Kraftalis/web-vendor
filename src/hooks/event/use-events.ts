import { useQuery } from "@tanstack/react-query";
import { getEvents } from "@/services/event";
import { eventKeys } from "@/constants/query-key";

export function useEvents() {
  return useQuery({
    queryKey: eventKeys.all,
    queryFn: getEvents,
  });
}
