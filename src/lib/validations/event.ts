import { z } from "zod";

// ─── Event creation (from vendor side) ──────────────────────

export const createEventSchema = z.object({
  clientName: z.string().min(1, "Client name is required.").max(255),
  clientPhone: z.string().min(1, "Phone number is required.").max(50),
  clientPhoneSecondary: z.string().max(50).optional().nullable(),
  clientEmail: z
    .string()
    .email("Invalid email.")
    .max(320)
    .optional()
    .nullable(),
  eventType: z.string().max(100).optional().nullable(),
  eventCategoryId: z.string().uuid("Invalid category.").optional().nullable(),
  eventDate: z.string().min(1, "Event date is required."), // ISO date string
  eventTime: z.string().max(20).optional().nullable(),
  eventLocation: z.string().max(2000).optional().nullable(),
  eventLocationUrl: z.string().max(2000).optional().nullable(),
  packageSnapshot: z.any().optional().nullable(),
  addOnsSnapshot: z.any().optional().nullable(),
  amount: z
    .union([
      z.number(),
      z.string().transform((v) => (v === "" ? null : Number(v))),
    ])
    .pipe(z.number().min(0).nullable())
    .optional()
    .nullable(),
  currency: z.string().max(10).optional().default("IDR"),
  notes: z.string().max(5000).optional().nullable(),
});

export const updateEventSchema = createEventSchema.partial().extend({
  eventStatus: z
    .enum(["INQUIRY", "WAITING_CONFIRMATION", "BOOKED", "ONGOING", "COMPLETED"])
    .optional(),
  paymentStatus: z.enum(["UNPAID", "DP_PAID", "PAID"]).optional(),
});

// ─── Booking (from client side via booking link) ────────────

export const bookingSubmitSchema = z.object({
  token: z.string().min(1, "Token is required."),
  clientName: z.string().min(1, "Client name is required.").max(255),
  clientPhone: z.string().min(1, "Phone number is required.").max(50),
  clientEmail: z
    .string()
    .email("Invalid email.")
    .max(320)
    .optional()
    .nullable(),
  eventType: z.string().min(1, "Event type is required.").max(100),
  eventDate: z.string().min(1, "Event date is required."),
  eventTime: z.string().max(20).optional().nullable(),
  eventLocation: z.string().max(2000).optional().nullable(),
  packageSnapshot: z.any().optional().nullable(),
  addOnsSnapshot: z.any().optional().nullable(),
  amount: z.number().optional().nullable(),
  currency: z.string().max(10).optional().default("IDR"),
  notes: z.string().max(5000).optional().nullable(),
});

// ─── Inferred types ─────────────────────────────────────────

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type BookingSubmitInput = z.infer<typeof bookingSubmitSchema>;
