import { useQuery } from "@tanstack/react-query";
import { getEventCategories } from "@/services/event-category";
import { eventCategoryKeys } from "./keys";

export function useEventCategories() {
  return useQuery({
    queryKey: eventCategoryKeys.list,
    queryFn: getEventCategories,
    staleTime: 5 * 60 * 1000,
  });
}
