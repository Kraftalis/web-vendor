import { NextRequest } from "next/server";
import {
  successResponse,
  validationError,
  notFoundError,
  internalError,
  validate,
} from "@/lib/api";
import { bookingSubmitSchema } from "@/lib/validations/event";
import { findBookingLinkByToken } from "@/repositories/event";
import { createEvent } from "@/repositories/event";
import { prisma } from "@/lib/prisma";
import { sendPushToUser } from "@/lib/push";

/**
 * POST /api/booking — handles public booking form submission.
 * Creates an event using snapshot data sent by the client.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = validate(bookingSubmitSchema, body);
    if (result.error)
      return validationError("Validation failed.", result.error);

    const data = result.data;

    // 1. Validate booking link
    const link = await findBookingLinkByToken(data.token);
    if (!link) return notFoundError("Invalid or expired booking link.");
    if (link.expiresAt < new Date())
      return notFoundError("Booking link has expired.");
    if (link.eventId)
      return validationError("This booking link has already been used.");

    // 2. Create event with snapshot data
    const event = await createEvent(link.businessProfileId, {
      clientName: data.clientName,
      clientPhone: data.clientPhone,
      clientEmail: data.clientEmail,
      eventType: data.eventType,
      eventLocation: data.eventLocation,
      packageSnapshot: data.packageSnapshot,
      addOnsSnapshot: data.addOnsSnapshot,
      amount: data.amount,
      currency: data.currency ?? "IDR",
      notes: data.notes,
      schedules: data.schedules,
    });

    // 3. Link event to booking link + update booking link with snapshots
    await prisma.bookingLink.update({
      where: { id: link.id },
      data: {
        eventId: event.id,
        clientName: data.clientName,
        clientPhone: data.clientPhone,
        eventLocation: data.eventLocation,
        packageSnapshot: data.packageSnapshot ?? undefined,
        addOnsSnapshot: data.addOnsSnapshot ?? undefined,
        totalAmount: data.amount ?? undefined,
      },
    });

    // 4. Update event status to WAITING_CONFIRMATION
    //    Client has submitted booking + payment; vendor needs to confirm.
    await prisma.event.update({
      where: { id: event.id },
      data: { eventStatus: "WAITING_CONFIRMATION" },
    });

    // 5. Push notification to vendor
    sendPushToUser(link.businessProfile.userId, {
      title: "📋 New Booking",
      body: `${data.clientName} submitted a booking for ${data.eventType}.`,
      url: `/event/${event.id}`,
    }).catch(() => {});

    return successResponse({
      eventId: event.id,
      token: data.token,
    });
  } catch (err) {
    console.error("[API] POST /api/booking error:", err);
    return internalError();
  }
}
