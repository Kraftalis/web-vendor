"use client";

import { useState, useMemo, useEffect, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  bookingLinkSchema,
  type BookingLinkFormValues,
  type CustomAddOnDraft,
  type SourcePackage,
  type SourceAddOn,
  buildPackageSnapshot,
  buildAddOnsSnapshot,
  calculateTotal,
} from "./types";

// ─── Helpers ────────────────────────────────────────────────

const DEFAULT_VALUES: BookingLinkFormValues = {
  clientName: "",
  clientPhone: "",
  eventCategoryId: "",
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

function buildEditValues(
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

  return {
    ...DEFAULT_VALUES,
    clientName: link.clientName ?? "",
    clientPhone: link.clientPhone ?? "",
    eventCategoryId: link.eventCategoryId ?? "",
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

// ─── Props ──────────────────────────────────────────────────

interface Props {
  onClose?: () => void;
  editingLink?: BookingLinkItem;
  defaultEventDate?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  labels: Record<string, any>;
  renderFooter?: (footer: ReactNode) => void;
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

  const { data: pricingData } = usePricing();
  const { data: addOnsData } = useAddOns();
  const { data: eventCategoriesData } = useEventCategories();

  const packages = useMemo(
    () => mapPackages(pricingData?.data.packages ?? []),
    [pricingData],
  );
  const addOns = useMemo(() => mapAddOns(addOnsData?.data ?? []), [addOnsData]);
  const eventCategories = useMemo(
    () => (eventCategoriesData ?? []).filter((c) => c.isActive),
    [eventCategoriesData],
  );

  // Build default values once master data is loaded for edit mode
  const initialValues = useMemo(() => {
    if (editingLink && packages.length + addOns.length > 0) {
      return buildEditValues(editingLink, packages, addOns);
    }
    return defaultEventDate
      ? { ...DEFAULT_VALUES, eventDate: defaultEventDate }
      : DEFAULT_VALUES;
  }, [editingLink, defaultEventDate, packages, addOns]);

  const { control, handleSubmit, reset, setValue, getValues } =
    useForm<BookingLinkFormValues>({
      resolver: zodResolver(bookingLinkSchema),
      defaultValues: initialValues,
    });

  // Re-sync form when edit mode data resolves
  const [initialized, setInitialized] = useState(!isEditMode);
  useEffect(() => {
    if (!initialized && editingLink && packages.length + addOns.length > 0) {
      reset(buildEditValues(editingLink, packages, addOns));
      setInitialized(true);
    }
  }, [initialized, editingLink, packages, addOns, reset]);

  const watched = useWatch({ control });

  const filteredPackages = useMemo(() => {
    const catId = watched.eventCategoryId;
    if (!catId) return packages;
    return packages.filter((p) => p.eventCategoryId === catId);
  }, [packages, watched.eventCategoryId]);

  const createMutation = useCreateBookingLink();
  const updateMutation = useUpdateBookingLink();
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{
    token: string;
    expiresAt: string;
    totalAmount: string | null;
  } | null>(null);

  // ─── Live snapshots ─────────────────────────────────────

  const pkgSnapshot = useMemo(
    () => buildPackageSnapshot(watched as BookingLinkFormValues, packages),
    [watched, packages],
  );
  const addOnsSnapshot = useMemo(
    () => buildAddOnsSnapshot(watched as BookingLinkFormValues, addOns),
    [watched, addOns],
  );

  // ─── Upload helper ───────────────────────────────────────

  const uploadReceipt = async (
    file: File,
  ): Promise<{ url: string; name: string }> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "receipts");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message ?? "Failed to upload receipt.");
    }
    const { publicUrl, fileName } = (await res.json()).data;
    return { url: publicUrl, name: fileName };
  };

  // ─── Submit ─────────────────────────────────────────────

  const onSubmit = handleSubmit(async (values) => {
    let payment:
      | {
          paymentType: "DOWN_PAYMENT" | "FULL_PAYMENT";
          amount: number;
          note?: string;
          receiptUrl?: string;
          receiptName?: string;
        }
      | undefined;

    const paymentAmt = parseFloat(values.paymentAmount);
    if (values.paymentType && paymentAmt > 0) {
      payment = {
        paymentType: values.paymentType as "DOWN_PAYMENT" | "FULL_PAYMENT",
        amount: paymentAmt,
        note: values.paymentNote || undefined,
      };
      if (values.paymentReceipt) {
        setIsUploading(true);
        try {
          const uploaded = await uploadReceipt(values.paymentReceipt);
          payment.receiptUrl = uploaded.url;
          payment.receiptName = uploaded.name;
        } finally {
          setIsUploading(false);
        }
      }
    }

    const payload = {
      clientName: values.clientName || null,
      clientPhone: values.clientPhone || null,
      eventCategoryId: values.eventCategoryId || null,
      eventDate: values.eventDate || null,
      eventTime: values.eventTime || null,
      eventLocation: values.eventLocation || null,
      packageSnapshot: pkgSnapshot,
      addOnsSnapshot: addOnsSnapshot?.length ? addOnsSnapshot : null,
      payment,
    };

    if (isEditMode && editingLink) {
      updateMutation.mutate(
        { id: editingLink.id, payload },
        { onSuccess: () => onClose?.() },
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
  });

  const handleCreateAnother = () => {
    reset(DEFAULT_VALUES);
    setResult(null);
  };

  // ─── Footer ─────────────────────────────────────────────

  const total = calculateTotal(pkgSnapshot, addOnsSnapshot);
  const v = watched;
  const hasData = Boolean(
    v.clientName?.trim() ||
    v.eventDate ||
    v.selectedPkgId ||
    v.customPkgName?.trim() ||
    (v.selectedAddOnIds?.length ?? 0) > 0 ||
    (v.customAddOns?.length ?? 0) > 0,
  );
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
      <Button onClick={onSubmit} isLoading={isBusy} disabled={!hasData}>
        {isUploading
          ? (labels.uploading ?? "Uploading…")
          : isEditMode
            ? (labels.updateLink ?? "Update Booking Link")
            : (labels.generateButton ?? "Generate Link")}
      </Button>
    </>
  );

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
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Section 1 — Client & event info */}
      <ClientEventFields control={control} labels={labels} />

      <hr className="border-gray-100" />

      {/* Section 2 — Event Category & Package */}
      {eventCategories.length > 0 && (
        <Select
          label={labels.eventCategory ?? "Event Category"}
          value={watched.eventCategoryId ?? ""}
          onChange={(e) => {
            setValue("eventCategoryId", e.target.value);
            setValue("selectedPkgId", "");
            setValue("selectedVariationId", "");
          }}
          placeholder={labels.selectEventCategory ?? "All event categories"}
          options={eventCategories.map((c) => ({ value: c.id, label: c.name }))}
        />
      )}

      <PackageSelector
        control={control}
        setValue={setValue}
        packages={filteredPackages}
        labels={labels}
      />

      <hr className="border-gray-100" />

      {/* Section 3 — Add-ons */}
      <AddOnSelector
        control={control}
        setValue={setValue}
        getValues={getValues}
        addOns={addOns}
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

      <hr className="border-gray-100" />

      {/* Section 5 — Payment (optional) */}
      <PaymentSection control={control} setValue={setValue} labels={labels} />

      {/* Inline footer — only when no external footer slot */}
      {!renderFooter && (
        <div className="flex items-center justify-end gap-3 pt-2">
          {footerContent}
        </div>
      )}
    </form>
  );
}
