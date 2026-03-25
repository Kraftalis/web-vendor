import { NextRequest } from "next/server";
import {
  successResponse,
  createdResponse,
  validationError,
  internalError,
  requireBusinessProfile,
  validate,
} from "@/lib/api";
import {
  findPackagesByVendor,
  findAddOnsByVendor,
  createPackage,
  createAddOn,
} from "@/repositories/pricing";
import {
  createPackageSchema,
  createAddOnSchema,
  paginationSchema,
} from "@/lib/validations/pricing";

/**
 * GET /api/pricing
 * List packages and add-ons for the authenticated vendor.
 * Supports pagination & filtering via query params.
 */
export async function GET(request: NextRequest) {
  const { businessProfileId, error } = await requireBusinessProfile();
  if (error) return error;

  try {
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = paginationSchema.safeParse(params);
    const filters = parsed.success ? parsed.data : {};

    const [pkgResult, addonResult] = await Promise.all([
      findPackagesByVendor(businessProfileId, filters),
      findAddOnsByVendor(businessProfileId, filters),
    ]);

    return successResponse(
      {
        packages: pkgResult.packages.map(serializePackage),
        addOns: addonResult.addOns.map(serializeAddOn),
      },
      {
        page: pkgResult.page,
        limit: pkgResult.limit,
        total: pkgResult.total,
      },
    );
  } catch (err) {
    console.error("[API] GET /api/pricing error:", err);
    return internalError();
  }
}

/**
 * POST /api/pricing
 * Create a new package or add-on.
 * Body must include { type: "package" | "addon", ...data }
 */
export async function POST(request: NextRequest) {
  const { businessProfileId, error } = await requireBusinessProfile();
  if (error) return error;

  try {
    const body = await request.json();
    const { type, ...data } = body;

    if (type === "package") {
      const result = validate(createPackageSchema, data);
      if (result.error)
        return validationError("Validation failed.", result.error);

      const pkg = await createPackage(businessProfileId, result.data);
      return createdResponse(serializePackage(pkg));
    }

    if (type === "addon") {
      const result = validate(createAddOnSchema, data);
      if (result.error)
        return validationError("Validation failed.", result.error);

      const addOn = await createAddOn(businessProfileId, result.data);
      return createdResponse(serializeAddOn(addOn));
    }

    return validationError("Invalid type. Expected 'package' or 'addon'.");
  } catch (err) {
    console.error("[API] POST /api/pricing error:", err);
    return internalError();
  }
}

// ─── Serializers ────────────────────────────────────────────

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

function serializeAddOn(addOn: Record<string, unknown>) {
  return {
    ...addOn,
    price: String(addOn.price),
  };
}
