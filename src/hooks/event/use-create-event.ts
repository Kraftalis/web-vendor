import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEvent } from "@/services/event";
import type { CreateEventPayload } from "@/services/event";
import { eventKeys } from "@/constants/query-key";

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEventPayload) => createEvent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}
