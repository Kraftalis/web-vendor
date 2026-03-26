import { NextRequest } from "next/server";
import {
  successResponse,
  createdResponse,
  validationError,
  internalError,
} from "@/lib/api";
import { findEventCategories, createEventCategory } from "@/repositories/event";

/**
 * GET /api/event-categories
 * List all active event categories (global master data).
 */
export async function GET() {
  try {
    const categories = await findEventCategories();
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
  try {
    const body = await request.json();
    const name = (body.name as string)?.trim();
    if (!name) return validationError("Name is required.");

    const description = (body.description as string)?.trim() || null;

    const category = await createEventCategory({
      name,
      description,
    });
    return createdResponse(category);
  } catch (err) {
    console.error("[API] POST /api/event-categories error:", err);
    return internalError();
  }
}
