// Helper and logic functions for BookingLinkForm
import type {
  Package as PkgType,
  AddOn as AddOnType,
} from "@/services/pricing";
import type {
  BookingLinkItem,
  PackageSnapshot,
  AddOnSnapshot,
} from "@/services/booking";
import type {
  BookingLinkFormValues,
  CustomAddOnDraft,
  SourcePackage,
  SourceAddOn,
} from "./types";

export const DEFAULT_VALUES: BookingLinkFormValues = {
  clientName: "",
  clientPhone: "",
  eventCategoryId: "",
  eventLocation: "",
  scheduleDates: [{ date: "", startTime: "", endTime: "", label: "" }],
  packageMode: "existing",
  selectedPkgId: "",
  selectedVariationId: "",
  customPkgName: "",
  customPkgPrice: "",
  customPkgInclusions: "",
  selectedAddOnIds: [],
  customAddOns: [],
  paymentType: "",
  paymentAmount: "",
  paymentReceipt: null,
  paymentNote: "",
};

export function mapPackages(raw: PkgType[]): SourcePackage[] {
  return raw
    .filter((p) => p.isActive)
    .map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      currency: p.currency,
      inclusions: p.inclusions,
      eventCategoryId: p.eventCategory?.id ?? null,
      items: (p.items || []).map((v) => ({
        id: v.id,
        label: v.label,
        description: v.description,
        price: v.price,
        inclusions: v.inclusions ?? [],
      })),
    }));
}

export function mapAddOns(raw: AddOnType[]): SourceAddOn[] {
  return raw
    .filter((a) => a.isActive)
    .map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      price: a.price,
      currency: a.currency,
    }));
}

export function buildEditValues(
  link: BookingLinkItem,
  packages: SourcePackage[],
  addOns: SourceAddOn[],
): BookingLinkFormValues {
  const pkg = link.packageSnapshot as PackageSnapshot | null;
  const linkAddOns = (link.addOnsSnapshot ?? []) as AddOnSnapshot[];

  let packageMode: BookingLinkFormValues["packageMode"] = "existing";
  let selectedPkgId = "";
  let selectedVariationId = "";
  let customPkgName = "";
  let customPkgPrice = "";
  let customPkgInclusions = "";

  if (pkg) {
    if (pkg.isCustom) {
      packageMode = "custom";
      customPkgName = pkg.name;
      customPkgPrice = String(pkg.price);
      customPkgInclusions = (pkg.inclusions ?? []).join("\n");
    } else {
      const match = packages.find((p) => p.name === pkg.name);
      if (match) {
        selectedPkgId = match.id;
        if (pkg.variationLabel) {
          const varMatch = match.items.find(
            (v) => v.label === pkg.variationLabel,
          );
          if (varMatch) selectedVariationId = varMatch.id;
        }
      } else {
        packageMode = "custom";
        customPkgName = pkg.name;
        customPkgPrice = String(pkg.price);
        customPkgInclusions = (pkg.inclusions ?? []).join("\n");
      }
    }
  }

  const selectedAddOnIds: string[] = [];
  const customAddOnDrafts: CustomAddOnDraft[] = [];

  for (const la of linkAddOns) {
    if (la.isCustom) {
      customAddOnDrafts.push({ name: la.name, price: String(la.price) });
    } else {
      const match = addOns.find((a) => a.name === la.name);
      if (match) selectedAddOnIds.push(match.id);
      else customAddOnDrafts.push({ name: la.name, price: String(la.price) });
    }
  }

  // Build schedule dates from existing link
  const scheduleDates: BookingLinkFormValues["scheduleDates"] =
    (
      link.scheduleDates as
        | {
            date: string;
            startTime: string | null;
            endTime: string | null;
            label: string | null;
          }[]
        | null
    )?.map((s) => ({
      date: s.date?.slice(0, 10) ?? "",
      startTime: s.startTime ?? "",
      endTime: s.endTime ?? "",
      label: s.label ?? "",
    })) ??
    (link.eventDate
      ? [
          {
            date: link.eventDate.slice(0, 10),
            startTime: link.eventTime ?? "",
            endTime: "",
            label: "",
          },
        ]
      : [{ date: "", startTime: "", endTime: "", label: "" }]);

  return {
    ...DEFAULT_VALUES,
    clientName: link.clientName ?? "",
    clientPhone: link.clientPhone ?? "",
    eventCategoryId: link.eventCategoryId ?? "",
    eventLocation: link.eventLocation ?? "",
    scheduleDates,
    packageMode,
    selectedPkgId,
    selectedVariationId,
    customPkgName,
    customPkgPrice,
    customPkgInclusions,
    selectedAddOnIds,
    customAddOns: customAddOnDrafts,
  };
}
