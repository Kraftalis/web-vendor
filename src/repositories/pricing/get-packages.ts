import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { PaginationInput } from "@/lib/validations/pricing";

/**
 * Build the shared `where` clause for package queries.
 */
function buildPackageWhere(
  businessProfileId: string,
  params?: Partial<PaginationInput>,
): Prisma.PackageWhereInput {
  const where: Prisma.PackageWhereInput = { businessProfileId };

  if (params?.search) {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
    ];
  }
  if (params?.categoryId) {
    where.categoryId = params.categoryId;
  }
  if (params?.isActive === "true") {
    where.isActive = true;
  } else if (params?.isActive === "false") {
    where.isActive = false;
  }

  return where;
}

/**
 * Shared include for package queries.
 */
const packageInclude = {
  items: { orderBy: { sortOrder: "asc" as const } },
  category: { select: { id: true, name: true } },
};

/**
 * Build orderBy clause.
 */
function buildOrderBy(
  sortBy?: string,
  sortDir?: "asc" | "desc",
): Prisma.PackageOrderByWithRelationInput {
  const dir = sortDir ?? "asc";
  switch (sortBy) {
    case "price":
      return { price: dir };
    case "status":
      return { isActive: dir };
    case "createdAt":
      return { createdAt: dir };
    default:
      return { sortOrder: dir };
  }
}

/**
 * Find packages with pagination, search, and filtering.
 */
export async function findPackagesByVendor(
  businessProfileId: string,
  params?: Partial<PaginationInput>,
) {
  const where = buildPackageWhere(businessProfileId, params);
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const orderBy = buildOrderBy(params?.sortBy, params?.sortDir);

  const [packages, total] = await Promise.all([
    prisma.package.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: packageInclude,
    }),
    prisma.package.count({ where }),
  ]);

  return { packages, total, page, limit };
}

/**
 * Find only active packages belonging to a vendor.
 */
export async function findActivePackagesByVendor(businessProfileId: string) {
  return prisma.package.findMany({
    where: { businessProfileId, isActive: true },
    orderBy: { sortOrder: "asc" },
    include: packageInclude,
  });
}

/**
 * Find a single package by ID (with items + category info).
 */
export async function findPackageById(id: string) {
  return prisma.package.findUnique({
    where: { id },
    include: packageInclude,
  });
}
