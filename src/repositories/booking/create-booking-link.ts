import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import type {
  CreateBookingLinkInput,
  UpdateBookingLinkInput,
} from "@/lib/validations/booking";

/**
 * Create a booking link with snapshot data.
 */
export async function createBookingLink(
  vendorId: string,
  input: CreateBookingLinkInput,
) {
  const token = randomBytes(16).toString("hex");
  const expiresAt = new Date(
    Date.now() + (input.expiresInDays ?? 30) * 24 * 60 * 60 * 1000,
  );

  // Calculate total
  const pkgPrice = input.packageSnapshot?.price ?? 0;
  const addOnsTotal =
    input.addOnsSnapshot?.reduce(
      (sum, a) => sum + a.price * (a.quantity ?? 1),
      0,
    ) ?? 0;
  const totalAmount = pkgPrice + addOnsTotal;

  return prisma.bookingLink.create({
    data: {
      vendorId,
      token,
      expiresAt,
      clientName: input.clientName ?? undefined,
      clientPhone: input.clientPhone ?? undefined,
      eventDate: input.eventDate ? new Date(input.eventDate) : undefined,
      eventTime: input.eventTime ?? undefined,
      eventLocation: input.eventLocation ?? undefined,
      packageSnapshot: input.packageSnapshot ?? undefined,
      addOnsSnapshot: input.addOnsSnapshot ?? undefined,
      totalAmount: totalAmount > 0 ? totalAmount : undefined,
    },
  });
}

/**
 * Find a booking link by token (public).
 */
export async function findBookingLinkByToken(token: string) {
  return prisma.bookingLink.findUnique({
    where: { token },
    include: {
      vendor: { select: { id: true, name: true, image: true } },
      event: { select: { id: true, eventStatus: true, paymentStatus: true } },
    },
  });
}

/**
 * Find all booking links for a vendor.
 */
export async function findBookingLinksByVendor(vendorId: string) {
  return prisma.bookingLink.findMany({
    where: { vendorId },
    orderBy: { createdAt: "desc" },
    include: {
      event: {
        select: {
          id: true,
          clientName: true,
          eventStatus: true,
          paymentStatus: true,
        },
      },
    },
  });
}

/**
 * Find a single booking link by ID (for vendor).
 */
export async function findBookingLinkById(id: string) {
  return prisma.bookingLink.findUnique({
    where: { id },
    include: {
      event: { select: { id: true } },
    },
  });
}

/**
 * Update a booking link (vendor side — only if no event yet).
 * Recalculates totalAmount from snapshots.
 */
export async function updateBookingLinkById(
  id: string,
  input: UpdateBookingLinkInput,
) {
  // Calculate total from new snapshots
  const pkgPrice =
    input.packageSnapshot !== undefined
      ? (input.packageSnapshot?.price ?? 0)
      : undefined;
  const addOnsTotal =
    input.addOnsSnapshot !== undefined
      ? (input.addOnsSnapshot?.reduce(
          (sum, a) => sum + a.price * (a.quantity ?? 1),
          0,
        ) ?? 0)
      : undefined;

  let totalAmount: number | undefined;
  if (pkgPrice !== undefined || addOnsTotal !== undefined) {
    totalAmount = (pkgPrice ?? 0) + (addOnsTotal ?? 0);
  }

  return prisma.bookingLink.update({
    where: { id },
    data: {
      ...(input.clientName !== undefined && {
        clientName: input.clientName ?? undefined,
      }),
      ...(input.clientPhone !== undefined && {
        clientPhone: input.clientPhone ?? undefined,
      }),
      ...(input.eventDate !== undefined && {
        eventDate: input.eventDate ? new Date(input.eventDate) : undefined,
      }),
      ...(input.eventTime !== undefined && {
        eventTime: input.eventTime ?? undefined,
      }),
      ...(input.eventLocation !== undefined && {
        eventLocation: input.eventLocation ?? undefined,
      }),
      ...(input.packageSnapshot !== undefined && {
        packageSnapshot: input.packageSnapshot ?? undefined,
      }),
      ...(input.addOnsSnapshot !== undefined && {
        addOnsSnapshot: input.addOnsSnapshot ?? undefined,
      }),
      ...(totalAmount !== undefined && {
        totalAmount: totalAmount > 0 ? totalAmount : undefined,
      }),
    },
  });
}

/**
 * Delete a booking link (only if no event yet).
 */
export async function deleteBookingLinkById(id: string) {
  return prisma.bookingLink.delete({ where: { id } });
}
