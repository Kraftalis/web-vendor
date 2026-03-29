import { successResponse, internalError } from "@/lib/api";
import { findEventCategories } from "@/repositories/event";

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
