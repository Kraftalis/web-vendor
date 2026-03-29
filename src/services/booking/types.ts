// ─── Schedule date snapshot ─────────────────────────────────

export interface ScheduleDateItem {
  date: string;
  startTime: string | null;
  endTime: string | null;
  label: string | null;
}

// ─── Snapshot types (frontend-safe) ─────────────────────────

export interface PackageSnapshot {
  name: string;
  description: string | null;
  price: number;
  currency: string;
  variationLabel: string | null;
  inclusions: string[];
  isCustom: boolean;
}

export interface AddOnSnapshot {
  name: string;
  description: string | null;
  price: number;
  currency: string;
  quantity: number;
  isCustom: boolean;
}

// ─── Booking link ───────────────────────────────────────────

export interface BookingLinkItem {
  id: string;
  token: string;
  clientName: string | null;
  clientPhone: string | null;
  eventCategoryId: string | null;
  eventDate: string | null;
  eventTime: string | null;
  eventLocation: string | null;
  scheduleDates: ScheduleDateItem[] | null;
  packageSnapshot: PackageSnapshot | null;
  addOnsSnapshot: AddOnSnapshot[] | null;
  totalAmount: string | null;
  expiresAt: string;
  createdAt: string;
  event: {
    id: string;
    clientName: string;
    eventStatus: string;
    paymentStatus: string;
  } | null;
}

// ─── Create payload ─────────────────────────────────────────

export interface BookingLinkPaymentData {
  paymentType: "DOWN_PAYMENT" | "FULL_PAYMENT";
  amount: number;
  note?: string;
  receiptUrl?: string;
  receiptName?: string;
}

export interface CreateBookingLinkPayload {
  clientName?: string | null;
  clientPhone?: string | null;
  eventCategoryId?: string | null;
  eventDate?: string | null;
  eventTime?: string | null;
  eventLocation?: string | null;
  scheduleDates?: ScheduleDateItem[] | null;
  packageSnapshot?: PackageSnapshot | null;
  addOnsSnapshot?: AddOnSnapshot[] | null;
  expiresInDays?: number;
  payment?: BookingLinkPaymentData;
}

// ─── Update payload ─────────────────────────────────────────

export interface UpdateBookingLinkPayload {
  clientName?: string | null;
  clientPhone?: string | null;
  eventCategoryId?: string | null;
  eventDate?: string | null;
  eventTime?: string | null;
  eventLocation?: string | null;
  scheduleDates?: ScheduleDateItem[] | null;
  packageSnapshot?: PackageSnapshot | null;
  addOnsSnapshot?: AddOnSnapshot[] | null;
  payment?: BookingLinkPaymentData;
}

// ─── Create response ────────────────────────────────────────

export interface CreateBookingLinkResponse {
  id: string;
  token: string;
  expiresAt: string;
  totalAmount: string | null;
}
