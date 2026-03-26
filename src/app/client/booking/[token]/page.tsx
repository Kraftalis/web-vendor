import BookingFormTemplate from "@/templates/booking/booking-form-template";
import { cookies } from "next/headers";
import { getDictionary } from "@/i18n/get-dictionary";
import { defaultLocale, type Locale } from "@/i18n/config";
import { findBookingLinkByToken } from "@/repositories/booking";
import { prisma } from "@/lib/prisma";
import type { BookingLinkFullData } from "@/templates/booking/types";

interface BookingPageProps {
  params: Promise<{ token: string }>;
}

// ─── Page ───────────────────────────────────────────────────

export default async function BookingPage({ params }: BookingPageProps) {
  const { token } = await params;

  // Determine locale for SSR
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value;
  const locale: Locale =
    localeCookie === "en" || localeCookie === "id"
      ? localeCookie
      : defaultLocale;
  const dict = await getDictionary(locale);

  // ─── Fetch booking link from DB ────────────────────────
  const link = await findBookingLinkByToken(token);

  if (!link) {
    return (
      <BookingFormTemplate
        token={token}
        serverDict={dict}
        serverLocale={locale}
        bookingData={null}
      />
    );
  }

  // Determine status
  const now = new Date();
  const isExpired = link.expiresAt < now;
  const hasEvent = !!link.eventId;

  let status: "valid" | "expired" | "used" = "valid";
  if (hasEvent) status = "used";
  if (isExpired && !hasEvent) status = "expired";

  // Build event data if exists
  let event: BookingLinkFullData["event"] = null;
  if (link.eventId) {
    const fullEvent = await prisma.event.findUnique({
      where: { id: link.eventId },
      include: { payments: { orderBy: { paidAt: "desc" } } },
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
        packageSnapshot:
          fullEvent.packageSnapshot as PortalEventType["packageSnapshot"],
        addOnsSnapshot:
          fullEvent.addOnsSnapshot as PortalEventType["addOnsSnapshot"],
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

  // Fetch vendor packages & addons is no longer needed
  // since all data is pre-filled in the booking link snapshots

  const bookingData: BookingLinkFullData = {
    token: link.token,
    status,
    vendorId: link.businessProfileId,
    vendor: {
      id: link.businessProfile.id,
      name: link.businessProfile.businessName,
      image: link.businessProfile.logoUrl,
    },
    clientName: link.clientName,
    clientPhone: link.clientPhone,
    clientPhoneSecondary: link.clientPhoneSecondary,
    eventDate: link.eventDate?.toISOString() ?? null,
    eventTime: link.eventTime,
    eventLocation: link.eventLocation,
    eventLocationUrl: link.eventLocationUrl,
    packageSnapshot:
      link.packageSnapshot as BookingLinkFullData["packageSnapshot"],
    addOnsSnapshot:
      link.addOnsSnapshot as BookingLinkFullData["addOnsSnapshot"],
    totalAmount: link.totalAmount ? String(link.totalAmount) : null,
    expiresAt: link.expiresAt.toISOString(),
    event,
  };

  return (
    <BookingFormTemplate
      token={token}
      serverDict={dict}
      serverLocale={locale}
      bookingData={bookingData}
    />
  );
}

// Helper type alias for casting
type PortalEventType = NonNullable<BookingLinkFullData["event"]>;
