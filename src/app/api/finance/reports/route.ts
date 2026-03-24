import { NextRequest } from "next/server";
import {
  successResponse,
  validationError,
  internalError,
  requireBusinessProfile,
} from "@/lib/api";
import {
  getTransactionSummary,
  getMonthlySummary,
  getCategorySummary,
} from "@/repositories/finance";
import { reportFilterSchema } from "@/lib/validations/finance";

/**
 * GET /api/finance/reports
 * Returns summary, monthly breakdown, and category breakdown.
 * Query: startDate, endDate, accountId (optional)
 */
export async function GET(request: NextRequest) {
  const { businessProfileId, error } = await requireBusinessProfile();
  if (error) return error;

  try {
    const raw = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = reportFilterSchema.safeParse(raw);
    if (!parsed.success)
      return validationError(
        "startDate and endDate are required.",
        Object.fromEntries(
          Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [
            k,
            v ?? [],
          ]),
        ),
      );

    const { startDate, endDate, accountId } = parsed.data;

    const [summary, monthly, categories] = await Promise.all([
      getTransactionSummary(businessProfileId, startDate, endDate, accountId),
      getMonthlySummary(businessProfileId, startDate, endDate, accountId),
      getCategorySummary(
        businessProfileId,
        startDate,
        endDate,
        undefined,
        accountId,
      ),
    ]);

    return successResponse({ summary, monthly, categories });
  } catch (err) {
    console.error("[API] GET /api/finance/reports error:", err);
    return internalError();
  }
}
