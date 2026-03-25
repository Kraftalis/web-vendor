import api from "@/services/api-client";
import type { ApiResponse } from "@/lib/api/types";
import type {
  EventCategory,
  CreateEventCategoryPayload,
  UpdateEventCategoryPayload,
} from "./types";

export type { EventCategory, CreateEventCategoryPayload, UpdateEventCategoryPayload };

/**
 * Fetch all event categories for the current vendor.
 */
export async function getEventCategories(): Promise<EventCategory[]> {
  const { data } =
    await api.get<ApiResponse<EventCategory[]>>("/event-categories");
  return data.data!;
}

/**
 * Create a new event category.
 */
export async function createEventCategory(
  payload: CreateEventCategoryPayload,
): Promise<EventCategory> {
  const { data } = await api.post<ApiResponse<EventCategory>>(
    "/event-categories",
    payload,
  );
  return data.data!;
}

/**
 * Update an event category.
 */
export async function updateEventCategory(
  id: string,
  payload: UpdateEventCategoryPayload,
): Promise<EventCategory> {
  const { data } = await api.put<ApiResponse<EventCategory>>(
    `/event-categories/${id}`,
    payload,
  );
  return data.data!;
}

/**
 * Delete an event category.
 */
export async function deleteEventCategory(id: string): Promise<void> {
  await api.delete(`/event-categories/${id}`);
}
