import { prisma } from "@/lib/prisma";

/**
 * Find all active event categories (global master data).
 */
export async function findEventCategories() {
  return prisma.eventCategory.findMany({
    where: { isActive: true },
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
  name: string;
  description?: string | null;
}) {
  return prisma.eventCategory.create({
    data: {
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
