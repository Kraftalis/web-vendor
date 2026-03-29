import { z } from "zod";
import type { PackageSnapshot, AddOnSnapshot } from "@/services/booking";

// ─── Zod schema ──────────────────────────────────────────────

export const bookingLinkSchema = z.object({
  clientName: z.string(),
  clientPhone: z.string(),
  eventCategoryId: z.string(),
  eventLocation: z.string(),
  scheduleDates: z.array(
    z.object({
      date: z.string(),
      startTime: z.string(),
      endTime: z.string(),
      label: z.string(),
    }),
  ),
  packageMode: z.enum(["existing", "custom"]),
  selectedPkgId: z.string(),
  selectedVariationId: z.string(),
  customPkgName: z.string(),
  customPkgPrice: z.string(),
  customPkgInclusions: z.string(),
  selectedAddOnIds: z.array(z.string()),
  customAddOns: z.array(z.object({ name: z.string(), price: z.string() })),
  paymentType: z.enum(["DOWN_PAYMENT", "FULL_PAYMENT", ""]),
  paymentAmount: z.string(),
  paymentReceipt: z.instanceof(File).nullable(),
  paymentNote: z.string(),
});

export type BookingLinkFormValues = z.infer<typeof bookingLinkSchema>;

// Keep old name as alias for backward compat
export type BookingLinkFormState = BookingLinkFormValues;

export interface CustomAddOnDraft {
  name: string;
  price: string;
}

// ─── Source package/addon from pricing master ───────────────

export interface SourcePackage {
  id: string;
  name: string;
  description: string | null;
  price: string;
  currency: string;
  inclusions: string[];
  eventCategoryId?: string | null;
  items: SourceVariation[];
}

export interface SourceVariation {
  id: string;
  label: string;
  description: string | null;
  price: string;
  inclusions: string[];
}

export interface SourceAddOn {
  id: string;
  name: string;
  description: string | null;
  price: string;
  currency: string;
}

// ─── Build snapshots from form state ────────────────────────

export function buildPackageSnapshot(
  state: BookingLinkFormState,
  packages: SourcePackage[],
): PackageSnapshot | null {
  if (state.packageMode === "custom") {
    const price = parseFloat(state.customPkgPrice) || 0;
    const inclusions = state.customPkgInclusions
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    return {
      name: state.customPkgName.trim(),
      description: null,
      price,
      currency: "IDR",
      variationLabel: null,
      inclusions,
      isCustom: true,
    };
  }

  // Existing package
  const pkg = packages.find((p) => p.id === state.selectedPkgId);
  if (!pkg) return null;

  const variation = pkg.items.find((v) => v.id === state.selectedVariationId);
  const price = variation
    ? parseFloat(variation.price) || 0
    : parseFloat(pkg.price) || 0;

  // Prefer variation-level inclusions when a variation is selected
  const inclusions =
    variation && variation.inclusions.length > 0
      ? variation.inclusions
      : pkg.inclusions;

  return {
    name: pkg.name,
    description: pkg.description,
    price,
    currency: pkg.currency,
    variationLabel: variation?.label ?? null,
    inclusions,
    isCustom: false,
  };
}

export function buildAddOnsSnapshot(
  state: BookingLinkFormState,
  addOns: SourceAddOn[],
): AddOnSnapshot[] | null {
  const result: AddOnSnapshot[] = [];

  // Existing add-ons
  for (const id of state.selectedAddOnIds) {
    const ao = addOns.find((a) => a.id === id);
    if (ao) {
      result.push({
        name: ao.name,
        description: ao.description,
        price: parseFloat(ao.price) || 0,
        currency: ao.currency,
        quantity: 1,
        isCustom: false,
      });
    }
  }

  // Custom add-ons
  for (const c of state.customAddOns) {
    if (c.name.trim() && c.price) {
      result.push({
        name: c.name.trim(),
        description: null,
        price: parseFloat(c.price) || 0,
        currency: "IDR",
        quantity: 1,
        isCustom: true,
      });
    }
  }

  return result.length > 0 ? result : null;
}

// ─── Calculate total ────────────────────────────────────────

export function calculateTotal(
  pkgSnapshot: PackageSnapshot | null,
  addOnsSnapshot: AddOnSnapshot[] | null,
): number {
  const pkgPrice = pkgSnapshot?.price ?? 0;
  const addOnsTotal =
    addOnsSnapshot?.reduce((s, a) => s + a.price * a.quantity, 0) ?? 0;
  return pkgPrice + addOnsTotal;
}
