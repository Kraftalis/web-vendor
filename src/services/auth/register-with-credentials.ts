import api from "@/services/api-client";
import type { ApiResponse } from "@/lib/api/types";
import type { RegisterPayload } from "./types";

export const registerWithCredentials = async (
  payload: RegisterPayload,
): Promise<void> => {
  await api.post<ApiResponse<void>>("/auth/register", payload);
};
