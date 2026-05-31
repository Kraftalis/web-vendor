import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateEvent } from "@/services/event";
import type { UpdateEventPayload } from "@/services/event";
import { eventKeys } from "@/constants/query-key";

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateEventPayload;
    }) => updateEvent(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(id) });
    },
  });
}
