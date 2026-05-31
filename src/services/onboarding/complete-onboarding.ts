import api from "@/services/api-client";
import type { ApiResponse } from "@/lib/api/types";

export const completeOnboarding = async (): Promise<boolean> => {
  const { data } = await api.post<ApiResponse<{ complete: boolean }>>(
    "/onboarding/complete",
  );
  return data.data?.complete ?? false;
};
