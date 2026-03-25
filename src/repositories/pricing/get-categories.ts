import { prisma } from "@/lib/prisma";

/**
 * Find all active categories.
 */
export async function findAllCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

/**
 * Find a single category by ID.
 */
export async function findCategoryById(id: string) {
  return prisma.category.findUnique({
    where: { id },
  });
}

/**
 * Find a single category by name.
 */
export async function findCategoryByName(name: string) {
  return prisma.category.findUnique({
    where: { name },
  });
}
