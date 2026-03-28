import { NextRequest } from "next/server";
import {
  successResponse,
  notFoundError,
  validationError,
  internalError,
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
 * Update an event category (global master data).
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const existing = await findEventCategoryById(id);
    if (!existing) return notFoundError("Event category not found.");

    const body = await request.json();
    const name = (body.name as string)?.trim();
    if (!name) return validationError("Name is required.");

    const description = (body.description as string)?.trim() || null;
    const color = (body.color as string)?.trim() || "#3B82F6";

    const updated = await updateEventCategory(id, { name, description, color });
    return successResponse(updated);
  } catch (err) {
    console.error("[API] PUT /api/event-categories/[id] error:", err);
    return internalError();
  }
}

/**
 * DELETE /api/event-categories/[id]
 * Delete an event category (global master data).
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const existing = await findEventCategoryById(id);
    if (!existing) return notFoundError("Event category not found.");

    await deleteEventCategory(id);
    return successResponse({ deleted: true });
  } catch (err) {
    console.error("[API] DELETE /api/event-categories/[id] error:", err);
    return internalError();
  }
}
