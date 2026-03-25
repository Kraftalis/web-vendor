import { prisma } from "@/lib/prisma";

/**
 * Find all active event categories for a business profile.
 */
export async function findEventCategories(businessProfileId: string) {
  return prisma.eventCategory.findMany({
    where: { businessProfileId, isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

/**
 * Find a single event category by ID.
 */
export async function findEventCategoryById(id: string) {
  return prisma.eventCategory.findUnique({ where: { id } });
}

/**
 * Create a new event category.
 */
export async function createEventCategory(data: {
  businessProfileId: string;
  name: string;
  description?: string | null;
}) {
  return prisma.eventCategory.create({
    data: {
      businessProfileId: data.businessProfileId,
      name: data.name,
      description: data.description ?? null,
    },
  });
}

/**
 * Update an existing event category.
 */
export async function updateEventCategory(
  id: string,
  data: { name?: string; description?: string | null },
) {
  return prisma.eventCategory.update({
    where: { id },
    data,
  });
}

/**
 * Delete an event category.
 */
export async function deleteEventCategory(id: string) {
  return prisma.eventCategory.delete({ where: { id } });
}
