import {
  successResponse,
  unauthorizedError,
  internalError,
  requireAuth,
} from "@/lib/api";
import { findBusinessProfile } from "@/repositories/user";
import { findActivePackagesByVendor } from "@/repositories/pricing";
import { cookies } from "next/headers";

/**
 * POST /api/onboarding/complete
 *
 * Called by the onboarding flow after the vendor has completed all required
 * steps (business profile + at least 1 package). Verifies the data in the
 * database and, if valid, sets the `bp` cookie so the middleware stops
 * redirecting the vendor to /onboarding.
 */
export async function POST() {
  const { userId, error } = await requireAuth();
  if (error) return error;

  try {
    const profile = await findBusinessProfile(userId);

    if (!profile) {
      return unauthorizedError("Business profile not found.");
    }

    const hasRequiredFields =
      !!profile.logoUrl && !!profile.businessName && !!profile.phoneNumber;

    if (!hasRequiredFields) {
      return successResponse({ complete: false, reason: "profile_incomplete" });
    }

    const packages = await findActivePackagesByVendor(profile.id);
    const hasPackage = (packages?.length ?? 0) > 0;

    if (!hasPackage) {
      return successResponse({ complete: false, reason: "no_packages" });
    }

    // All conditions met — set the bp cookie
    const cookieStore = await cookies();
    cookieStore.set("bp", "1", {
      path: "/",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax",
    });

    return successResponse({ complete: true });
  } catch (err) {
    console.error("[API] POST /api/onboarding/complete error:", err);
    return internalError();
  }
}

/**
 * GET /api/onboarding/complete
 *
 * Returns the current onboarding status without modifying cookies.
 */
export async function GET() {
  const { userId, error } = await requireAuth();
  if (error) return error;

  try {
    const profile = await findBusinessProfile(userId);

    if (!profile) {
      return successResponse({
        complete: false,
        hasProfile: false,
        hasPackage: false,
      });
    }

    const hasRequiredFields =
      !!profile.logoUrl && !!profile.businessName && !!profile.phoneNumber;

    const packages = await findActivePackagesByVendor(profile.id);
    const hasPackage = (packages?.length ?? 0) > 0;

    return successResponse({
      complete: hasRequiredFields && hasPackage,
      hasProfile: hasRequiredFields,
      hasPackage,
    });
  } catch (err) {
    console.error("[API] GET /api/onboarding/complete error:", err);
    return internalError();
  }
}
