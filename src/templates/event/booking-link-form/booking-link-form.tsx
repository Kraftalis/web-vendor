"use client";

import {
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from "react";
import { Button, Select } from "@/components/ui";
import { useCreateBookingLink, useUpdateBookingLink } from "@/hooks/booking";
import { usePricing, useAddOns, useEventCategories } from "@/hooks";
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
import PaymentSection from "./payment-section";
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
      eventCategoryId: p.eventCategory?.id ?? null,
      items: p.items.map((v) => ({
        id: v.id,
        label: v.label,
        description: v.description,
        price: v.price,
        inclusions: v.inclusions ?? [],
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
  /**
   * When provided the form won't render its own footer buttons.
   * Instead it calls this with the footer ReactNode so the parent
   * (e.g. a Modal) can place it in a sticky footer slot.
   */
  renderFooter?: (footer: ReactNode) => void;
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
  let packageMode: BookingLinkFormState["packageMode"] = "existing";
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
    paymentType: "",
    paymentAmount: "",
    paymentReceipt: null,
    paymentNote: "",
  };
}

// ─── Component ──────────────────────────────────────────────

export default function BookingLinkForm({
  onClose,
  editingLink,
  defaultEventDate,
  labels,
  renderFooter,
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

  // Fetch event categories for filtering
  const { data: eventCategoriesData } = useEventCategories();
  const eventCategories = useMemo(
    () => (eventCategoriesData ?? []).filter((c) => c.isActive),
    [eventCategoriesData],
  );
  const [selectedEventCatId, setSelectedEventCatId] = useState("");

  // Filter packages by selected event category
  const filteredPackages = useMemo(() => {
    if (!selectedEventCatId) return packages;
    return packages.filter(
      (p) => p.eventCategoryId === selectedEventCatId,
    );
  }, [packages, selectedEventCatId]);

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

  const [isUploading, setIsUploading] = useState(false);

  /** Upload receipt file to S3 via server */
  const uploadReceipt = async (
    file: File,
  ): Promise<{ url: string; name: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "receipts");

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message ?? "Failed to upload receipt.");
    }

    const { publicUrl, fileName } = (await res.json()).data;
    return { url: publicUrl, name: fileName };
  };

  const handleSubmit = async () => {
    // Build payment data if vendor filled in payment fields
    let payment:
      | {
          paymentType: "DOWN_PAYMENT" | "FULL_PAYMENT";
          amount: number;
          note?: string;
          receiptUrl?: string;
          receiptName?: string;
        }
      | undefined;

    const paymentAmt = parseFloat(state.paymentAmount);
    if (state.paymentType && paymentAmt > 0) {
      payment = {
        paymentType: state.paymentType as "DOWN_PAYMENT" | "FULL_PAYMENT",
        amount: paymentAmt,
        note: state.paymentNote || undefined,
      };

      // Upload receipt if provided
      if (state.paymentReceipt) {
        try {
          setIsUploading(true);
          const uploaded = await uploadReceipt(state.paymentReceipt);
          payment.receiptUrl = uploaded.url;
          payment.receiptName = uploaded.name;
        } finally {
          setIsUploading(false);
        }
      }
    }

    const payload = {
      clientName: state.clientName || null,
      clientPhone: state.clientPhone || null,
      eventDate: state.eventDate || null,
      eventTime: state.eventTime || null,
      eventLocation: state.eventLocation || null,
      packageSnapshot: pkgSnapshot,
      addOnsSnapshot:
        addOnsSnapshot && addOnsSnapshot.length > 0 ? addOnsSnapshot : null,
      payment,
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

  // ─── Footer content (buttons + total) ───────────────────

  const total = calculateTotal(pkgSnapshot, addOnsSnapshot);
  const hasData =
    state.clientName.trim() ||
    state.eventDate ||
    state.selectedPkgId ||
    state.customPkgName.trim() ||
    state.selectedAddOnIds.length > 0 ||
    state.customAddOns.length > 0;

  const isBusy =
    isUploading ||
    (isEditMode ? updateMutation.isPending : createMutation.isPending);

  const footerContent = result ? null : (
    <>
      {total > 0 && (
        <span className="mr-auto text-sm font-semibold text-gray-700">
          Total: Rp {total.toLocaleString("id-ID")}
        </span>
      )}
      {onClose && (
        <Button variant="outline" onClick={onClose}>
          {labels.cancel ?? "Cancel"}
        </Button>
      )}
      <Button onClick={handleSubmit} isLoading={isBusy} disabled={!hasData}>
        {isUploading
          ? (labels.uploading ?? "Uploading…")
          : isEditMode
            ? (labels.updateLink ?? "Update Booking Link")
            : (labels.generateButton ?? "Generate Link")}
      </Button>
    </>
  );

  // Notify parent of footer content so it can be placed in Modal footer slot
  useEffect(() => {
    renderFooter?.(footerContent);
  });

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

      {/* Section 2 — Event Category & Package */}
      {eventCategories.length > 0 && (
        <Select
          label={labels.eventCategory ?? "Event Category"}
          value={selectedEventCatId}
          onChange={(e) => {
            setSelectedEventCatId(e.target.value);
            // Reset selected package when category changes
            set("selectedPkgId", "");
            set("selectedVariationId", "");
          }}
          placeholder={labels.selectEventCategory ?? "All event categories"}
          options={eventCategories.map((c) => ({
            value: c.id,
            label: c.name,
          }))}
        />
      )}

      <PackageSelector
        packageMode={state.packageMode}
        setPackageMode={(v) => set("packageMode", v)}
        packages={filteredPackages}
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

      {/* Divider */}
      <hr className="border-gray-100" />

      {/* Section 5 — Payment (optional) */}
      <PaymentSection
        paymentType={state.paymentType}
        setPaymentType={(v) => set("paymentType", v)}
        paymentAmount={state.paymentAmount}
        setPaymentAmount={(v) => set("paymentAmount", v)}
        paymentReceipt={state.paymentReceipt}
        setPaymentReceipt={(v) => set("paymentReceipt", v)}
        paymentNote={state.paymentNote}
        setPaymentNote={(v) => set("paymentNote", v)}
        labels={labels}
      />

      {/* Inline footer — only when no external footer slot */}
      {!renderFooter && (
        <div className="flex items-center justify-end gap-3 pt-2">
          {footerContent}
        </div>
      )}
    </div>
  );
}
