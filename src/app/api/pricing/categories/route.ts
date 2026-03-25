import { NextRequest } from "next/server";
import {
  successResponse,
  createdResponse,
  validationError,
  internalError,
  requireAuth,
  validate,
} from "@/lib/api";
import { findAllCategories, createCategory } from "@/repositories/pricing";
import { createCategorySchema } from "@/lib/validations/pricing";

/**
 * GET /api/pricing/categories
 * List all active categories.
 * Requires auth — returns all categories (master data).
 */
export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const categories = await findAllCategories();
    return successResponse(categories);
  } catch (err) {
    console.error("[API] GET /api/pricing/categories error:", err);
    return internalError();
  }
}

/**
 * POST /api/pricing/categories
 * Create a new category (admin only in the future, but for now any vendor).
 */
export async function POST(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const result = validate(createCategorySchema, body);
    if (result.error)
      return validationError("Validation failed.", result.error);

    const category = await createCategory(result.data);
    return createdResponse(category);
  } catch (err) {
    console.error("[API] POST /api/pricing/categories error:", err);
    return internalError();
  }
}
