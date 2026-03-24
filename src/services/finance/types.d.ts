// ─── Finance Account ────────────────────────────────────────

export interface FinanceAccount {
  id: string;
  businessProfileId: string;
  name: string;
  description: string | null;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Finance Transaction ────────────────────────────────────

export type TransactionType = "INCOME" | "EXPENSE";

export interface FinanceTransaction {
  id: string;
  businessProfileId: string;
  accountId: string;
  type: TransactionType;
  category: string;
  description: string | null;
  amount: string; // Decimal as string
  currency: string;
  transactionDate: string; // ISO date
  receiptUrl: string | null;
  receiptName: string | null;
  eventId: string | null;
  tags: string[];
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  account?: { id: string; name: string };
  event?: { id: string; clientName: string; eventType: string } | null;
}

// ─── Transaction filter params ──────────────────────────────

export interface TransactionQueryParams {
  page?: number;
  limit?: number;
  type?: TransactionType;
  category?: string;
  accountId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: "transactionDate" | "amount" | "createdAt";
  sortDir?: "asc" | "desc";
}

// ─── Report params ──────────────────────────────────────────

export interface ReportQueryParams {
  startDate: string;
  endDate: string;
  accountId?: string;
}

// ─── Report response ────────────────────────────────────────

export interface ReportSummary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  incomeCount: number;
  expenseCount: number;
}

export interface MonthlySummary {
  month: string; // YYYY-MM
  income: number;
  expense: number;
}

export interface CategorySummary {
  category: string;
  type: TransactionType;
  total: number;
  count: number;
}

export interface ReportData {
  summary: ReportSummary;
  monthly: MonthlySummary[];
  categories: CategorySummary[];
}

// ─── Mutation payloads ──────────────────────────────────────

export interface CreateAccountPayload {
  name: string;
  description?: string | null;
}

export interface UpdateAccountPayload {
  name?: string;
  description?: string | null;
}

export interface CreateTransactionPayload {
  accountId: string;
  type: TransactionType;
  category: string;
  description?: string | null;
  amount: number;
  currency?: string;
  transactionDate: string;
  receiptUrl?: string | null;
  receiptName?: string | null;
  eventId?: string | null;
  tags?: string[];
  notes?: string | null;
}

export interface UpdateTransactionPayload {
  accountId?: string;
  type?: TransactionType;
  category?: string;
  description?: string | null;
  amount?: number;
  currency?: string;
  transactionDate?: string;
  receiptUrl?: string | null;
  receiptName?: string | null;
  eventId?: string | null;
  tags?: string[];
  notes?: string | null;
}
