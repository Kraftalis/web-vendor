import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import {
  findPrimaryAccount,
  createIncomeFromPayment,
} from "@/repositories/finance";
import type {
  CreateBookingLinkInput,
  UpdateBookingLinkInput,
} from "@/lib/validations/booking";

/**
 * Create a booking link with snapshot data.
 * If payment data is provided, auto-create an Event (BOOKED) + Payment record.
 */
export async function createBookingLink(
  businessProfileId: string,
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

  // If vendor provides payment data → create event + payment in a transaction
  if (input.payment) {
    return prisma.$transaction(async (tx) => {
      // 1. Create the event with BOOKED status
      const event = await tx.event.create({
        data: {
          businessProfileId,
          clientName: input.clientName ?? "—",
          clientPhone: input.clientPhone ?? "—",
          eventType: "Other",
          eventCategoryId: input.eventCategoryId ?? undefined,
          eventDate: input.eventDate ? new Date(input.eventDate) : new Date(),
          eventTime: input.eventTime ?? undefined,
          eventLocation: input.eventLocation ?? undefined,
          packageSnapshot: input.packageSnapshot ?? undefined,
          addOnsSnapshot: input.addOnsSnapshot ?? undefined,
          amount: totalAmount > 0 ? totalAmount : undefined,
          currency: "IDR",
          eventStatus: "BOOKED",
          paymentStatus:
            input.payment!.paymentType === "FULL_PAYMENT" &&
            input.payment!.amount >= totalAmount &&
            totalAmount > 0
              ? "PAID"
              : input.payment!.amount > 0
                ? "DP_PAID"
                : "UNPAID",
        },
      });

      // 2. Create the payment record (vendor-recorded → auto-verified)
      const payment = await tx.payment.create({
        data: {
          eventId: event.id,
          paymentType: input.payment!.paymentType,
          amount: input.payment!.amount,
          currency: "IDR",
          note: input.payment!.note ?? undefined,
          receiptUrl: input.payment!.receiptUrl ?? undefined,
          receiptName: input.payment!.receiptName ?? undefined,
          paidBy: "VENDOR",
          isVerified: true,
        },
      });

      // 2b. Auto-record income in primary finance account
      const primaryAccount = await findPrimaryAccount(businessProfileId);
      if (primaryAccount) {
        await createIncomeFromPayment({
          businessProfileId,
          primaryAccountId: primaryAccount.id,
          paymentId: payment.id,
          amount: input.payment!.amount,
          eventId: event.id,
          clientName: input.clientName ?? null,
          eventType: "Other",
          paymentType: input.payment!.paymentType,
          receiptUrl: input.payment!.receiptUrl ?? null,
          receiptName: input.payment!.receiptName ?? null,
        });
      }

      // 3. Create the booking link, linked to the event
      const link = await tx.bookingLink.create({
        data: {
          businessProfileId,
          token,
          expiresAt,
          eventId: event.id,
          clientName: input.clientName ?? undefined,
          clientPhone: input.clientPhone ?? undefined,
          eventCategoryId: input.eventCategoryId ?? undefined,
          eventDate: input.eventDate ? new Date(input.eventDate) : undefined,
          eventTime: input.eventTime ?? undefined,
          eventLocation: input.eventLocation ?? undefined,
          packageSnapshot: input.packageSnapshot ?? undefined,
          addOnsSnapshot: input.addOnsSnapshot ?? undefined,
          totalAmount: totalAmount > 0 ? totalAmount : undefined,
        },
      });

      return link;
    });
  }

  // No payment → simple booking link creation (original flow)
  return prisma.bookingLink.create({
    data: {
      businessProfileId,
      token,
      expiresAt,
      clientName: input.clientName ?? undefined,
      clientPhone: input.clientPhone ?? undefined,
      eventCategoryId: input.eventCategoryId ?? undefined,
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
      businessProfile: {
        select: {
          id: true,
          userId: true,
          businessName: true,
          logoUrl: true,
          email: true,
          phoneNumber: true,
        },
      },
      event: { select: { id: true, eventStatus: true, paymentStatus: true } },
    },
  });
}

/**
 * Find all booking links for a business profile.
 */
export async function findBookingLinksByVendor(businessProfileId: string) {
  return prisma.bookingLink.findMany({
    where: { businessProfileId },
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
 * If payment data is provided, auto-create Event + Payment (same as create flow).
 */
export async function updateBookingLinkById(
  id: string,
  input: UpdateBookingLinkInput,
  businessProfileId?: string,
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

  // If vendor provides payment data → create event + payment in a transaction
  if (input.payment && businessProfileId) {
    const total = totalAmount ?? 0;

    return prisma.$transaction(async (tx) => {
      // 1. Create the event
      const event = await tx.event.create({
        data: {
          businessProfileId,
          clientName: input.clientName ?? "—",
          clientPhone: input.clientPhone ?? "—",
          eventType: "Other",
          eventCategoryId: input.eventCategoryId ?? undefined,
          eventDate: input.eventDate ? new Date(input.eventDate) : new Date(),
          eventTime: input.eventTime ?? undefined,
          eventLocation: input.eventLocation ?? undefined,
          packageSnapshot: input.packageSnapshot ?? undefined,
          addOnsSnapshot: input.addOnsSnapshot ?? undefined,
          amount: total > 0 ? total : undefined,
          currency: "IDR",
          eventStatus: "BOOKED",
          paymentStatus:
            input.payment!.paymentType === "FULL_PAYMENT" &&
            input.payment!.amount >= total &&
            total > 0
              ? "PAID"
              : input.payment!.amount > 0
                ? "DP_PAID"
                : "UNPAID",
        },
      });

      // 2. Create payment record
      const payment = await tx.payment.create({
        data: {
          eventId: event.id,
          paymentType: input.payment!.paymentType,
          amount: input.payment!.amount,
          currency: "IDR",
          note: input.payment!.note ?? undefined,
          receiptUrl: input.payment!.receiptUrl ?? undefined,
          receiptName: input.payment!.receiptName ?? undefined,
          paidBy: "VENDOR",
          isVerified: true,
        },
      });

      // 2b. Auto-record income in primary finance account
      const primaryAccount = await findPrimaryAccount(businessProfileId);
      if (primaryAccount) {
        await createIncomeFromPayment({
          businessProfileId,
          primaryAccountId: primaryAccount.id,
          paymentId: payment.id,
          amount: input.payment!.amount,
          eventId: event.id,
          clientName: input.clientName ?? null,
          eventType: "Other",
          paymentType: input.payment!.paymentType,
          receiptUrl: input.payment!.receiptUrl ?? null,
          receiptName: input.payment!.receiptName ?? null,
        });
      }

      // 3. Update the booking link with data + event link
      return tx.bookingLink.update({
        where: { id },
        data: {
          eventId: event.id,
          ...(input.clientName !== undefined && {
            clientName: input.clientName ?? undefined,
          }),
          ...(input.clientPhone !== undefined && {
            clientPhone: input.clientPhone ?? undefined,
          }),
          ...(input.eventCategoryId !== undefined && {
            eventCategoryId: input.eventCategoryId ?? undefined,
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
          ...(total !== undefined && {
            totalAmount: total > 0 ? total : undefined,
          }),
        },
      });
    });
  }

  // No payment → simple update
  return prisma.bookingLink.update({
    where: { id },
    data: {
      ...(input.clientName !== undefined && {
        clientName: input.clientName ?? undefined,
      }),
      ...(input.clientPhone !== undefined && {
        clientPhone: input.clientPhone ?? undefined,
      }),
      ...(input.eventCategoryId !== undefined && {
        eventCategoryId: input.eventCategoryId ?? undefined,
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
