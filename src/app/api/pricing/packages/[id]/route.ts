import { NextRequest } from "next/server";
import {
  successResponse,
  validationError,
  notFoundError,
  forbiddenError,
  internalError,
  requireBusinessProfile,
  validate,
} from "@/lib/api";
import {
  findPackageById,
  updatePackage,
  deletePackage,
} from "@/repositories/pricing";
import { updatePackageSchema } from "@/lib/validations/pricing";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializePackage(pkg: any) {
  return {
    ...pkg,
    price: String(pkg.price),
    items: (pkg.items ?? []).map((item: Record<string, unknown>) => ({
      ...item,
      price: String(item.price),
    })),
    category: pkg.category ?? null,
    eventCategory: pkg.eventCategory ?? null,
    eventCategoryId: pkg.eventCategoryId ?? null,
    inclusions: pkg.inclusions ?? [],
  };
}

/**
 * GET /api/pricing/packages/[id]
 * Get a single package by ID.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { businessProfileId, error } = await requireBusinessProfile();
  if (error) return error;

  try {
    const { id } = await params;
    const pkg = await findPackageById(id);

    if (!pkg) return notFoundError("Package not found.");
    if (pkg.businessProfileId !== businessProfileId) return forbiddenError();

    return successResponse(serializePackage(pkg));
  } catch (err) {
    console.error("[API] GET /api/pricing/packages/[id] error:", err);
    return internalError();
  }
}

/**
 * PUT /api/pricing/packages/[id]
 * Update a package.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { businessProfileId, error } = await requireBusinessProfile();
  if (error) return error;

  try {
    const { id } = await params;
    const pkg = await findPackageById(id);

    if (!pkg) return notFoundError("Package not found.");
    if (pkg.businessProfileId !== businessProfileId) return forbiddenError();

    const body = await request.json();
    const result = validate(updatePackageSchema, body);
    if (result.error)
      return validationError("Validation failed.", result.error);

    const updated = await updatePackage(id, result.data);
    return successResponse(serializePackage(updated));
  } catch (err) {
    console.error("[API] PUT /api/pricing/packages/[id] error:", err);
    return internalError();
  }
}

/**
 * DELETE /api/pricing/packages/[id]
 * Delete a package.
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { businessProfileId, error } = await requireBusinessProfile();
  if (error) return error;

  try {
    const { id } = await params;
    const pkg = await findPackageById(id);

    if (!pkg) return notFoundError("Package not found.");
    if (pkg.businessProfileId !== businessProfileId) return forbiddenError();

    await deletePackage(id);
    return successResponse({ deleted: true });
  } catch (err) {
    console.error("[API] DELETE /api/pricing/packages/[id] error:", err);
    return internalError();
  }
}
