import { prisma } from "@/lib/prisma";

export interface SocialLinks {
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  linkedin?: string;
  whatsapp?: string;
  [key: string]: string | undefined;
}

/**
 * Find business profile for a user.
 */
export async function findBusinessProfile(userId: string) {
  return prisma.businessProfile.findUnique({
    where: { userId },
  });
}

/**
 * Find business profile by its own ID.
 */
export async function findBusinessProfileById(id: string) {
  return prisma.businessProfile.findUnique({
    where: { id },
  });
}

/**
 * Create or update business profile.
 */
export async function upsertBusinessProfile(
  userId: string,
  data: {
    businessName: string;
    tagline?: string | null;
    logoUrl?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
    socialLinks?: SocialLinks | null;
  },
) {
  return prisma.businessProfile.upsert({
    where: { userId },
    create: {
      userId,
      businessName: data.businessName,
      tagline: data.tagline ?? null,
      logoUrl: data.logoUrl ?? null,
      email: data.email ?? null,
      phoneNumber: data.phoneNumber ?? null,
      socialLinks: data.socialLinks ?? undefined,
    },
    update: {
      businessName: data.businessName,
      tagline: data.tagline ?? null,
      logoUrl: data.logoUrl ?? null,
      email: data.email ?? null,
      phoneNumber: data.phoneNumber ?? null,
      socialLinks: data.socialLinks ?? undefined,
    },
  });
}
