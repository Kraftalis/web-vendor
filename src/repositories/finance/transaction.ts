import { prisma } from "@/lib/prisma";
import type {
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilter,
} from "@/lib/validations/finance";
import type { Prisma } from "@/generated/prisma/client";

// ─── Helpers ────────────────────────────────────────────────

function buildWhere(
  businessProfileId: string,
  filter: TransactionFilter,
): Prisma.FinanceTransactionWhereInput {
  const where: Prisma.FinanceTransactionWhereInput = { businessProfileId };

  if (filter.type) where.type = filter.type;
  if (filter.category) where.category = filter.category;
  if (filter.accountId) where.accountId = filter.accountId;
  if (filter.eventId) where.eventId = filter.eventId;

  if (filter.startDate || filter.endDate) {
    where.transactionDate = {};
    if (filter.startDate)
      where.transactionDate.gte = new Date(filter.startDate);
    if (filter.endDate) where.transactionDate.lte = new Date(filter.endDate);
  }

  return where;
}

// ─── CRUD ───────────────────────────────────────────────────

/**
 * List transactions with pagination & filtering.
 */
export async function findTransactionsByBusiness(
  businessProfileId: string,
  filter: TransactionFilter,
) {
  const where = buildWhere(businessProfileId, filter);
  const page = filter.page ?? 1;
  const limit = filter.limit ?? 20;
  const skip = (page - 1) * limit;
  const sortBy = filter.sortBy ?? "transactionDate";
  const sortDir = filter.sortDir ?? "desc";

  const [transactions, total] = await Promise.all([
    prisma.financeTransaction.findMany({
      where,
      orderBy: { [sortBy]: sortDir },
      skip,
      take: limit,
      include: {
        account: { select: { id: true, name: true } },
        event: {
          select: { id: true, clientName: true, eventType: true },
        },
      },
    }),
    prisma.financeTransaction.count({ where }),
  ]);

  return { transactions, total, page, limit };
}

/**
 * Find a single transaction by ID.
 */
export async function findTransactionById(id: string) {
  return prisma.financeTransaction.findUnique({
    where: { id },
    include: {
      account: { select: { id: true, name: true } },
      event: { select: { id: true, clientName: true, eventType: true } },
    },
  });
}

/**
 * Create a new transaction.
 */
export async function createTransaction(
  businessProfileId: string,
  input: CreateTransactionInput,
) {
  return prisma.financeTransaction.create({
    data: {
      businessProfileId,
      accountId: input.accountId!,
      type: input.type,
      category: input.category,
      description: input.description,
      amount: input.amount,
      currency: input.currency ?? "IDR",
      transactionDate: new Date(input.transactionDate),
      receiptUrl: input.receiptUrl,
      receiptName: input.receiptName,
      eventId: input.eventId,
      tags: input.tags ?? [],
      notes: input.notes,
    },
    include: {
      account: { select: { id: true, name: true } },
      event: { select: { id: true, clientName: true, eventType: true } },
    },
  });
}

/**
 * Update a transaction.
 */
export async function updateTransaction(
  id: string,
  input: UpdateTransactionInput,
) {
  return prisma.financeTransaction.update({
    where: { id },
    data: {
      accountId: input.accountId,
      type: input.type,
      category: input.category,
      description: input.description,
      amount: input.amount,
      currency: input.currency,
      transactionDate: input.transactionDate
        ? new Date(input.transactionDate)
        : undefined,
      receiptUrl: input.receiptUrl,
      receiptName: input.receiptName,
      eventId: input.eventId,
      tags: input.tags,
      notes: input.notes,
    },
    include: {
      account: { select: { id: true, name: true } },
      event: { select: { id: true, clientName: true, eventType: true } },
    },
  });
}

/**
 * Delete a transaction.
 */
export async function deleteTransaction(id: string) {
  return prisma.financeTransaction.delete({ where: { id } });
}

// ─── Reports / Aggregations ─────────────────────────────────

/**
 * Get total income, total expense, and net profit for a date range.
 */
export async function getTransactionSummary(
  businessProfileId: string,
  startDate: string,
  endDate: string,
  accountId?: string,
) {
  const where: Prisma.FinanceTransactionWhereInput = {
    businessProfileId,
    transactionDate: {
      gte: new Date(startDate),
      lte: new Date(endDate),
    },
    ...(accountId ? { accountId } : {}),
  };

  const [income, expense] = await Promise.all([
    prisma.financeTransaction.aggregate({
      where: { ...where, type: "INCOME" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.financeTransaction.aggregate({
      where: { ...where, type: "EXPENSE" },
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  const totalIncome = Number(income._sum.amount ?? 0);
  const totalExpense = Number(expense._sum.amount ?? 0);

  return {
    totalIncome,
    totalExpense,
    netProfit: totalIncome - totalExpense,
    incomeCount: income._count,
    expenseCount: expense._count,
  };
}

/**
 * Monthly breakdown: income & expense per month for a date range.
 */
export async function getMonthlySummary(
  businessProfileId: string,
  startDate: string,
  endDate: string,
  accountId?: string,
) {
  const where: Prisma.FinanceTransactionWhereInput = {
    businessProfileId,
    transactionDate: {
      gte: new Date(startDate),
      lte: new Date(endDate),
    },
    ...(accountId ? { accountId } : {}),
  };

  const transactions = await prisma.financeTransaction.findMany({
    where,
    select: {
      type: true,
      amount: true,
      transactionDate: true,
    },
    orderBy: { transactionDate: "asc" },
  });

  // Group by YYYY-MM
  const monthMap = new Map<
    string,
    { month: string; income: number; expense: number }
  >();

  for (const tx of transactions) {
    const d = tx.transactionDate;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthMap.has(key)) {
      monthMap.set(key, { month: key, income: 0, expense: 0 });
    }
    const entry = monthMap.get(key)!;
    const amt = Number(tx.amount);
    if (tx.type === "INCOME") entry.income += amt;
    else entry.expense += amt;
  }

  return Array.from(monthMap.values());
}

/**
 * Category breakdown: totals per category for a date range.
 */
export async function getCategorySummary(
  businessProfileId: string,
  startDate: string,
  endDate: string,
  type?: "INCOME" | "EXPENSE",
  accountId?: string,
) {
  const where: Prisma.FinanceTransactionWhereInput = {
    businessProfileId,
    transactionDate: {
      gte: new Date(startDate),
      lte: new Date(endDate),
    },
    ...(type ? { type } : {}),
    ...(accountId ? { accountId } : {}),
  };

  const result = await prisma.financeTransaction.groupBy({
    by: ["category", "type"],
    where,
    _sum: { amount: true },
    _count: true,
    orderBy: { _sum: { amount: "desc" } },
  });

  return result.map((r) => ({
    category: r.category,
    type: r.type,
    total: Number(r._sum.amount ?? 0),
    count: r._count,
  }));
}

// ─── Auto-income from payments ──────────────────────────────

/**
 * Automatically create an INCOME transaction in the primary finance account
 * when a payment is verified.
 *
 * Silently returns null if no primary account exists (e.g. if the vendor
 * hasn't completed onboarding for some reason).
 */
export async function createIncomeFromPayment(opts: {
  businessProfileId: string;
  primaryAccountId: string;
  paymentId: string;
  amount: number;
  currency?: string;
  eventId: string;
  clientName: string | null;
  eventType: string | null;
  paymentType: string;
  receiptUrl?: string | null;
  receiptName?: string | null;
}) {
  const isRefund = opts.paymentType === "REFUND";
  const desc = opts.clientName
    ? isRefund
      ? `Refund to ${opts.clientName}`
      : `Payment from ${opts.clientName}`
    : isRefund
      ? "Event refund"
      : "Event payment";

  return prisma.financeTransaction.create({
    data: {
      businessProfileId: opts.businessProfileId,
      accountId: opts.primaryAccountId,
      type: isRefund ? "EXPENSE" : "INCOME",
      category: isRefund ? "Refund" : "Event Payment",
      description: desc,
      amount: opts.amount,
      currency: opts.currency ?? "IDR",
      transactionDate: new Date(),
      receiptUrl: opts.receiptUrl ?? null,
      receiptName: opts.receiptName ?? null,
      eventId: opts.eventId,
      tags: ["auto", opts.paymentType.toLowerCase()],
      notes: `Auto-recorded from ${opts.paymentType} (Payment #${opts.paymentId.slice(-8)})`,
    },
  });
}
