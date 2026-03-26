import { z } from "zod";

// ─── Package snapshot shape ─────────────────────────────────

export const packageSnapshotSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  price: z.number().min(0),
  currency: z.string().default("IDR"),
  variationLabel: z.string().nullable().optional(),
  inclusions: z.array(z.string()).default([]),
  isCustom: z.boolean().default(false),
});

// ─── Add-on snapshot shape ──────────────────────────────────

export const addOnSnapshotSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  price: z.number().min(0),
  currency: z.string().default("IDR"),
  quantity: z.number().int().min(1).default(1),
  isCustom: z.boolean().default(false),
});

// ─── Payment data embedded in booking link creation ─────────

export const bookingLinkPaymentSchema = z.object({
  paymentType: z.enum(["DOWN_PAYMENT", "FULL_PAYMENT"]),
  amount: z.number().min(1),
  note: z.string().max(2000).optional(),
  receiptUrl: z.string().url().optional(),
  receiptName: z.string().max(255).optional(),
});

// ─── Create booking link (vendor side) ──────────────────────

export const createBookingLinkSchema = z.object({
  clientName: z.string().max(255).optional().nullable(),
  clientPhone: z.string().max(50).optional().nullable(),
  eventCategoryId: z.string().uuid().optional().nullable(),
  eventDate: z.string().optional().nullable(), // ISO date
  eventTime: z.string().max(20).optional().nullable(),
  eventLocation: z.string().max(2000).optional().nullable(),
  packageSnapshot: packageSnapshotSchema.optional().nullable(),
  addOnsSnapshot: z.array(addOnSnapshotSchema).optional().nullable(),
  expiresInDays: z.number().int().min(1).max(90).default(30),
  payment: bookingLinkPaymentSchema.optional(),
});

// ─── Update booking link (vendor side) ──────────────────────

export const updateBookingLinkSchema = z.object({
  clientName: z.string().max(255).optional().nullable(),
  clientPhone: z.string().max(50).optional().nullable(),
  eventCategoryId: z.string().uuid().optional().nullable(),
  eventDate: z.string().optional().nullable(),
  eventTime: z.string().max(20).optional().nullable(),
  eventLocation: z.string().max(2000).optional().nullable(),
  packageSnapshot: packageSnapshotSchema.optional().nullable(),
  addOnsSnapshot: z.array(addOnSnapshotSchema).optional().nullable(),
  payment: bookingLinkPaymentSchema.optional(),
});

// ─── Inferred types ─────────────────────────────────────────

export type PackageSnapshotData = z.infer<typeof packageSnapshotSchema>;
export type AddOnSnapshotData = z.infer<typeof addOnSnapshotSchema>;
export type CreateBookingLinkInput = z.infer<typeof createBookingLinkSchema>;
export type UpdateBookingLinkInput = z.infer<typeof updateBookingLinkSchema>;
