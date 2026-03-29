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
import { findEventById, updateEvent, deleteEvent } from "@/repositories/event";
import { updateEventSchema } from "@/lib/validations/event";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/events/[id]
 * Get a single event with full details.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { businessProfileId, error } = await requireBusinessProfile();
  if (error) return error;

  try {
    const { id } = await params;
    const event = await findEventById(id);

    if (!event) return notFoundError("Event not found.");
    if (event.businessProfileId !== businessProfileId) return forbiddenError();

    return successResponse(serializeEventDetail(event));
  } catch (err) {
    console.error("[API] GET /api/events/[id] error:", err);
    return internalError();
  }
}

/**
 * PUT /api/events/[id]
 * Update an event.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { businessProfileId, error } = await requireBusinessProfile();
  if (error) return error;

  try {
    const { id } = await params;
    const event = await findEventById(id);

    if (!event) return notFoundError("Event not found.");
    if (event.businessProfileId !== businessProfileId) return forbiddenError();

    const body = await request.json();
    const result = validate(updateEventSchema, body);
    if (result.error)
      return validationError("Validation failed.", result.error);

    const updated = await updateEvent(id, result.data);

    return successResponse({
      ...updated,
      eventCategoryId: updated.eventCategoryId ?? null,
      eventCategoryName:
        (updated as unknown as { eventCategory?: { name: string } })
          .eventCategory?.name ?? null,
      amount: updated.amount ? String(updated.amount) : null,
      currency: updated.currency,
      packageSnapshot: updated.packageSnapshot,
      addOnsSnapshot: updated.addOnsSnapshot,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (err) {
    console.error("[API] PUT /api/events/[id] error:", err);
    return internalError();
  }
}

/**
 * DELETE /api/events/[id]
 * Delete an event.
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { businessProfileId, error } = await requireBusinessProfile();
  if (error) return error;

  try {
    const { id } = await params;
    const event = await findEventById(id);

    if (!event) return notFoundError("Event not found.");
    if (event.businessProfileId !== businessProfileId) return forbiddenError();

    await deleteEvent(id);
    return successResponse({ deleted: true });
  } catch (err) {
    console.error("[API] DELETE /api/events/[id] error:", err);
    return internalError();
  }
}

// ─── Serializer ─────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeEventDetail(event: any) {
  return {
    id: event.id,
    vendorId: event.businessProfileId,
    clientName: event.clientName,
    clientPhone: event.clientPhone,
    clientPhoneSecondary: event.clientPhoneSecondary ?? null,
    clientEmail: event.clientEmail,
    eventType: event.eventType,
    eventCategoryId: event.eventCategoryId ?? null,
    eventCategoryName: event.eventCategory?.name ?? null,
    eventLocation: event.eventLocation,
    eventLocationUrl: event.eventLocationUrl ?? null,
    packageSnapshot: event.packageSnapshot,
    addOnsSnapshot: event.addOnsSnapshot,
    amount: event.amount ? String(event.amount) : null,
    currency: event.currency,
    eventStatus: event.eventStatus,
    paymentStatus: event.paymentStatus,
    notes: event.notes,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
    bookingToken: event.bookingLink?.token ?? null,
    schedules: (event.schedules ?? []).map(
      (s: {
        id: string;
        date: Date;
        startTime: string | null;
        endTime: string | null;
        label: string | null;
        sortOrder: number;
      }) => ({
        id: s.id,
        date: s.date.toISOString(),
        startTime: s.startTime,
        endTime: s.endTime,
        label: s.label,
        sortOrder: s.sortOrder,
      }),
    ),
    payments: (event.payments ?? []).map(
      (p: {
        id: string;
        amount: unknown;
        paymentType: string;
        receiptUrl: string | null;
        receiptName: string | null;
        note: string | null;
        isVerified: boolean;
        paidBy: string;
        createdAt: Date;
      }) => ({
        id: p.id,
        amount: String(p.amount),
        paymentType: p.paymentType,
        receiptUrl: p.receiptUrl,
        receiptName: p.receiptName,
        note: p.note,
        isVerified: p.isVerified,
        paidBy: p.paidBy,
        createdAt: p.createdAt.toISOString(),
      }),
    ),
  };
}
