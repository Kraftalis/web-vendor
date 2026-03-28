import { prisma } from "@/lib/prisma";
import type {
  CreateEventInput,
  UpdateEventInput,
} from "@/lib/validations/event";

/**
 * Create a new event for a business profile.
 */
export async function createEvent(
  businessProfileId: string,
  data: CreateEventInput,
) {
  return prisma.event.create({
    data: {
      businessProfileId,
      clientName: data.clientName,
      clientPhone: data.clientPhone,
      clientPhoneSecondary: data.clientPhoneSecondary ?? undefined,
      clientEmail: data.clientEmail ?? undefined,
      eventType: data.eventType ?? "",
      eventCategoryId: data.eventCategoryId ?? undefined,
      eventDate: new Date(data.eventDate),
      eventTime: data.eventTime ?? undefined,
      eventLocation: data.eventLocation ?? undefined,
      eventLocationUrl: data.eventLocationUrl ?? undefined,
      packageSnapshot: data.packageSnapshot ?? undefined,
      addOnsSnapshot: data.addOnsSnapshot ?? undefined,
      amount: data.amount ?? undefined,
      currency: data.currency ?? "IDR",
      notes: data.notes ?? undefined,
    },
    include: {
      eventCategory: { select: { id: true, name: true } },
      bookingLink: { select: { token: true } },
      payments: true,
    },
  });
}

/**
 * Update an existing event.
 */
export async function updateEvent(id: string, data: UpdateEventInput) {
  const updateData: Record<string, unknown> = { ...data };

  // Convert date string to Date if provided
  if (data.eventDate) {
    updateData.eventDate = new Date(data.eventDate);
  }

  // Normalise empty strings to null for optional foreign-key fields
  if (
    "eventCategoryId" in updateData &&
    (updateData.eventCategoryId === "" ||
      updateData.eventCategoryId === undefined)
  ) {
    updateData.eventCategoryId = null;
  }

  return prisma.event.update({
    where: { id },
    data: updateData,
    include: {
      eventCategory: { select: { id: true, name: true } },
      bookingLink: { select: { token: true } },
      payments: true,
    },
  });
}
