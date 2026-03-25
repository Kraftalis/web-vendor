import { prisma } from "@/lib/prisma";
import type {
  CreatePackageInput,
  UpdatePackageInput,
} from "@/lib/validations/pricing";

const packageInclude = {
  items: { orderBy: { sortOrder: "asc" as const } },
  category: { select: { id: true, name: true } },
  eventCategory: { select: { id: true, name: true } },
};

/**
 * Create a new package for a vendor.
 * Variations (items) are created with their own price + description.
 */
export async function createPackage(
  businessProfileId: string,
  data: CreatePackageInput,
) {
  return prisma.package.create({
    data: {
      businessProfileId,
      name: data.name,
      description: data.description ?? undefined,
      price: data.price ?? 0,
      currency: data.currency ?? "IDR",
      categoryId: data.categoryId ?? undefined,
      eventCategoryId: data.eventCategoryId ?? undefined,
      inclusions: data.inclusions ?? [],
      sortOrder: data.sortOrder ?? 0,
      items: data.variations
        ? {
            create: data.variations.map((v, index) => ({
              label: v.label,
              description: v.description ?? undefined,
              price: v.price,
              sortOrder: v.sortOrder ?? index,
              inclusions: v.inclusions ?? [],
            })),
          }
        : undefined,
    },
    include: packageInclude,
  });
}

/**
 * Update an existing package.
 * If variations[] is provided, replaces all existing variations atomically.
 */
export async function updatePackage(id: string, data: UpdatePackageInput) {
  const { variations, ...rest } = data;

  if (variations !== undefined) {
    // Replace all variations
    await prisma.packageItem.deleteMany({ where: { packageId: id } });
    if (variations.length > 0) {
      await prisma.packageItem.createMany({
        data: variations.map((v, index) => ({
          packageId: id,
          label: v.label,
          description: v.description ?? undefined,
          price: v.price,
          sortOrder: v.sortOrder ?? index,
          inclusions: v.inclusions ?? [],
        })),
      });
    }
  }

  return prisma.package.update({
    where: { id },
    data: {
      ...rest,
      description: rest.description ?? undefined,
      categoryId:
        rest.categoryId !== undefined ? (rest.categoryId ?? null) : undefined,
      eventCategoryId:
        rest.eventCategoryId !== undefined
          ? (rest.eventCategoryId ?? null)
          : undefined,
      inclusions: rest.inclusions,
    },
    include: packageInclude,
  });
}
