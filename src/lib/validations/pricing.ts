import { z } from "zod";

// ─── Package Variation ──────────────────────────────────────

export const packageVariationSchema = z.object({
  id: z.string().uuid().optional(), // omit for new variations
  label: z.string().min(1, "Variation name is required.").max(255),
  description: z.string().max(2000).optional().nullable(),
  price: z.number().min(0, "Price must be a positive number."),
  sortOrder: z.number().int().min(0).default(0),
  inclusions: z.array(z.string().max(500)).optional().default([]),
});

export type PackageVariationInput = z.infer<typeof packageVariationSchema>;

// ─── Package ────────────────────────────────────────────────

export const createPackageSchema = z.object({
  name: z.string().min(1, "Package name is required.").max(255),
  description: z.string().max(2000).optional().nullable(),
  price: z.number().min(0, "Price must be a positive number.").default(0),
  currency: z.string().max(10).default("IDR"),
  categoryId: z.string().uuid("Invalid category.").optional().nullable(),
  eventCategoryId: z.string().uuid("Invalid event category.").optional().nullable(),
  inclusions: z.array(z.string().max(500)).optional().default([]),
  variations: z.array(packageVariationSchema).optional(),
  sortOrder: z.number().int().min(0).default(0),
});

export const updatePackageSchema = createPackageSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// ─── Add-On ─────────────────────────────────────────────────

export const createAddOnSchema = z.object({
  name: z.string().min(1, "Add-on name is required.").max(255),
  description: z.string().max(2000).optional().nullable(),
  price: z.number().min(0, "Price must be a positive number."),
  currency: z.string().max(10).default("IDR"),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateAddOnSchema = createAddOnSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// ─── Category ───────────────────────────────────────────────

export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required.").max(255),
  description: z.string().max(2000).optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateCategorySchema = createCategorySchema.partial().extend({
  isActive: z.boolean().optional(),
});

// ─── Pagination query params ────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).optional().default("asc"),
  categoryId: z.string().uuid().optional(),
  isActive: z.enum(["true", "false", "all"]).optional().default("all"),
});

// ─── Inferred types ─────────────────────────────────────────

export type CreatePackageInput = z.infer<typeof createPackageSchema>;
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;
export type CreateAddOnInput = z.infer<typeof createAddOnSchema>;
export type UpdateAddOnInput = z.infer<typeof updateAddOnSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
