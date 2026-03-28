import { NextRequest } from "next/server";
import {
  successResponse,
  notFoundError,
  forbiddenError,
  internalError,
  requireBusinessProfile,
} from "@/lib/api";
import {
  findEventById,
  findBriefById,
  deleteBrief,
} from "@/repositories/event";

interface RouteParams {
  params: Promise<{ id: string; briefId: string }>;
}

/**
 * DELETE /api/events/[id]/briefs/[briefId]
 * Delete a brief from an event.
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { businessProfileId, error } = await requireBusinessProfile();
  if (error) return error;

  try {
    const { id, briefId } = await params;
    const event = await findEventById(id);

    if (!event) return notFoundError("Event not found.");
    if (event.businessProfileId !== businessProfileId) return forbiddenError();

    const brief = await findBriefById(briefId);
    if (!brief || brief.eventId !== id)
      return notFoundError("Brief not found.");

    await deleteBrief(briefId);
    return successResponse({ deleted: true });
  } catch (err) {
    console.error("[API] DELETE /api/events/[id]/briefs/[briefId] error:", err);
    return internalError();
  }
}
