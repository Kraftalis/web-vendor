import { prisma } from "@/lib/prisma";

/**
 * Find all events belonging to a business profile (list view).
 * Includes the latest unverified client payment for quick-action.
 */
export async function findEventsByVendor(businessProfileId: string) {
  return prisma.event.findMany({
    where: { businessProfileId },
    orderBy: { createdAt: "desc" },
    include: {
      eventCategory: { select: { id: true, name: true, color: true } },
      bookingLink: { select: { token: true } },
      schedules: { orderBy: { sortOrder: "asc" } },
      payments: {
        where: { isVerified: false, paidBy: "CLIENT" },
        orderBy: { paidAt: "desc" },
        take: 1,
      },
    },
  });
}

/**
 * Find a single event by ID with full details.
 */
export async function findEventById(id: string) {
  return prisma.event.findUnique({
    where: { id },
    include: {
      eventCategory: { select: { id: true, name: true } },
      bookingLink: { select: { token: true } },
      schedules: { orderBy: { sortOrder: "asc" } },
      payments: { orderBy: { paidAt: "desc" } },
    },
  });
}

/**
 * Find event by booking link token (for public booking portal).
 */
export async function findEventByBookingToken(token: string) {
  const link = await prisma.bookingLink.findUnique({
    where: { token },
    include: {
      event: {
        include: {
          payments: { orderBy: { paidAt: "desc" } },
        },
      },
    },
  });
  return link;
}
