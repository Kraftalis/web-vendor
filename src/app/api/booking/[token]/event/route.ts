import { NextRequest } from "next/server";
import {
  successResponse,
  validationError,
  notFoundError,
  internalError,
  validate,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ token: string }>;
}

/**
 * Client event update schema — only fields the client is allowed to edit.
 */
const clientEventUpdateSchema = z.object({
  clientName: z.string().min(1).max(255).optional(),
  clientPhone: z.string().min(1).max(50).optional(),
  clientPhoneSecondary: z.string().max(50).optional().nullable(),
  clientEmail: z.string().email().max(320).optional().nullable(),
  eventDate: z.string().optional(),
  eventTime: z.string().max(20).optional().nullable(),
  eventLocation: z.string().max(2000).optional().nullable(),
  eventLocationUrl: z.string().url().max(2000).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
});

/**
 * PATCH /api/booking/[token]/event
 * Client self-service: update their own event details.
 * Client info (name, phone, email, location) can always be edited.
 * Event scheduling fields (date, time) only before confirmation.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params;

    // 1. Find booking link → event
    const link = await prisma.bookingLink.findUnique({
      where: { token },
      select: { eventId: true },
    });

    if (!link || !link.eventId) {
      return notFoundError("No event found for this booking link.");
    }

    // 2. Fetch event
    const event = await prisma.event.findUnique({
      where: { id: link.eventId },
      select: { eventStatus: true },
    });

    if (!event) return notFoundError("Event not found.");

    // 3. Validate body
    const body = await request.json();
    const result = validate(clientEventUpdateSchema, body);
    if (result.error)
      return validationError("Validation failed.", result.error);

    const data = result.data;

    // 4. Check if scheduling fields are being changed after confirmation
    const editableStatuses = ["INQUIRY", "WAITING_CONFIRMATION"];
    const isEarlyStage = editableStatuses.includes(event.eventStatus);

    if (!isEarlyStage && (data.eventDate || data.eventTime !== undefined)) {
      return validationError(
        "Event date/time can only be edited before confirmation.",
      );
    }

    // 5. Update event — client info fields are always allowed
    const updated = await prisma.event.update({
      where: { id: link.eventId },
      data: {
        ...(data.clientName && { clientName: data.clientName }),
        ...(data.clientPhone && { clientPhone: data.clientPhone }),
        ...(data.clientPhoneSecondary !== undefined && {
          clientPhoneSecondary: data.clientPhoneSecondary,
        }),
        ...(data.clientEmail !== undefined && {
          clientEmail: data.clientEmail,
        }),
        ...(data.eventLocation !== undefined && {
          eventLocation: data.eventLocation,
        }),
        ...(data.eventLocationUrl !== undefined && {
          eventLocationUrl: data.eventLocationUrl,
        }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });

    // Also update booking link mirror data
    await prisma.bookingLink.update({
      where: { token },
      data: {
        ...(data.clientName && { clientName: data.clientName }),
        ...(data.clientPhone && { clientPhone: data.clientPhone }),
        ...(data.clientPhoneSecondary !== undefined && {
          clientPhoneSecondary: data.clientPhoneSecondary,
        }),
        ...(data.eventLocation !== undefined && {
          eventLocation: data.eventLocation,
        }),
        ...(data.eventLocationUrl !== undefined && {
          eventLocationUrl: data.eventLocationUrl,
        }),
      },
    });

    return successResponse({
      id: updated.id,
      clientName: updated.clientName,
      clientPhone: updated.clientPhone,
      clientPhoneSecondary: updated.clientPhoneSecondary,
      clientEmail: updated.clientEmail,
      eventLocation: updated.eventLocation,
      eventLocationUrl: updated.eventLocationUrl,
      notes: updated.notes,
    });
  } catch (err) {
    console.error("[API] PATCH /api/booking/[token]/event error:", err);
    return internalError();
  }
}
