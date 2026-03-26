// ─── Event list item ────────────────────────────────────────

export interface EventItem {
  id: string;
  vendorId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string | null;
  eventType: string;
  eventCategoryId: string | null;
  eventCategoryName: string | null;
  eventDate: string;
  eventTime: string | null;
  eventLocation: string | null;
  packageName: string | null;
  packageSnapshot: unknown;
  addOnsSnapshot: unknown;
  amount: string | null;
  currency: string;
  eventStatus: string;
  paymentStatus: string;
  notes: string | null;
  bookingToken: string | null;
  createdAt: string;
  updatedAt: string;
  latestPendingPayment: {
    id: string;
    amount: string;
    paymentType: string;
    receiptUrl: string | null;
    paidBy: string;
    createdAt: string;
  } | null;
}

// ─── Event detail ───────────────────────────────────────────

export interface EventDetailPayment {
  id: string;
  amount: string;
  paymentType: string;
  receiptUrl: string | null;
  receiptName: string | null;
  note: string | null;
  isVerified: boolean;
  paidBy: string; // "VENDOR" | "CLIENT"
  createdAt: string;
}

export interface EventDetail {
  id: string;
  vendorId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string | null;
  eventType: string;
  eventDate: string;
  eventTime: string | null;
  eventLocation: string | null;
  packageSnapshot: unknown;
  addOnsSnapshot: unknown;
  amount: string | null;
  currency: string;
  eventStatus: string;
  paymentStatus: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  bookingToken: string | null;
  payments: EventDetailPayment[];
}

// ─── Payloads ───────────────────────────────────────────────

export interface CreateEventPayload {
  clientName: string;
  clientPhone: string;
  clientEmail?: string | null;
  eventType: string;
  eventDate: string;
  eventTime?: string | null;
  eventLocation?: string | null;
  packageSnapshot?: unknown;
  addOnsSnapshot?: unknown;
  amount?: number | null;
  currency?: string;
  notes?: string | null;
}

export interface UpdateEventPayload extends Partial<CreateEventPayload> {
  eventStatus?: string;
  paymentStatus?: string;
}

// ─── Booking link ───────────────────────────────────────────

export interface BookingLinkData {
  token: string;
  vendorId: string;
  vendor: { id: string; name: string | null; image: string | null };
  eventId: string | null;
  expiresAt: string;
}

export interface BookingSubmitPayload {
  token: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string | null;
  eventType: string;
  eventDate: string;
  eventTime?: string | null;
  eventLocation?: string | null;
  packageSnapshot?: unknown;
  addOnsSnapshot?: unknown;
  amount?: number;
  currency?: string;
  notes?: string | null;
}

export interface BookingSubmitResponse {
  eventId: string;
  token: string;
}

// ─── Booking link generation ────────────────────────────────

export interface GenerateBookingLinkResponse {
  token: string;
  expiresAt: string;
}
