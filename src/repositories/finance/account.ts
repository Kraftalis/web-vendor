import { prisma } from "@/lib/prisma";
import type {
  CreateFinanceAccountInput,
  UpdateFinanceAccountInput,
} from "@/lib/validations/finance";

/**
 * Find all finance accounts for a business profile.
 */
export async function findAccountsByBusiness(businessProfileId: string) {
  return prisma.financeAccount.findMany({
    where: { businessProfileId },
    orderBy: { sortOrder: "asc" },
  });
}

/**
 * Find a single finance account by ID.
 */
export async function findAccountById(id: string) {
  return prisma.financeAccount.findUnique({
    where: { id },
  });
}

/**
 * Create a new finance account.
 */
export async function createAccount(
  businessProfileId: string,
  input: CreateFinanceAccountInput,
) {
  return prisma.financeAccount.create({
    data: {
      businessProfileId,
      name: input.name,
      description: input.description,
    },
  });
}

/**
 * Update a finance account.
 */
export async function updateAccount(
  id: string,
  input: UpdateFinanceAccountInput,
) {
  return prisma.financeAccount.update({
    where: { id },
    data: {
      name: input.name,
      description: input.description,
    },
  });
}

/**
 * Delete a finance account.
 */
export async function deleteAccount(id: string) {
  return prisma.financeAccount.delete({ where: { id } });
}

/**
 * Find the primary finance account for a business profile.
 */
export async function findPrimaryAccount(businessProfileId: string) {
  return prisma.financeAccount.findFirst({
    where: { businessProfileId, isPrimary: true },
  });
}

/**
 * Create the default primary finance account for a business profile.
 * Called automatically during onboarding.
 */
export async function createDefaultAccount(businessProfileId: string) {
  return prisma.financeAccount.create({
    data: {
      businessProfileId,
      name: "Utama",
      description: "Akun utama — pendapatan dari booking masuk otomatis.",
      isPrimary: true,
      sortOrder: 0,
    },
  });
}
