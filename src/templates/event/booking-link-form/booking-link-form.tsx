"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui";
import { useCreateBookingLink, useUpdateBookingLink } from "@/hooks/booking";
import { usePricing, useAddOns } from "@/hooks";
import type {
  Package as PkgType,
  AddOn as AddOnType,
} from "@/services/pricing";
import type {
  BookingLinkItem,
  PackageSnapshot,
  AddOnSnapshot,
} from "@/services/booking";

import ClientEventFields from "./client-event-fields";
import PackageSelector from "./package-selector";
import AddOnSelector from "./addon-selector";
import PriceSummary from "./price-summary";
import BookingLinkResult from "./booking-link-result";
import {
  type BookingLinkFormState,
  type CustomAddOnDraft,
  type SourcePackage,
  type SourceAddOn,
  buildPackageSnapshot,
  buildAddOnsSnapshot,
  calculateTotal,
} from "./types";

// ─── Helpers ────────────────────────────────────────────────

const INITIAL_STATE: BookingLinkFormState = {
  clientName: "",
  clientPhone: "",
  eventDate: "",
  eventTime: "",
  eventLocation: "",
  packageMode: "none",
  selectedPkgId: "",
  selectedVariationId: "",
  customPkgName: "",
  customPkgPrice: "",
  customPkgInclusions: "",
  selectedAddOnIds: [],
  customAddOns: [],
};

function mapPackages(raw: PkgType[]): SourcePackage[] {
  return raw
    .filter((p) => p.isActive)
    .map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      currency: p.currency,
      inclusions: p.inclusions,
      items: p.items.map((v) => ({
        id: v.id,
        label: v.label,
        description: v.description,
        price: v.price,
      })),
    }));
}

function mapAddOns(raw: AddOnType[]): SourceAddOn[] {
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

// ─── Props ──────────────────────────────────────────────────

interface Props {
  onClose?: () => void;
  editingLink?: BookingLinkItem;
  defaultEventDate?: string; // ISO date string e.g. "2026-03-25"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  labels: Record<string, any>;
}

// ─── Build initial state from an editing link ───────────────

function buildEditState(
  link: BookingLinkItem,
  packages: SourcePackage[],
  addOns: SourceAddOn[],
): BookingLinkFormState {
  const pkg = link.packageSnapshot as PackageSnapshot | null;
  const linkAddOns = (link.addOnsSnapshot ?? []) as AddOnSnapshot[];

  // Determine package mode & try to resolve existing IDs
  let packageMode: BookingLinkFormState["packageMode"] = "none";
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
      // Try to match by name in master packages
      const match = packages.find((p) => p.name === pkg.name);
      if (match) {
        packageMode = "existing";
        selectedPkgId = match.id;
        if (pkg.variationLabel) {
          const varMatch = match.items.find(
            (v) => v.label === pkg.variationLabel,
          );
          if (varMatch) selectedVariationId = varMatch.id;
        }
      } else {
        // Fallback to custom with snapshot data
        packageMode = "custom";
        customPkgName = pkg.name;
        customPkgPrice = String(pkg.price);
        customPkgInclusions = (pkg.inclusions ?? []).join("\n");
      }
    }
  }

  // Resolve existing add-on IDs by name
  const selectedAddOnIds: string[] = [];
  const customAddOnDrafts: CustomAddOnDraft[] = [];

  for (const la of linkAddOns) {
    if (la.isCustom) {
      customAddOnDrafts.push({ name: la.name, price: String(la.price) });
    } else {
      const match = addOns.find((a) => a.name === la.name);
      if (match) {
        selectedAddOnIds.push(match.id);
      } else {
        // Fallback to custom
        customAddOnDrafts.push({ name: la.name, price: String(la.price) });
      }
    }
  }

  return {
    clientName: link.clientName ?? "",
    clientPhone: link.clientPhone ?? "",
    eventDate: link.eventDate ?? "",
    eventTime: link.eventTime ?? "",
    eventLocation: link.eventLocation ?? "",
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

// ─── Component ──────────────────────────────────────────────

export default function BookingLinkForm({
  onClose,
  editingLink,
  defaultEventDate,
  labels,
}: Props) {
  const isEditMode = !!editingLink;

  // Fetch master pricing data
  const { data: pricingData } = usePricing();
  const { data: addOnsData } = useAddOns();

  const packages = useMemo(
    () => mapPackages(pricingData?.data.packages ?? []),
    [pricingData],
  );
  const addOns = useMemo(() => mapAddOns(addOnsData?.data ?? []), [addOnsData]);

  // Build initial state — for edit mode we need packages/addOns to resolve IDs
  const initialState = useMemo(() => {
    if (!editingLink) {
      return defaultEventDate
        ? { ...INITIAL_STATE, eventDate: defaultEventDate }
        : INITIAL_STATE;
    }
    return buildEditState(editingLink, packages, addOns);
  }, [editingLink, defaultEventDate, packages, addOns]);

  const [state, setState] = useState<BookingLinkFormState>(initialState);
  const [initialized, setInitialized] = useState(!isEditMode);
  const [result, setResult] = useState<{
    token: string;
    expiresAt: string;
    totalAmount: string | null;
  } | null>(null);

  // When initialState changes (master data loaded for edit mode), apply it once
  if (!initialized && editingLink && packages.length + addOns.length > 0) {
    setState(initialState);
    setInitialized(true);
  }

  const createMutation = useCreateBookingLink();
  const updateMutation = useUpdateBookingLink();

  // ─── Field updaters ─────────────────────────────────────

  const set = useCallback(
    <K extends keyof BookingLinkFormState>(k: K, v: BookingLinkFormState[K]) =>
      setState((prev) => ({ ...prev, [k]: v })),
    [],
  );

  const toggleAddOn = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      selectedAddOnIds: prev.selectedAddOnIds.includes(id)
        ? prev.selectedAddOnIds.filter((x) => x !== id)
        : [...prev.selectedAddOnIds, id],
    }));
  }, []);

  const addCustomAddOn = useCallback(() => {
    setState((prev) => ({
      ...prev,
      customAddOns: [...prev.customAddOns, { name: "", price: "" }],
    }));
  }, []);

  const removeCustomAddOn = useCallback((i: number) => {
    setState((prev) => ({
      ...prev,
      customAddOns: prev.customAddOns.filter((_, idx) => idx !== i),
    }));
  }, []);

  const updateCustomAddOn = useCallback(
    (i: number, field: keyof CustomAddOnDraft, v: string) => {
      setState((prev) => ({
        ...prev,
        customAddOns: prev.customAddOns.map((c, idx) =>
          idx === i ? { ...c, [field]: v } : c,
        ),
      }));
    },
    [],
  );

  // ─── Live snapshot preview ──────────────────────────────

  const pkgSnapshot = useMemo(
    () => buildPackageSnapshot(state, packages),
    [state, packages],
  );
  const addOnsSnapshot = useMemo(
    () => buildAddOnsSnapshot(state, addOns),
    [state, addOns],
  );

  // ─── Submit ─────────────────────────────────────────────

  const handleSubmit = () => {
    const payload = {
      clientName: state.clientName || null,
      clientPhone: state.clientPhone || null,
      eventDate: state.eventDate || null,
      eventTime: state.eventTime || null,
      eventLocation: state.eventLocation || null,
      packageSnapshot: pkgSnapshot,
      addOnsSnapshot:
        addOnsSnapshot && addOnsSnapshot.length > 0 ? addOnsSnapshot : null,
    };

    if (isEditMode && editingLink) {
      updateMutation.mutate(
        { id: editingLink.id, payload },
        {
          onSuccess: () => {
            onClose?.();
          },
        },
      );
    } else {
      createMutation.mutate(
        { ...payload, expiresInDays: 3 },
        {
          onSuccess: (data) => {
            setResult({
              token: data.token,
              expiresAt: data.expiresAt,
              totalAmount: data.totalAmount,
            });
          },
        },
      );
    }
  };

  const handleCreateAnother = () => {
    setState(INITIAL_STATE);
    setResult(null);
  };

  // ─── Result view ────────────────────────────────────────

  if (result) {
    return (
      <BookingLinkResult
        token={result.token}
        expiresAt={result.expiresAt}
        totalAmount={result.totalAmount}
        onCreateAnother={handleCreateAnother}
        labels={labels}
      />
    );
  }

  // ─── Form view ──────────────────────────────────────────

  const total = calculateTotal(pkgSnapshot, addOnsSnapshot);
  const hasData =
    state.clientName.trim() ||
    state.eventDate ||
    state.packageMode !== "none" ||
    state.selectedAddOnIds.length > 0 ||
    state.customAddOns.length > 0;

  return (
    <div className="space-y-6">
      {/* Section 1 — Client & event info */}
      <ClientEventFields
        clientName={state.clientName}
        setClientName={(v) => set("clientName", v)}
        clientPhone={state.clientPhone}
        setClientPhone={(v) => set("clientPhone", v)}
        eventDate={state.eventDate}
        setEventDate={(v) => set("eventDate", v)}
        eventTime={state.eventTime}
        setEventTime={(v) => set("eventTime", v)}
        eventLocation={state.eventLocation}
        setEventLocation={(v) => set("eventLocation", v)}
        labels={labels}
      />

      {/* Divider */}
      <hr className="border-gray-100" />

      {/* Section 2 — Package */}
      <PackageSelector
        packageMode={state.packageMode}
        setPackageMode={(v) => set("packageMode", v)}
        packages={packages}
        selectedPkgId={state.selectedPkgId}
        setSelectedPkgId={(v) => set("selectedPkgId", v)}
        selectedVariationId={state.selectedVariationId}
        setSelectedVariationId={(v) => set("selectedVariationId", v)}
        customPkgName={state.customPkgName}
        setCustomPkgName={(v) => set("customPkgName", v)}
        customPkgPrice={state.customPkgPrice}
        setCustomPkgPrice={(v) => set("customPkgPrice", v)}
        customPkgInclusions={state.customPkgInclusions}
        setCustomPkgInclusions={(v) => set("customPkgInclusions", v)}
        labels={labels}
      />

      {/* Divider */}
      <hr className="border-gray-100" />

      {/* Section 3 — Add-ons */}
      <AddOnSelector
        addOns={addOns}
        selectedAddOnIds={state.selectedAddOnIds}
        toggleAddOn={toggleAddOn}
        customAddOns={state.customAddOns}
        addCustomAddOn={addCustomAddOn}
        removeCustomAddOn={removeCustomAddOn}
        updateCustomAddOn={updateCustomAddOn}
        labels={labels}
      />

      {/* Section 4 — Price summary */}
      {(pkgSnapshot || (addOnsSnapshot && addOnsSnapshot.length > 0)) && (
        <>
          <hr className="border-gray-100" />
          <PriceSummary
            packageSnapshot={pkgSnapshot}
            addOnsSnapshot={addOnsSnapshot}
            labels={labels}
          />
        </>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        {onClose && (
          <Button variant="ghost" onClick={onClose}>
            {labels.cancel ?? "Cancel"}
          </Button>
        )}
        <div className="ml-auto flex items-center gap-3">
          {total > 0 && (
            <span className="text-sm font-medium text-gray-500">
              Total: Rp {total.toLocaleString("id-ID")}
            </span>
          )}
          <Button
            onClick={handleSubmit}
            isLoading={
              isEditMode ? updateMutation.isPending : createMutation.isPending
            }
            disabled={!hasData}
          >
            {isEditMode
              ? (labels.updateLink ?? "Update Booking Link")
              : (labels.generateLink ?? "Generate Booking Link")}
          </Button>
        </div>
      </div>
    </div>
  );
}
