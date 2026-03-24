import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import {
  successResponse,
  validationError,
  internalError,
  requireAuth,
} from "@/lib/api";
import {
  findBusinessProfile,
  upsertBusinessProfile,
} from "@/repositories/user";
import {
  findPrimaryAccount,
  createDefaultAccount,
} from "@/repositories/finance";

/**
 * GET /api/user/business-profile
 * Fetch the authenticated user's business profile.
 */
export async function GET() {
  const { userId, error } = await requireAuth();
  if (error) return error;

  try {
    const profile = await findBusinessProfile(userId);
    return successResponse(profile);
  } catch (err) {
    console.error("[API] GET /api/user/business-profile error:", err);
    return internalError();
  }
}

/**
 * PUT /api/user/business-profile
 * Create or update the authenticated user's business profile.
 */
export async function PUT(request: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();

    if (
      !body.businessName ||
      typeof body.businessName !== "string" ||
      !body.businessName.trim()
    ) {
      return validationError("Business name is required.");
    }

    const profile = await upsertBusinessProfile(userId, {
      businessName: body.businessName.trim(),
      tagline: body.tagline?.trim() || null,
      logoUrl: body.logoUrl || null,
      email: body.email?.trim() || null,
      phoneNumber: body.phoneNumber?.trim() || null,
      socialLinks: body.socialLinks || null,
    });

    // Auto-create the primary finance account if it doesn't exist yet.
    const existingPrimary = await findPrimaryAccount(profile.id);
    if (!existingPrimary) {
      await createDefaultAccount(profile.id);
    }

    // Set the "bp" cookie so middleware knows onboarding is complete.
    const cookieStore = await cookies();
    cookieStore.set("bp", "1", {
      path: "/",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax",
    });

    return successResponse(profile);
  } catch (err) {
    console.error("[API] PUT /api/user/business-profile error:", err);
    return internalError();
  }
}
