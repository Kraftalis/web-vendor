"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api-client";
import type { ApiResponse } from "@/lib/api/types";
import { eventKeys } from "@/constants/query-key";

/**
 * Verify/reject a payment from any context (e.g. the event list page).
 * Unlike useVerifyPayment, this doesn't require eventId at hook creation.
 */
export function useQuickVerifyPayment() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      eventId,
      paymentId,
      action,
    }: {
      eventId: string;
      paymentId: string;
      action: "verify" | "reject";
    }) => {
      const { data } = await api.patch<ApiResponse<unknown>>(
        `/events/${eventId}/payments/${paymentId}`,
        { action },
      );
      return data.data;
    },
    onSuccess: () => {
      // Refresh both the events list and any open event detail
      qc.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}
