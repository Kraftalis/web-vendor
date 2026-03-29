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
  return prisma.$transaction(async (tx) => {
    const event = await tx.event.create({
      data: {
        businessProfileId,
        clientName: data.clientName,
        clientPhone: data.clientPhone,
        clientPhoneSecondary: data.clientPhoneSecondary ?? undefined,
        clientEmail: data.clientEmail ?? undefined,
        eventType: data.eventType ?? "",
        eventCategoryId: data.eventCategoryId ?? undefined,
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
        schedules: { orderBy: { sortOrder: "asc" } },
        payments: true,
      },
    });

    // Create schedule dates if provided
    if (data.schedules && data.schedules.length > 0) {
      await tx.eventSchedule.createMany({
        data: data.schedules.map((s, idx) => ({
          eventId: event.id,
          date: new Date(s.date),
          startTime: s.startTime ?? null,
          endTime: s.endTime ?? null,
          label: s.label ?? null,
          sortOrder: idx,
        })),
      });

      // Re-fetch to include newly created schedules
      return tx.event.findUniqueOrThrow({
        where: { id: event.id },
        include: {
          eventCategory: { select: { id: true, name: true } },
          bookingLink: { select: { token: true } },
          schedules: { orderBy: { sortOrder: "asc" } },
          payments: true,
        },
      });
    }

    return event;
  });
}

/**
 * Update an existing event.
 * Handles schedule upsert: delete removed, update existing, create new.
 */
export async function updateEvent(id: string, data: UpdateEventInput) {
  const { schedules, ...rest } = data;
  const updateData: Record<string, unknown> = { ...rest };

  // Normalise empty strings to null for optional foreign-key fields
  if (
    "eventCategoryId" in updateData &&
    (updateData.eventCategoryId === "" ||
      updateData.eventCategoryId === undefined)
  ) {
    updateData.eventCategoryId = null;
  }

  // Remove 'schedules' from the flat update data (handled separately)
  delete updateData.schedules;

  return prisma.$transaction(async (tx) => {
    const event = await tx.event.update({
      where: { id },
      data: updateData,
      include: {
        eventCategory: { select: { id: true, name: true } },
        bookingLink: { select: { token: true } },
        schedules: { orderBy: { sortOrder: "asc" } },
        payments: true,
      },
    });

    // Sync schedules if provided
    if (schedules !== undefined) {
      const incoming = schedules ?? [];

      // Get existing schedule IDs
      const existingIds = event.schedules.map((s) => s.id);
      const incomingIds = incoming.filter((s) => s.id).map((s) => s.id!);

      // Delete removed schedules
      const toDelete = existingIds.filter((eid) => !incomingIds.includes(eid));
      if (toDelete.length > 0) {
        await tx.eventSchedule.deleteMany({
          where: { id: { in: toDelete } },
        });
      }

      // Upsert each schedule
      for (let idx = 0; idx < incoming.length; idx++) {
        const s = incoming[idx];
        if (s.id && existingIds.includes(s.id)) {
          // Update existing
          await tx.eventSchedule.update({
            where: { id: s.id },
            data: {
              date: new Date(s.date),
              startTime: s.startTime ?? null,
              endTime: s.endTime ?? null,
              label: s.label ?? null,
              sortOrder: idx,
            },
          });
        } else {
          // Create new
          await tx.eventSchedule.create({
            data: {
              eventId: id,
              date: new Date(s.date),
              startTime: s.startTime ?? null,
              endTime: s.endTime ?? null,
              label: s.label ?? null,
              sortOrder: idx,
            },
          });
        }
      }

      // Re-fetch to include updated schedules
      return tx.event.findUniqueOrThrow({
        where: { id },
        include: {
          eventCategory: { select: { id: true, name: true } },
          bookingLink: { select: { token: true } },
          schedules: { orderBy: { sortOrder: "asc" } },
          payments: true,
        },
      });
    }

    return event;
  });
}
