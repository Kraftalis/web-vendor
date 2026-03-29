import { successResponse, internalError } from "@/lib/api";
import { findAllCategories } from "@/repositories/pricing";

/**
 * GET /api/pricing/categories
 * List all active pricing categories (global master data).
 */
export async function GET() {
  try {
    const categories = await findAllCategories();
    return successResponse(categories);
  } catch (err) {
    console.error("[API] GET /api/pricing/categories error:", err);
    return internalError();
  }
}
