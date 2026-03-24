import { z } from "zod";

// ─── Finance Account ────────────────────────────────────────

export const createFinanceAccountSchema = z.object({
  name: z.string().min(1, "Account name is required.").max(255),
  description: z.string().max(2000).optional().nullable(),
});

export const updateFinanceAccountSchema = createFinanceAccountSchema.partial();

export type CreateFinanceAccountInput = z.infer<
  typeof createFinanceAccountSchema
>;
export type UpdateFinanceAccountInput = z.infer<
  typeof updateFinanceAccountSchema
>;

// ─── Finance Transaction ────────────────────────────────────

export const createTransactionSchema = z.object({
  accountId: z.string().uuid("Invalid account."),
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(1, "Category is required.").max(100),
  description: z.string().max(2000).optional().nullable(),
  amount: z.number().positive("Amount must be positive."),
  currency: z.string().max(10).optional().default("IDR"),
  transactionDate: z.string().min(1, "Date is required."), // ISO date string
  receiptUrl: z.string().url().optional().nullable(),
  receiptName: z.string().max(255).optional().nullable(),
  eventId: z.string().uuid().optional().nullable(),
  tags: z.array(z.string().max(50)).max(10).optional().default([]),
  notes: z.string().max(5000).optional().nullable(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;

// ─── Filter / Query params ──────────────────────────────────

export const transactionFilterSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  category: z.string().optional(),
  accountId: z.string().uuid().optional(),
  startDate: z.string().optional(), // ISO date
  endDate: z.string().optional(), // ISO date
  sortBy: z
    .enum(["transactionDate", "amount", "createdAt"])
    .optional()
    .default("transactionDate"),
  sortDir: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type TransactionFilter = z.infer<typeof transactionFilterSchema>;

export const reportFilterSchema = z.object({
  startDate: z.string().min(1, "Start date is required."),
  endDate: z.string().min(1, "End date is required."),
  accountId: z.string().uuid().optional(),
});

export type ReportFilter = z.infer<typeof reportFilterSchema>;
