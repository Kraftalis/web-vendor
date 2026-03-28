export interface BookingLinkConfig {
  clientName: string;
  location: string;
  packageId: string | null;
  variationId: string | null;
  selectedAddOnIds: string[];
  customPackage: {
    name: string;
    flatPrice: string;
    variations: { label: string; description: string; price: string }[];
  } | null;
  customAddOns: {
    name: string;
    description: string;
    price: string;
  }[];
}

// ─── Vendor package / add-on (for booking link form) ────────

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

import type { BadgeVariant } from "@/components/ui";

// ─── Event Item (list view) ─────────────────────────────────

export interface EventItem {
  id: string;
  vendorId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string | null;
  eventType: string;
  eventCategoryId: string | null;
  eventCategoryName: string | null;
  eventDate: string; // ISO
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
  /** Latest unverified client payment — for quick verify action */
  latestPendingPayment: {
    id: string;
    amount: string;
    paymentType: string;
    receiptUrl: string | null;
    paidBy: string;
    createdAt: string;
  } | null;
}

// ─── Event Detail ───────────────────────────────────────────

export interface PackageSnapshot {
  name: string;
  description?: string | null;
  price: string | number;
  inclusions?: string[];
  [key: string]: unknown;
}

export interface AddOnSnapshot {
  name: string;
  description?: string | null;
  price: string | number;
  quantity?: number;
  [key: string]: unknown;
}

export interface PaymentSerialized {
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
  clientPhoneSecondary?: string | null;
  clientEmail: string | null;
  eventType: string;
  eventCategoryId: string | null;
  eventCategoryName: string | null;
  eventDate: string;
  eventTime: string | null;
  eventLocation: string | null;
  eventLocationUrl: string | null;
  packageSnapshot: unknown;
  addOnsSnapshot: unknown;
  amount: string | null;
  currency: string;
  eventStatus: string;
  paymentStatus: "UNPAID" | "DP_PAID" | "PAID";
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  bookingToken: string | null;
  payments: PaymentSerialized[];
}

// ─── Status helpers ─────────────────────────────────────────

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
  amount: string | null,
  currency = "IDR",
): string {
  if (!amount) return "-";
  const num = parseFloat(amount);
  if (isNaN(num)) return "-";
  return `${currency} ${num.toLocaleString()}`;
}

export const EVENT_STATUSES = [
  "INQUIRY",
  "WAITING_CONFIRMATION",
  "BOOKED",
  "ONGOING",
  "COMPLETED",
] as const;

export type EventStatus = (typeof EVENT_STATUSES)[number];

export const EVENT_STATUS_COLORS: Record<string, string> = {
  INQUIRY: "bg-sky-500",
  WAITING_CONFIRMATION: "bg-amber-500",
  BOOKED: "bg-green-500",
  ONGOING: "bg-blue-500",
  COMPLETED: "bg-slate-400",
};
