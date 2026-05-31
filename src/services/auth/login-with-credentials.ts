import api from "@/services/api-client";
import type { ApiResponse } from "@/lib/api/types";
import type { LoginCredentials } from "./types";

export const loginWithCredentials = async (
  credentials: LoginCredentials,
): Promise<void> => {
  await api.post<ApiResponse<void>>("/auth/login", credentials);
};
