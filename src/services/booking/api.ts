import api from "@/services/api-client";
import type { ApiResponse } from "@/lib/api/types";
import type {
  BookingLinkItem,
  CreateBookingLinkPayload,
  CreateBookingLinkResponse,
  UpdateBookingLinkPayload,
} from "./types";

/**
 * Fetch all booking links for the current vendor.
 */
export async function getBookingLinks(): Promise<BookingLinkItem[]> {
  const { data } =
    await api.get<ApiResponse<BookingLinkItem[]>>("/booking/links");
  return data.data!;
}

/**
 * Create a new booking link with snapshot data.
 */
export async function createBookingLink(
  payload: CreateBookingLinkPayload,
): Promise<CreateBookingLinkResponse> {
  const { data } = await api.post<ApiResponse<CreateBookingLinkResponse>>(
    "/booking/links",
    payload,
  );
  return data.data!;
}

/**
 * Update a booking link (vendor side).
 */
export async function updateBookingLink(
  id: string,
  payload: UpdateBookingLinkPayload,
): Promise<BookingLinkItem> {
  const { data } = await api.patch<ApiResponse<BookingLinkItem>>(
    `/booking/links/${id}`,
    payload,
  );
  return data.data!;
}

/**
 * Delete a booking link (vendor side).
 */
export async function deleteBookingLink(id: string): Promise<void> {
  await api.delete(`/booking/links/${id}`);
}
