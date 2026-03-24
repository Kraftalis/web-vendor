import { NextRequest } from "next/server";
import {
  successResponse,
  createdResponse,
  validationError,
  internalError,
  requireBusinessProfile,
  validate,
} from "@/lib/api";
import {
  findTransactionsByBusiness,
  createTransaction,
} from "@/repositories/finance";
import {
  createTransactionSchema,
  transactionFilterSchema,
} from "@/lib/validations/finance";

/**
 * GET /api/finance/transactions
 * List transactions with filtering, pagination, and sorting.
 */
export async function GET(request: NextRequest) {
  const { businessProfileId, error } = await requireBusinessProfile();
  if (error) return error;

  try {
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = transactionFilterSchema.safeParse(params);
    const filter = parsed.success
      ? parsed.data
      : {
          page: 1,
          limit: 20,
          sortBy: "transactionDate" as const,
          sortDir: "desc" as const,
        };

    const result = await findTransactionsByBusiness(businessProfileId, filter);

    return successResponse(result.transactions.map(serializeTx), {
      page: result.page,
      limit: result.limit,
      total: result.total,
    });
  } catch (err) {
    console.error("[API] GET /api/finance/transactions error:", err);
    return internalError();
  }
}

/**
 * POST /api/finance/transactions
 * Create a new transaction.
 */
export async function POST(request: NextRequest) {
  const { businessProfileId, error } = await requireBusinessProfile();
  if (error) return error;

  try {
    const body = await request.json();
    const result = validate(createTransactionSchema, body);
    if (result.error)
      return validationError("Validation failed.", result.error);

    const tx = await createTransaction(businessProfileId, result.data);
    return createdResponse(serializeTx(tx));
  } catch (err) {
    console.error("[API] POST /api/finance/transactions error:", err);
    return internalError();
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeTx(tx: any) {
  return {
    ...tx,
    amount: String(tx.amount),
    transactionDate:
      tx.transactionDate instanceof Date
        ? tx.transactionDate.toISOString()
        : tx.transactionDate,
    createdAt:
      tx.createdAt instanceof Date ? tx.createdAt.toISOString() : tx.createdAt,
    updatedAt:
      tx.updatedAt instanceof Date ? tx.updatedAt.toISOString() : tx.updatedAt,
  };
}
