import { NextRequest } from "next/server";
import {
  successResponse,
  validationError,
  notFoundError,
  forbiddenError,
  internalError,
  requireBusinessProfile,
} from "@/lib/api";
import {
  findEventById,
  findPaymentById,
  verifyPayment,
  rejectPayment,
  recalcPaymentStatus,
} from "@/repositories/event";
import {
  findPrimaryAccount,
  createIncomeFromPayment,
} from "@/repositories/finance";

interface RouteParams {
  params: Promise<{ id: string; paymentId: string }>;
}

/**
 * PATCH /api/events/[id]/payments/[paymentId]
 * Verify or reject a payment.
 * Body: { action: "verify" | "reject" }
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { businessProfileId, error } = await requireBusinessProfile();
  if (error) return error;

  try {
    const { id, paymentId } = await params;

    // Verify event ownership
    const event = await findEventById(id);
    if (!event) return notFoundError("Event not found.");
    if (event.businessProfileId !== businessProfileId) return forbiddenError();

    // Verify payment belongs to event
    const payment = await findPaymentById(paymentId);
    if (!payment || payment.eventId !== id) {
      return notFoundError("Payment not found.");
    }

    const body = await request.json();
    const action = body.action;

    if (action !== "verify" && action !== "reject") {
      return validationError("action must be 'verify' or 'reject'.");
    }

    let updated;
    if (action === "verify") {
      updated = await verifyPayment(paymentId);
    } else {
      updated = await rejectPayment(paymentId);
    }

    // Recalculate event payment status
    const newStatus = await recalcPaymentStatus(id);

    // Auto-record income when vendor verifies a client payment
    if (action === "verify") {
      const primaryAccount = await findPrimaryAccount(businessProfileId);
      if (primaryAccount) {
        await createIncomeFromPayment({
          businessProfileId,
          primaryAccountId: primaryAccount.id,
          paymentId: updated.id,
          amount: Number(updated.amount),
          eventId: id,
          clientName: event.clientName,
          eventType: event.eventType,
          paymentType: updated.paymentType,
          receiptUrl: updated.receiptUrl,
          receiptName: updated.receiptName,
        });
      }
    }

    return successResponse({
      id: updated.id,
      amount: String(updated.amount),
      paymentType: updated.paymentType,
      receiptUrl: updated.receiptUrl,
      note: updated.note,
      isVerified: updated.isVerified,
      paidBy: updated.paidBy,
      paidAt: updated.paidAt.toISOString(),
      createdAt: updated.createdAt.toISOString(),
      newPaymentStatus: newStatus,
    });
  } catch (err) {
    console.error(
      "[API] PATCH /api/events/[id]/payments/[paymentId] error:",
      err,
    );
    return internalError();
  }
}
