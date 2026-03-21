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
  eventDate: string | null;
  eventTime: string | null;
  eventLocation: string | null;
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

export interface CreateBookingLinkPayload {
  clientName?: string | null;
  clientPhone?: string | null;
  eventDate?: string | null;
  eventTime?: string | null;
  eventLocation?: string | null;
  packageSnapshot?: PackageSnapshot | null;
  addOnsSnapshot?: AddOnSnapshot[] | null;
  expiresInDays?: number;
}

// ─── Update payload ─────────────────────────────────────────

export interface UpdateBookingLinkPayload {
  clientName?: string | null;
  clientPhone?: string | null;
  eventDate?: string | null;
  eventTime?: string | null;
  eventLocation?: string | null;
  packageSnapshot?: PackageSnapshot | null;
  addOnsSnapshot?: AddOnSnapshot[] | null;
}

// ─── Create response ────────────────────────────────────────

export interface CreateBookingLinkResponse {
  id: string;
  token: string;
  expiresAt: string;
  totalAmount: string | null;
}
