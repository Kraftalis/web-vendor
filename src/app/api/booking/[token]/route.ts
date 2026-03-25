import { NextRequest } from "next/server";
import { successResponse, notFoundError, internalError } from "@/lib/api";
import { findBookingLinkByToken } from "@/repositories/booking";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ token: string }>;
}

/**
 * GET /api/booking/[token]
 * Public endpoint — returns booking link data + event (if exists) for the client portal.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params;

    const link = await findBookingLinkByToken(token);
    if (!link) return notFoundError("Booking link not found.");

    const now = new Date();
    const isExpired = link.expiresAt < now;
    const hasEvent = !!link.eventId;

    // Determine status
    let status: "valid" | "expired" | "used" = "valid";
    if (hasEvent) status = "used"; // has event = form was submitted
    if (isExpired && !hasEvent) status = "expired";

    // If event exists, fetch full event with payments
    let event = null;
    if (link.eventId) {
      const fullEvent = await prisma.event.findUnique({
        where: { id: link.eventId },
        include: {
          payments: { orderBy: { paidAt: "desc" } },
        },
      });

      if (fullEvent) {
        event = {
          id: fullEvent.id,
          clientName: fullEvent.clientName,
          clientPhone: fullEvent.clientPhone,
          clientPhoneSecondary: fullEvent.clientPhoneSecondary,
          clientEmail: fullEvent.clientEmail,
          eventType: fullEvent.eventType,
          eventDate: fullEvent.eventDate.toISOString(),
          eventTime: fullEvent.eventTime,
          eventLocation: fullEvent.eventLocation,
          eventLocationUrl: fullEvent.eventLocationUrl,
          packageSnapshot: fullEvent.packageSnapshot,
          addOnsSnapshot: fullEvent.addOnsSnapshot,
          amount: fullEvent.amount ? String(fullEvent.amount) : null,
          currency: fullEvent.currency,
          eventStatus: fullEvent.eventStatus,
          paymentStatus: fullEvent.paymentStatus,
          notes: fullEvent.notes,
          createdAt: fullEvent.createdAt.toISOString(),
          updatedAt: fullEvent.updatedAt.toISOString(),
          payments: fullEvent.payments.map((p) => ({
            id: p.id,
            amount: String(p.amount),
            paymentType: p.paymentType,
            receiptUrl: p.receiptUrl,
            receiptName: p.receiptName,
            note: p.note,
            isVerified: p.isVerified,
            paidAt: p.paidAt.toISOString(),
            createdAt: p.createdAt.toISOString(),
          })),
        };
      }
    }

    return successResponse({
      token: link.token,
      status,
      vendorId: link.businessProfileId,
      vendor: {
        id: link.businessProfile.id,
        name: link.businessProfile.businessName,
        image: link.businessProfile.logoUrl,
      },
      // Booking link data (pre-filled by vendor)
      clientName: link.clientName,
      clientPhone: link.clientPhone,
      clientPhoneSecondary: link.clientPhoneSecondary,
      eventDate: link.eventDate?.toISOString() ?? null,
      eventTime: link.eventTime,
      eventLocation: link.eventLocation,
      eventLocationUrl: link.eventLocationUrl,
      packageSnapshot: link.packageSnapshot,
      addOnsSnapshot: link.addOnsSnapshot,
      totalAmount: link.totalAmount ? String(link.totalAmount) : null,
      expiresAt: link.expiresAt.toISOString(),
      // Event (if booking was submitted)
      event,
    });
  } catch (err) {
    console.error("[API] GET /api/booking/[token] error:", err);
    return internalError();
  }
}
