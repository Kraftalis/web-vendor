import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createEventCategory,
  updateEventCategory,
  deleteEventCategory,
} from "@/services/event-category";
import type {
  CreateEventCategoryPayload,
  UpdateEventCategoryPayload,
} from "@/services/event-category/types";
import { eventCategoryKeys } from "./keys";

export function useCreateEventCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEventCategoryPayload) =>
      createEventCategory(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: eventCategoryKeys.all });
    },
  });
}

export function useUpdateEventCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateEventCategoryPayload;
    }) => updateEventCategory(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: eventCategoryKeys.all });
    },
  });
}

export function useDeleteEventCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEventCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: eventCategoryKeys.all });
    },
  });
}
