import { NextRequest } from "next/server";
import {
  successResponse,
  createdResponse,
  validationError,
  notFoundError,
  forbiddenError,
  internalError,
  requireBusinessProfile,
  validate,
} from "@/lib/api";
import {
  findAccountsByBusiness,
  findAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
} from "@/repositories/finance";
import {
  createFinanceAccountSchema,
  updateFinanceAccountSchema,
} from "@/lib/validations/finance";

/**
 * GET /api/finance/accounts
 * List all finance accounts for the authenticated vendor.
 */
export async function GET() {
  const { businessProfileId, error } = await requireBusinessProfile();
  if (error) return error;

  try {
    const accounts = await findAccountsByBusiness(businessProfileId);
    return successResponse(accounts);
  } catch (err) {
    console.error("[API] GET /api/finance/accounts error:", err);
    return internalError();
  }
}

/**
 * POST /api/finance/accounts
 * Create a new finance account.
 */
export async function POST(request: NextRequest) {
  const { businessProfileId, error } = await requireBusinessProfile();
  if (error) return error;

  try {
    const body = await request.json();
    const result = validate(createFinanceAccountSchema, body);
    if (result.error)
      return validationError("Validation failed.", result.error);

    const account = await createAccount(businessProfileId, result.data);
    return createdResponse(account);
  } catch (err) {
    console.error("[API] POST /api/finance/accounts error:", err);
    return internalError();
  }
}

/**
 * PATCH /api/finance/accounts
 * Update (body.id required) or DELETE (body.deleteId required).
 * Convenience handler to avoid a dynamic route for simple CRUD.
 */
export async function PATCH(request: NextRequest) {
  const { businessProfileId, error } = await requireBusinessProfile();
  if (error) return error;

  try {
    const body = await request.json();

    // Delete action
    if (body.deleteId) {
      const account = await findAccountById(body.deleteId);
      if (!account) return notFoundError("Account not found.");
      if (account.businessProfileId !== businessProfileId)
        return forbiddenError();
      if (account.isPrimary)
        return validationError("Cannot delete the primary account.");
      await deleteAccount(body.deleteId);
      return successResponse({ deleted: true });
    }

    // Update action
    if (!body.id) return validationError("id is required.");
    const account = await findAccountById(body.id);
    if (!account) return notFoundError("Account not found.");
    if (account.businessProfileId !== businessProfileId)
      return forbiddenError();

    const result = validate(updateFinanceAccountSchema, body);
    if (result.error)
      return validationError("Validation failed.", result.error);

    const updated = await updateAccount(body.id, result.data);
    return successResponse(updated);
  } catch (err) {
    console.error("[API] PATCH /api/finance/accounts error:", err);
    return internalError();
  }
}
