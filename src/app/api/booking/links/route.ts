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
  createBookingLink,
  findBookingLinksByVendor,
} from "@/repositories/booking";
import { createBookingLinkSchema } from "@/lib/validations/booking";

/**
 * GET /api/booking/links
 * List all booking links for the authenticated vendor.
 */
export async function GET() {
  const { businessProfileId, error } = await requireBusinessProfile();
  if (error) return error;

  try {
    const links = await findBookingLinksByVendor(businessProfileId);

    return successResponse(
      links.map((l) => ({
        id: l.id,
        token: l.token,
        clientName: l.clientName,
        clientPhone: l.clientPhone,
        eventCategoryId: l.eventCategoryId ?? null,
        eventDate: l.eventDate?.toISOString() ?? null,
        eventTime: l.eventTime,
        eventLocation: l.eventLocation,
        scheduleDates: l.scheduleDates ?? null,
        packageSnapshot: l.packageSnapshot,
        addOnsSnapshot: l.addOnsSnapshot,
        totalAmount: l.totalAmount ? String(l.totalAmount) : null,
        expiresAt: l.expiresAt.toISOString(),
        createdAt: l.createdAt.toISOString(),
        event: l.event
          ? {
              id: l.event.id,
              clientName: l.event.clientName,
              eventStatus: l.event.eventStatus,
              paymentStatus: l.event.paymentStatus,
            }
          : null,
      })),
    );
  } catch (err) {
    console.error("[API] GET /api/booking/links error:", err);
    return internalError();
  }
}

/**
 * POST /api/booking/links
 * Create a new booking link with snapshot data.
 */
export async function POST(request: NextRequest) {
  const { businessProfileId, error } = await requireBusinessProfile();
  if (error) return error;

  try {
    const body = await request.json();
    const result = validate(createBookingLinkSchema, body);
    if (result.error)
      return validationError("Validation failed.", result.error);

    const link = await createBookingLink(businessProfileId, result.data);

    return createdResponse({
      id: link.id,
      token: link.token,
      expiresAt: link.expiresAt.toISOString(),
      totalAmount: link.totalAmount ? String(link.totalAmount) : null,
    });
  } catch (err) {
    console.error("[API] POST /api/booking/links error:", err);
    return internalError();
  }
}
