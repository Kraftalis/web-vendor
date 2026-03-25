import { NextRequest } from "next/server";
import {
  successResponse,
  createdResponse,
  validationError,
  internalError,
  requireBusinessProfile,
} from "@/lib/api";
import { findEventCategories, createEventCategory } from "@/repositories/event";

/**
 * GET /api/event-categories
 * List all active event categories for the current vendor.
 */
export async function GET() {
  const { businessProfileId, error } = await requireBusinessProfile();
  if (error) return error;

  try {
    const categories = await findEventCategories(businessProfileId);
    return successResponse(categories);
  } catch (err) {
    console.error("[API] GET /api/event-categories error:", err);
    return internalError();
  }
}

/**
 * POST /api/event-categories
 * Create a new event category.
 */
export async function POST(request: NextRequest) {
  const { businessProfileId, error } = await requireBusinessProfile();
  if (error) return error;

  try {
    const body = await request.json();
    const name = (body.name as string)?.trim();
    if (!name) return validationError("Name is required.");

    const description = (body.description as string)?.trim() || null;

    const category = await createEventCategory({
      businessProfileId,
      name,
      description,
    });
    return createdResponse(category);
  } catch (err) {
    console.error("[API] POST /api/event-categories error:", err);
    return internalError();
  }
}
