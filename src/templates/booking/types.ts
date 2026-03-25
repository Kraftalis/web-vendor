import type { BadgeVariant } from "@/components/ui";

// ─── Snapshot types (matches DB JSONB) ──────────────────────

export interface PackageSnapshotData {
  name: string;
  description: string | null;
  price: number;
  currency: string;
  variationLabel: string | null;
  inclusions: string[];
  isCustom?: boolean;
}

export interface AddOnSnapshotData {
  name: string;
  description: string | null;
  price: number;
  currency: string;
  quantity: number;
  isCustom?: boolean;
}

// ─── Vendor package / add-on (for booking form - from vendor catalog) ───

export interface VendorPackageVariation {
  id: string;
  label: string;
  description: string | null;
  price: string;
}

export interface VendorPackage {
  id: string;
  name: string;
  description: string | null;
  price: string; // base / fallback price
  currency: string;
  inclusions: string[];
  items: VendorPackageVariation[]; // price variations (empty = flat price)
}

export interface VendorAddOn {
  id: string;
  name: string;
  description: string | null;
  price: string;
  currency: string;
}

// ─── Payment record ─────────────────────────────────────────

export interface PortalPayment {
  id: string;
  amount: string;
  paymentType: string;
  receiptUrl: string | null;
  receiptName: string | null;
  note: string | null;
  isVerified: boolean;
  paidAt: string;
  createdAt: string;
}

// ─── Booking portal event (from GET /api/booking/[token]) ───

export interface PortalEvent {
  id: string;
  clientName: string;
  clientPhone: string;
  clientPhoneSecondary: string | null;
  clientEmail: string | null;
  eventType: string;
  eventDate: string;
  eventTime: string | null;
  eventLocation: string | null;
  eventLocationUrl: string | null;
  packageSnapshot: PackageSnapshotData | null;
  addOnsSnapshot: AddOnSnapshotData[] | null;
  amount: string | null;
  currency: string;
  eventStatus: string;
  paymentStatus: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  payments: PortalPayment[];
}

// ─── Full booking link data (from API) ──────────────────────

export interface BookingLinkFullData {
  token: string;
  status: "valid" | "expired" | "used";
  vendorId: string;
  vendor: {
    id: string;
    name: string | null;
    image: string | null;
  };
  clientName: string | null;
  clientPhone: string | null;
  clientPhoneSecondary: string | null;
  eventDate: string | null;
  eventTime: string | null;
  eventLocation: string | null;
  eventLocationUrl: string | null;
  packageSnapshot: PackageSnapshotData | null;
  addOnsSnapshot: AddOnSnapshotData[] | null;
  totalAmount: string | null;
  expiresAt: string;
  event: PortalEvent | null;
}

// ─── Status helpers ─────────────────────────────────────────

export const EVENT_STATUS_STEPS = [
  "INQUIRY",
  "WAITING_CONFIRMATION",
  "BOOKED",
  "ONGOING",
  "COMPLETED",
] as const;

export function eventStatusVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    INQUIRY: "info",
    WAITING_CONFIRMATION: "warning",
    BOOKED: "success",
    ONGOING: "primary",
    COMPLETED: "default",
  };
  return map[status] ?? "default";
}

export function paymentStatusVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    UNPAID: "danger",
    DP_PAID: "warning",
    PAID: "success",
  };
  return map[status] ?? "default";
}

export function formatCurrency(
  amount: string | number | null,
  currency = "IDR",
): string {
  if (amount === null || amount === undefined) return "-";
  const num = typeof amount === "number" ? amount : parseFloat(amount);
  if (isNaN(num)) return "-";
  return `${currency} ${num.toLocaleString()}`;
}
