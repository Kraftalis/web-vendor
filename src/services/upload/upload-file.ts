import api from "@/services/api-client";
import type { ApiResponse } from "@/lib/api/types";

export const uploadFile = async (
  file: File,
  folder: string,
): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  const { data } = await api.post<ApiResponse<{ publicUrl: string }>>(
    "/upload",
    formData,
    { headers: { "Content-Type": undefined } },
  );
  return data.data!.publicUrl;
};
