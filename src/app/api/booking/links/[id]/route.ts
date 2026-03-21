import { NextRequest } from "next/server";
import {
  successResponse,
  validationError,
  notFoundError,
  internalError,
  requireAuth,
  validate,
} from "@/lib/api";
import {
  findBookingLinkById,
  updateBookingLinkById,
  deleteBookingLinkById,
} from "@/repositories/booking";
import { updateBookingLinkSchema } from "@/lib/validations/booking";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * PATCH /api/booking/links/[id]
 * Update a booking link (vendor side — only if no event yet).
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  try {
    const { id } = await params;

    // Find and verify ownership
    const link = await findBookingLinkById(id);
    if (!link) return notFoundError("Booking link not found.");
    if (link.vendorId !== userId)
      return notFoundError("Booking link not found.");
    if (link.event)
      return validationError(
        "Cannot update a booking link that already has an event.",
      );

    // Validate body
    const body = await request.json();
    const result = validate(updateBookingLinkSchema, body);
    if (result.error)
      return validationError("Validation failed.", result.error);

    const updated = await updateBookingLinkById(id, result.data);

    return successResponse({
      id: updated.id,
      token: updated.token,
      clientName: updated.clientName,
      clientPhone: updated.clientPhone,
      eventDate: updated.eventDate?.toISOString() ?? null,
      eventTime: updated.eventTime,
      eventLocation: updated.eventLocation,
      packageSnapshot: updated.packageSnapshot,
      addOnsSnapshot: updated.addOnsSnapshot,
      totalAmount: updated.totalAmount ? String(updated.totalAmount) : null,
      expiresAt: updated.expiresAt.toISOString(),
    });
  } catch (err) {
    console.error("[API] PATCH /api/booking/links/[id] error:", err);
    return internalError();
  }
}

/**
 * DELETE /api/booking/links/[id]
 * Delete a booking link (vendor side — only if no event yet).
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  try {
    const { id } = await params;

    const link = await findBookingLinkById(id);
    if (!link) return notFoundError("Booking link not found.");
    if (link.vendorId !== userId)
      return notFoundError("Booking link not found.");
    if (link.event)
      return validationError(
        "Cannot delete a booking link that already has an event.",
      );

    await deleteBookingLinkById(id);

    return successResponse({ deleted: true });
  } catch (err) {
    console.error("[API] DELETE /api/booking/links/[id] error:", err);
    return internalError();
  }
}
