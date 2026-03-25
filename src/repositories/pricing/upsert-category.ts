import { prisma } from "@/lib/prisma";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/lib/validations/pricing";

// ─── Category ───────────────────────────────────────────────

export async function createCategory(data: CreateCategoryInput) {
  return prisma.category.create({
    data: {
      name: data.name,
      description: data.description ?? undefined,
      sortOrder: data.sortOrder ?? 0,
    },
  });
}

export async function updateCategory(id: string, data: UpdateCategoryInput) {
  return prisma.category.update({
    where: { id },
    data: {
      ...data,
      description: data.description ?? undefined,
    },
  });
}

export async function deleteCategory(id: string) {
  return prisma.category.delete({ where: { id } });
}
