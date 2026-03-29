"use client";

import {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Select } from "@/components/ui";
import { useCreateBookingLink, useUpdateBookingLink } from "@/hooks/booking";
import { usePricing, useAddOns, useEventCategories } from "@/hooks";
import type { BookingLinkItem } from "@/services/booking";
import ClientEventFields from "./client-event-fields";
import PackageSelector from "./package-selector";
import AddOnSelector from "./addon-selector";
import PriceSummary from "./price-summary";
import PaymentSection from "./payment-section";
import BookingLinkResult from "./booking-link-result";
import {
  bookingLinkSchema,
  type BookingLinkFormValues,
  buildPackageSnapshot,
  buildAddOnsSnapshot,
  calculateTotal,
} from "./types";
import {
  DEFAULT_VALUES,
  mapPackages,
  mapAddOns,
  buildEditValues,
} from "./utils";

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

  const rawPackages = pricingData?.data?.packages;
  const rawAddOns = addOnsData?.data;

  const packages = useMemo(() => {
    if (!rawPackages) return [];
    return mapPackages(rawPackages);
  }, [rawPackages]);

  const addOns = useMemo(() => {
    if (!rawAddOns) return [];
    return mapAddOns(rawAddOns);
  }, [rawAddOns]);

  const eventCategories = useMemo(() => {
    if (!eventCategoriesData) return [];
    return eventCategoriesData.filter((c) => c.isActive);
  }, [eventCategoriesData]);

  // Build default values once master data is loaded for edit mode
  const initialValues = useMemo(() => {
    if (editingLink && packages.length + addOns.length > 0) {
      return buildEditValues(editingLink, packages, addOns);
    }
    if (defaultEventDate) {
      return {
        ...DEFAULT_VALUES,
        scheduleDates: [
          { date: defaultEventDate, startTime: "", endTime: "", label: "" },
        ],
      };
    }
    return DEFAULT_VALUES;
  }, [editingLink, defaultEventDate, packages, addOns]);

  const { control, handleSubmit, reset, setValue, getValues } =
    useForm<BookingLinkFormValues>({
      resolver: zodResolver(bookingLinkSchema),
      defaultValues: initialValues,
    });

  // Re-sync form only when initialValues identity changes (edit mode data loads)
  const prevInitialRef = useRef(initialValues);
  useEffect(() => {
    if (prevInitialRef.current !== initialValues) {
      prevInitialRef.current = initialValues;
      reset(initialValues);
    }
  }, [initialValues, reset]);

  const watched = useWatch({ control });

  // Extract only the primitive values we need from watched to avoid
  // re-creating derived values on every render (useWatch returns new obj each time)
  const watchedEventCategoryId = watched.eventCategoryId ?? "";
  const watchedSelectedPkgId = watched.selectedPkgId ?? "";
  const watchedSelectedVariationId = watched.selectedVariationId ?? "";
  const watchedPackageMode = watched.packageMode ?? "existing";
  const watchedCustomPkgName = watched.customPkgName ?? "";
  const watchedCustomPkgPrice = watched.customPkgPrice ?? "";
  const watchedCustomPkgInclusions = watched.customPkgInclusions ?? "";
  const watchedSelectedAddOnIds = watched.selectedAddOnIds;
  const watchedCustomAddOns = watched.customAddOns;
  const watchedClientName = watched.clientName ?? "";
  const watchedScheduleDates = watched.scheduleDates ?? [];

  // Derive a "has date" flag from schedule dates
  const hasAnyDate = watchedScheduleDates.some((s) => s?.date?.trim());

  const filteredPackages = useMemo(() => {
    if (!watchedEventCategoryId) return packages;
    return packages.filter((p) => p.eventCategoryId === watchedEventCategoryId);
  }, [packages, watchedEventCategoryId]);

  const createMutation = useCreateBookingLink();
  const updateMutation = useUpdateBookingLink();
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{
    token: string;
    expiresAt: string;
    totalAmount: string | null;
  } | null>(null);

  // ─── Live snapshots (use extracted primitives) ──────────

  const pkgSnapshot = useMemo(
    () =>
      buildPackageSnapshot(
        {
          packageMode: watchedPackageMode,
          selectedPkgId: watchedSelectedPkgId,
          selectedVariationId: watchedSelectedVariationId,
          customPkgName: watchedCustomPkgName,
          customPkgPrice: watchedCustomPkgPrice,
          customPkgInclusions: watchedCustomPkgInclusions,
        } as BookingLinkFormValues,
        packages,
      ),
    [
      watchedPackageMode,
      watchedSelectedPkgId,
      watchedSelectedVariationId,
      watchedCustomPkgName,
      watchedCustomPkgPrice,
      watchedCustomPkgInclusions,
      packages,
    ],
  );

  const addOnsSnapshot = useMemo(
    () =>
      buildAddOnsSnapshot(
        {
          selectedAddOnIds: watchedSelectedAddOnIds,
          customAddOns: watchedCustomAddOns,
        } as BookingLinkFormValues,
        addOns,
      ),
    [watchedSelectedAddOnIds, watchedCustomAddOns, addOns],
  );

  // ─── Upload helper ───────────────────────────────────────

  const uploadReceipt = useCallback(
    async (file: File): Promise<{ url: string; name: string }> => {
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
    },
    [],
  );

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
      eventDate: values.scheduleDates?.[0]?.date || null,
      eventTime: values.scheduleDates?.[0]?.startTime || null,
      eventLocation: values.eventLocation || null,
      scheduleDates:
        values.scheduleDates
          ?.filter((s) => s.date.trim())
          .map((s) => ({
            date: s.date,
            startTime: s.startTime || null,
            endTime: s.endTime || null,
            label: s.label || null,
          })) ?? null,
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
  // Use a primitive "key" to detect changes and only push to parent when
  // something actually changed. This avoids the infinite loop caused by
  // renderFooter (setState) → parent re-render → child re-render → useEffect fires again.

  const total = calculateTotal(pkgSnapshot, addOnsSnapshot);
  const hasData = Boolean(
    watchedClientName.trim() ||
    hasAnyDate ||
    watchedSelectedPkgId ||
    watchedCustomPkgName.trim() ||
    (watchedSelectedAddOnIds?.length ?? 0) > 0 ||
    (watchedCustomAddOns?.length ?? 0) > 0,
  );
  const isBusy =
    isUploading ||
    (isEditMode ? updateMutation.isPending : createMutation.isPending);

  // Build a primitive string key from all footer-relevant values
  const footerKey = `${!!result}|${total}|${isUploading}|${isEditMode}|${isBusy}|${hasData}`;
  const prevFooterKeyRef = useRef("");

  useEffect(() => {
    if (!renderFooter) return;
    if (prevFooterKeyRef.current === footerKey) return;
    prevFooterKeyRef.current = footerKey;

    if (result) {
      renderFooter(null);
      return;
    }

    renderFooter(
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
      </>,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [footerKey]);

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
          value={watchedEventCategoryId}
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
        </div>
      )}
    </form>
  );
}
