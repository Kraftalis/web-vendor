import { NextRequest } from "next/server";
import {
  successResponse,
  validationError,
  notFoundError,
  forbiddenError,
  internalError,
  requireBusinessProfile,
  validate,
} from "@/lib/api";
import {
  findTransactionById,
  updateTransaction,
  deleteTransaction,
} from "@/repositories/finance";
import { updateTransactionSchema } from "@/lib/validations/finance";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * PUT /api/finance/transactions/[id]
 * Update a transaction.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { businessProfileId, error } = await requireBusinessProfile();
  if (error) return error;

  try {
    const { id } = await params;
    const tx = await findTransactionById(id);
    if (!tx) return notFoundError("Transaction not found.");
    if (tx.businessProfileId !== businessProfileId) return forbiddenError();

    const body = await request.json();
    const result = validate(updateTransactionSchema, body);
    if (result.error)
      return validationError("Validation failed.", result.error);

    const updated = await updateTransaction(id, result.data);
    return successResponse({
      ...updated,
      amount: String(updated.amount),
      transactionDate: updated.transactionDate.toISOString(),
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (err) {
    console.error("[API] PUT /api/finance/transactions/[id] error:", err);
    return internalError();
  }
}

/**
 * DELETE /api/finance/transactions/[id]
 * Delete a transaction.
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { businessProfileId, error } = await requireBusinessProfile();
  if (error) return error;

  try {
    const { id } = await params;
    const tx = await findTransactionById(id);
    if (!tx) return notFoundError("Transaction not found.");
    if (tx.businessProfileId !== businessProfileId) return forbiddenError();

    await deleteTransaction(id);
    return successResponse({ deleted: true });
  } catch (err) {
    console.error("[API] DELETE /api/finance/transactions/[id] error:", err);
    return internalError();
  }
}
