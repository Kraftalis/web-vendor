import api from "@/services/api-client";
import type { ApiResponse } from "@/lib/api/types";

// ─── Types ──────────────────────────────────────────────────

export interface BriefAttachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface BriefItem {
  id: string;
  eventId: string;
  title: string;
  content: string | null;
  attachments: BriefAttachment[];
  authorType: "VENDOR" | "CLIENT";
  authorName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBriefPayload {
  title: string;
  content?: string | null;
  attachments?: BriefAttachment[];
}

// ─── API calls ──────────────────────────────────────────────

export async function fetchBriefs(eventId: string): Promise<BriefItem[]> {
  const { data } = await api.get<ApiResponse<BriefItem[]>>(
    `/events/${eventId}/briefs`,
  );
  return data.data ?? [];
}

export async function createBriefApi(
  eventId: string,
  payload: CreateBriefPayload,
): Promise<BriefItem> {
  const { data } = await api.post<ApiResponse<BriefItem>>(
    `/events/${eventId}/briefs`,
    payload,
  );
  return data.data!;
}

export async function deleteBriefApi(
  eventId: string,
  briefId: string,
): Promise<void> {
  await api.delete(`/events/${eventId}/briefs/${briefId}`);
}
