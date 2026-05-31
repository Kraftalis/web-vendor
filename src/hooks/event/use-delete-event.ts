import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteEvent } from "@/services/event";
import { eventKeys } from "@/constants/query-key";

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}
