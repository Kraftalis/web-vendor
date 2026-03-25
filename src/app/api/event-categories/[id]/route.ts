import { NextRequest } from "next/server";
import {
  successResponse,
  notFoundError,
  forbiddenError,
  internalError,
  requireBusinessProfile,
} from "@/lib/api";
import {
  findEventCategoryById,
  updateEventCategory,
  deleteEventCategory,
} from "@/repositories/event";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PUT /api/event-categories/[id]
 * Update an event category.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { businessProfileId, error } = await requireBusinessProfile();
  if (error) return error;

  try {
    const { id } = await params;
    const existing = await findEventCategoryById(id);
    if (!existing) return notFoundError("Event category not found.");
    if (existing.businessProfileId !== businessProfileId)
      return forbiddenError();

    const body = await request.json();
    const name = (body.name as string)?.trim();
    if (!name) return notFoundError("Name is required.");

    const description = (body.description as string)?.trim() || null;

    const updated = await updateEventCategory(id, { name, description });
    return successResponse(updated);
  } catch (err) {
    console.error("[API] PUT /api/event-categories/[id] error:", err);
    return internalError();
  }
}

/**
 * DELETE /api/event-categories/[id]
 * Delete an event category.
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { businessProfileId, error } = await requireBusinessProfile();
  if (error) return error;

  try {
    const { id } = await params;
    const existing = await findEventCategoryById(id);
    if (!existing) return notFoundError("Event category not found.");
    if (existing.businessProfileId !== businessProfileId)
      return forbiddenError();

    await deleteEventCategory(id);
    return successResponse({ deleted: true });
  } catch (err) {
    console.error("[API] DELETE /api/event-categories/[id] error:", err);
    return internalError();
  }
}
