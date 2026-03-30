import { prisma } from "@/lib/prisma";
import { findActivePackagesByVendor } from "@/repositories/pricing";

/**
 * Check if the onboarding process is completed for a given user.
 * A user is considered "completed" if:
 * 1. They have a business profile with required fields (name, logo, phone).
 * 2. They have at least one active package.
 */
export async function isOnboardingCompleted(userId: string): Promise<boolean> {
  const profile = await prisma.businessProfile.findUnique({
    where: { userId },
    select: { id: true, businessName: true, logoUrl: true, phoneNumber: true },
  });

  if (!profile) return false;

  const hasRequiredFields =
    !!profile.businessName && !!profile.logoUrl && !!profile.phoneNumber;

  if (!hasRequiredFields) return false;

  const packages = await findActivePackagesByVendor(profile.id);
  const hasPackage = (packages?.length ?? 0) > 0;

  return hasPackage;
}
