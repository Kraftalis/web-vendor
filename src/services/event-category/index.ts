import api from "@/services/api-client";
import type { ApiResponse } from "@/lib/api/types";
import type { EventCategory } from "./types";

export type { EventCategory };

/**
 * Fetch all event categories for the current vendor.
 */
export async function getEventCategories(): Promise<EventCategory[]> {
  const { data } =
    await api.get<ApiResponse<EventCategory[]>>("/event-categories");
  return data.data!;
}
