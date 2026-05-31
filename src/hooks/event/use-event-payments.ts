"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api-client";
import type { ApiResponse } from "@/lib/api/types";
import { eventKeys } from "@/constants/query-key";

// ─── Add payment (vendor side) ──────────────────────────────

interface AddPaymentPayload {
  amount: number;
  paymentType: "DOWN_PAYMENT" | "INSTALLMENT" | "FULL_PAYMENT" | "REFUND";
  note?: string | null;
  receiptUrl?: string | null;
  receiptName?: string | null;
}

export function useAddPayment(eventId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AddPaymentPayload) => {
      const { data } = await api.post<ApiResponse<unknown>>(
        `/events/${eventId}/payments`,
        payload,
      );
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
      qc.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}

// ─── Verify / reject payment (vendor side) ──────────────────

export function useVerifyPayment(eventId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      paymentId,
      action,
    }: {
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
      qc.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
      qc.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}
