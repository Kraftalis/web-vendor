import { NextRequest } from "next/server";
import {
  successResponse,
  createdResponse,
  validationError,
  internalError,
  requireBusinessProfile,
  validate,
} from "@/lib/api";
import { findEventsByVendor, createEvent } from "@/repositories/event";
import { createEventSchema } from "@/lib/validations/event";

/**
 * GET /api/events
 * List all events for the authenticated vendor's business profile.
 */
export async function GET() {
  const { businessProfileId, error } = await requireBusinessProfile();
  if (error) return error;

  try {
    const events = await findEventsByVendor(businessProfileId);

    // Extract package name from JSONB snapshot
    const extractPkgName = (snap: unknown): string | null => {
      if (snap && typeof snap === "object" && "name" in snap) {
        return (snap as { name: string }).name;
      }
      return null;
    };

    return successResponse(
      events.map((e) => {
        const pendingPayment = e.payments?.[0] ?? null;
        return {
          id: e.id,
          businessProfileId: e.businessProfileId,
          clientName: e.clientName,
          clientPhone: e.clientPhone,
          clientEmail: e.clientEmail,
          eventType: e.eventType,
          eventCategoryId: e.eventCategoryId,
          eventCategoryName: e.eventCategory?.name ?? null,
          eventDate: e.eventDate.toISOString(),
          eventTime: e.eventTime,
          eventLocation: e.eventLocation,
          packageSnapshot: e.packageSnapshot,
          addOnsSnapshot: e.addOnsSnapshot,
          packageName: extractPkgName(e.packageSnapshot),
          amount: e.amount ? String(e.amount) : null,
          currency: e.currency,
          eventStatus: e.eventStatus,
          paymentStatus: e.paymentStatus,
          notes: e.notes,
          bookingToken: e.bookingLink?.token ?? null,
          createdAt: e.createdAt.toISOString(),
          updatedAt: e.updatedAt.toISOString(),
          // Latest unverified client payment for quick-action
          latestPendingPayment: pendingPayment
            ? {
                id: pendingPayment.id,
                amount: String(pendingPayment.amount),
                paymentType: pendingPayment.paymentType,
                receiptUrl: pendingPayment.receiptUrl,
                paidBy: pendingPayment.paidBy,
                createdAt: pendingPayment.createdAt.toISOString(),
              }
            : null,
        };
      }),
    );
  } catch (err) {
    console.error("[API] GET /api/events error:", err);
    return internalError();
  }
}

/**
 * POST /api/events
 * Create a new event for the authenticated vendor's business profile.
 */
export async function POST(request: NextRequest) {
  const { businessProfileId, error } = await requireBusinessProfile();
  if (error) return error;

  try {
    const body = await request.json();
    const result = validate(createEventSchema, body);
    if (result.error)
      return validationError("Validation failed.", result.error);

    const event = await createEvent(businessProfileId, result.data);

    return createdResponse({
      ...event,
      eventDate: event.eventDate.toISOString(),
      eventCategoryId: event.eventCategoryId ?? null,
      eventCategoryName: event.eventCategory?.name ?? null,
      amount: event.amount ? String(event.amount) : null,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    });
  } catch (err) {
    console.error("[API] POST /api/events error:", err);
    return internalError();
  }
}
