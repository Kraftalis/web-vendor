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
import { z } from "zod";
import {
  findEventById,
  createPayment,
  findPaymentsByEvent,
  recalcPaymentStatus,
} from "@/repositories/event";
import {
  findPrimaryAccount,
  createIncomeFromPayment,
} from "@/repositories/finance";

const createPaymentSchema = z.object({
  amount: z.number().positive("Amount must be positive."),
  paymentType: z.enum(["DOWN_PAYMENT", "INSTALLMENT", "FULL_PAYMENT"]),
  note: z.string().max(2000).optional().nullable(),
  receiptUrl: z.string().url().optional().nullable(),
  receiptName: z.string().max(255).optional().nullable(),
});

/**
 * GET /api/events/[id]/payments
 * List all payments for an event (vendor only).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { businessProfileId, error } = await requireBusinessProfile();
  if (error) return error;

  try {
    const { id } = await params;
    const event = await findEventById(id);
    if (!event) return notFoundError("Event not found.");
    if (event.businessProfileId !== businessProfileId) return forbiddenError();

    const payments = await findPaymentsByEvent(id);

    return successResponse(
      payments.map((p) => ({
        id: p.id,
        amount: String(p.amount),
        paymentType: p.paymentType,
        receiptUrl: p.receiptUrl,
        receiptName: p.receiptName,
        note: p.note,
        isVerified: p.isVerified,
        paidBy: p.paidBy,
        paidAt: p.paidAt.toISOString(),
        createdAt: p.createdAt.toISOString(),
      })),
    );
  } catch (err) {
    console.error("[API] GET /api/events/[id]/payments error:", err);
    return internalError();
  }
}

/**
 * POST /api/events/[id]/payments
 * Vendor records a payment on behalf of the client.
 * Vendor-recorded payments are auto-verified.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { businessProfileId, error } = await requireBusinessProfile();
  if (error) return error;

  try {
    const { id } = await params;
    const event = await findEventById(id);
    if (!event) return notFoundError("Event not found.");
    if (event.businessProfileId !== businessProfileId) return forbiddenError();

    const body = await request.json();
    const result = validate(createPaymentSchema, body);
    if (result.error)
      return validationError("Validation failed.", result.error);

    const data = result.data;

    const payment = await createPayment({
      eventId: id,
      paymentType: data.paymentType,
      amount: data.amount,
      note: data.note,
      receiptUrl: data.receiptUrl,
      receiptName: data.receiptName,
      paidBy: "VENDOR",
    });

    // Recalculate payment status
    const newStatus = await recalcPaymentStatus(id);

    // Auto-record income in primary finance account (vendor payment is auto-verified)
    const primaryAccount = await findPrimaryAccount(businessProfileId);
    if (primaryAccount) {
      await createIncomeFromPayment({
        businessProfileId,
        primaryAccountId: primaryAccount.id,
        paymentId: payment.id,
        amount: data.amount,
        eventId: id,
        clientName: event.clientName,
        eventType: event.eventType,
        paymentType: data.paymentType,
        receiptUrl: data.receiptUrl ?? null,
        receiptName: data.receiptName ?? null,
      });
    }

    return createdResponse({
      id: payment.id,
      amount: String(payment.amount),
      paymentType: payment.paymentType,
      receiptUrl: payment.receiptUrl,
      receiptName: payment.receiptName,
      note: payment.note,
      isVerified: payment.isVerified,
      paidBy: payment.paidBy,
      paidAt: payment.paidAt.toISOString(),
      createdAt: payment.createdAt.toISOString(),
      newPaymentStatus: newStatus,
    });
  } catch (err) {
    console.error("[API] POST /api/events/[id]/payments error:", err);
    return internalError();
  }
}
