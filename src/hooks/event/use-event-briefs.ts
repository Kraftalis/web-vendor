import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchBriefs,
  createBriefApi,
  deleteBriefApi,
} from "@/services/event/briefs";
import type { CreateBriefPayload } from "@/services/event/briefs";
import { eventKeys } from "./keys";

// ─── Query keys ─────────────────────────────────────────────

export const briefKeys = {
  list: (eventId: string) => [...eventKeys.detail(eventId), "briefs"] as const,
};

// ─── Hooks ──────────────────────────────────────────────────

export function useEventBriefs(eventId: string) {
  return useQuery({
    queryKey: briefKeys.list(eventId),
    queryFn: () => fetchBriefs(eventId),
    enabled: !!eventId,
  });
}

export function useCreateBrief(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBriefPayload) =>
      createBriefApi(eventId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: briefKeys.list(eventId) });
    },
  });
}

export function useDeleteBrief(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (briefId: string) => deleteBriefApi(eventId, briefId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: briefKeys.list(eventId) });
    },
  });
}
