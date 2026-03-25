"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Card, CardBody, useToast } from "@/components/ui";
import { useDictionary } from "@/i18n";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { Locale } from "@/i18n/config";
import type { PortalEvent, BookingLinkFullData } from "./types";
import { BookingCheckout } from "./booking-checkout";
import type { CheckoutSubmitData } from "./booking-checkout";
import { PortalHeader } from "./portal-header";
import { PortalStatusTracker } from "./portal-status-tracker";
import { PortalEventInfo } from "./portal-event-info";
import {
  PortalPaymentProgress,
  PortalPaymentHistory,
  PortalUploadPayment,
} from "./portal-payment-section";

// ─── Types ──────────────────────────────────────────────────

interface BookingFormTemplateProps {
  token: string;
  serverDict: Dictionary;
  serverLocale: Locale;
  bookingData: BookingLinkFullData | null;
}

// ─── Helper: upload file to S3 via server ───────────────────

async function uploadReceiptFile(
  file: File,
): Promise<{ publicUrl: string; fileName: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "receipts");

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message ?? "Failed to upload file.");
  }

  const { publicUrl, fileName } = (await res.json()).data;
  return { publicUrl, fileName };
}

// ─── Component ──────────────────────────────────────────────

export default function BookingFormTemplate({
  token,
  serverDict,
  bookingData,
}: BookingFormTemplateProps) {
  const i18n = useDictionary();
  const dict = i18n?.dict ?? serverDict;
  const b = dict.booking;

  // Portal event state (for real-time updates after submission)
  const [portalEvent, setPortalEvent] = useState<PortalEvent | null>(
    bookingData?.event ?? null,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const toast = useToast();

  // Track if user just submitted the checkout (to transition from checkout → portal)
  const [justSubmitted, setJustSubmitted] = useState(false);

  // ─── Invalid / not found ────────────────────────────────
  if (!bookingData) {
    return <InvalidState message={b.linkInvalid} goHomeLabel={b.goHome} />;
  }

  // Check if event exists but client data is incomplete
  const eventDataIncomplete =
    bookingData.status === "used" &&
    bookingData.event != null &&
    (!bookingData.event.clientName?.trim() ||
      !bookingData.event.clientPhone?.trim() ||
      !bookingData.event.eventLocation?.trim());

  // If booking link has an event (status = "used") AND data is complete, show portal
  const showPortal =
    (bookingData.status === "used" && !eventDataIncomplete) || justSubmitted;

  // ─── Expired state ──────────────────────────────────────
  if (bookingData.status === "expired") {
    return <InvalidState message={b.linkExpired} goHomeLabel={b.goHome} />;
  }

  // ─── Checkout submit → create or update event via API ──
  async function handleCheckoutSubmit(data: CheckoutSubmitData) {
    const existingEvent = bookingData!.event;

    try {
      if (existingEvent) {
        // ── Event already exists but data was incomplete → PATCH to update ──
        const patchRes = await fetch(`/api/booking/${token}/event`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientName: data.clientName,
            clientPhone: data.clientPhone,
            clientPhoneSecondary: data.clientPhoneSecondary || null,
            clientEmail: data.clientEmail || null,
            eventLocation:
              data.eventLocation || bookingData!.eventLocation || null,
            eventLocationUrl: data.eventLocationUrl || null,
          }),
        });

        if (!patchRes.ok) {
          const json = await patchRes.json();
          throw new Error(json.error?.message ?? "Something went wrong");
        }
      } else {
        // ── No event yet → POST to create ──
        const totalAmount = bookingData!.totalAmount
          ? parseFloat(bookingData!.totalAmount)
          : 0;

        const res = await fetch("/api/booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            clientName: data.clientName,
            clientPhone: data.clientPhone,
            clientEmail: data.clientEmail || null,
            eventType: "Booking",
            eventDate:
              bookingData!.eventDate ?? new Date().toISOString().split("T")[0],
            eventTime: bookingData!.eventTime ?? null,
            eventLocation:
              data.eventLocation || bookingData!.eventLocation || null,
            packageSnapshot: bookingData!.packageSnapshot ?? null,
            addOnsSnapshot: bookingData!.addOnsSnapshot ?? null,
            amount: totalAmount || null,
            currency: bookingData!.packageSnapshot?.currency ?? "IDR",
            notes: null,
          }),
        });

        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error?.message ?? "Something went wrong");
        }

        await res.json();
      }

      // Upload receipt + create payment if DP was provided
      if (data.dpAmount && parseFloat(data.dpAmount) > 0) {
        let receiptUrl: string | null = null;
        let receiptName: string | null = null;

        if (data.receiptFile) {
          try {
            const upload = await uploadReceiptFile(data.receiptFile);
            receiptUrl = upload.publicUrl;
            receiptName = data.receiptFile.name;
          } catch {
            console.warn(
              "Receipt upload failed, creating payment without receipt",
            );
          }
        }

        await fetch(`/api/booking/${token}/payments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: parseFloat(data.dpAmount),
            paymentType: "DOWN_PAYMENT",
            receiptUrl,
            receiptName,
            note: "Initial DP",
          }),
        });
      }

      // Fetch updated event data and transition to portal
      const eventRes = await fetch(`/api/booking/${token}`);
      if (eventRes.ok) {
        const { data: bookingInfo } = await eventRes.json();
        if (bookingInfo.event) {
          setPortalEvent(bookingInfo.event);
        }
      }

      toast.addToast(b.submitSuccess ?? "Submitted successfully!", "success");
      setJustSubmitted(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.addToast(msg, "error");
      throw err; // re-throw so checkout component can handle isSubmitting
    }
  }

  // ─── Show checkout (single-view receipt) ────────────────
  if (!showPortal) {
    return (
      <BookingCheckout
        bookingData={bookingData}
        isCompletingData={eventDataIncomplete}
        onSubmit={handleCheckoutSubmit}
        labels={{
          pageTitle: b.pageTitle,
          checkoutSubtitle: b.checkoutSubtitle,
          vendorLabel: b.vendorLabel,
          clientInfoTitle: b.clientInfoTitle,
          fullName: b.fullName,
          fullNamePlaceholder: b.fullNamePlaceholder,
          phone: b.phone,
          phonePlaceholder: b.phonePlaceholder,
          phoneSecondary: b.phoneSecondary,
          phoneSecondaryPlaceholder: b.phoneSecondaryPlaceholder,
          email: b.email,
          emailPlaceholder: b.emailPlaceholder,
          editInfo: b.editInfo,
          cancelEdit: b.cancelEdit,
          eventSummaryTitle: b.eventSummaryTitle,
          eventDate: b.eventDate,
          eventTime: b.eventTime,
          eventLocation: b.eventLocation,
          eventLocationPlaceholder: b.eventLocationPlaceholder,
          eventLocationUrl: b.eventLocationUrl,
          eventLocationUrlPlaceholder: b.eventLocationUrlPlaceholder,
          packageLabel: b.packageLabel,
          noPackage: b.portalNoPackage,
          variationLabel: b.selectVariation,
          includes: b.packageIncludes,
          addOnsLabel: b.addOnsLabel,
          noAddOns: b.portalNoAddOns,
          perItem: b.perItem,
          qty: b.qty,
          subtotalLabel: b.subtotalLabel,
          addOnsTotalLabel: b.addOnsTotalLabel,
          grandTotal: b.grandTotal,
          dpPaymentTitle: b.dpPaymentTitle,
          dpPaymentDesc: b.dpPaymentDesc,
          dpAmountLabel: b.dpAmountLabel,
          dpAmountPlaceholder: b.dpAmountPlaceholder,
          receiptLabel: b.receiptLabel,
          receiptDesc: b.receiptUploadDesc,
          dragOrClick: b.dragOrClick,
          acceptedFormats: b.acceptedFormats,
          changeFile: b.changeFile,
          confirmAndPay: b.confirmAndPay,
          processing: b.processing,
          completeDataSubtitle: b.completeDataSubtitle,
          completeDataButton: b.completeDataButton,
        }}
      />
    );
  }

  // ─── Show portal ────────────────────────────────────────
  const event = portalEvent ?? bookingData.event;
  if (!event) {
    return <InvalidState message={b.linkInvalid} goHomeLabel={b.goHome} />;
  }

  return (
    <BookingPortal
      token={token}
      event={event}
      setEvent={setPortalEvent}
      vendorName={bookingData.vendor.name ?? "Vendor"}
      vendorImage={bookingData.vendor.image}
      message={message}
      setMessage={setMessage}
      isSubmittingPayment={isSubmittingPayment}
      setIsSubmittingPayment={setIsSubmittingPayment}
      dict={dict}
    />
  );
}

// ─── Invalid state ──────────────────────────────────────────

function InvalidState({
  message,
  goHomeLabel,
}: {
  message: string;
  goHomeLabel: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md text-center">
        <CardBody className="space-y-4 py-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-8 w-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <p className="text-lg font-semibold text-gray-900">{message}</p>
          <Link
            href="/"
            className="inline-block text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            {goHomeLabel}
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}

// ─── Portal sub-component ───────────────────────────────────

function BookingPortal({
  token,
  event,
  setEvent,
  vendorName,
  vendorImage,
  message,
  setMessage,
  isSubmittingPayment,
  setIsSubmittingPayment,
  dict,
}: {
  token: string;
  event: PortalEvent;
  setEvent: React.Dispatch<React.SetStateAction<PortalEvent | null>>;
  vendorName: string;
  vendorImage: string | null;
  message: string | null;
  setMessage: React.Dispatch<React.SetStateAction<string | null>>;
  isSubmittingPayment: boolean;
  setIsSubmittingPayment: React.Dispatch<React.SetStateAction<boolean>>;
  dict: Dictionary;
}) {
  const b = dict.booking;
  const ev = dict.event;

  const eventStatusLabel: Record<string, string> = {
    INQUIRY: ev.statusInquiry,
    WAITING_CONFIRMATION: ev.statusWaitingConfirmation,
    BOOKED: ev.statusBooked,
    ONGOING: ev.statusOngoing,
    COMPLETED: ev.statusCompleted,
  };

  const paymentStatusLabel: Record<string, string> = {
    UNPAID: ev.paymentUnpaid,
    DP_PAID: ev.paymentDpPaid,
    PAID: ev.paymentPaid,
  };

  const paymentTypeMap: Record<string, string> = {
    DOWN_PAYMENT: b.dpPayment,
    INSTALLMENT: b.installment,
    FULL_PAYMENT: b.fullPayment,
  };

  const totalPaid = useMemo(
    () => event.payments.reduce((sum, p) => sum + parseFloat(p.amount), 0),
    [event.payments],
  );

  const totalAmount = useMemo(
    () => (event.amount ? parseFloat(event.amount) : 0),
    [event.amount],
  );

  const remaining = useMemo(
    () => Math.max(totalAmount - totalPaid, 0),
    [totalAmount, totalPaid],
  );

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // ─── Handle payment submission with S3 upload ───────────
  const handleAddPayment = useCallback(
    async (data: {
      amount: string;
      paymentType: string;
      note: string;
      receiptFile: File | null;
    }) => {
      setIsSubmittingPayment(true);
      try {
        let receiptUrl: string | null = null;
        let receiptName: string | null = null;

        // Upload receipt file if provided
        if (data.receiptFile) {
          try {
            const upload = await uploadReceiptFile(data.receiptFile);
            receiptUrl = upload.publicUrl;
            receiptName = data.receiptFile.name;
          } catch {
            console.warn("Receipt upload failed");
          }
        }

        // Submit payment via API
        const res = await fetch(`/api/booking/${token}/payments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: parseFloat(data.amount),
            paymentType: data.paymentType,
            receiptUrl,
            receiptName,
            note: data.note || null,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error?.message ?? "Failed to submit payment.");
        }

        const { data: newPayment } = await res.json();

        // Update local state
        setEvent((prev) =>
          prev ? { ...prev, payments: [newPayment, ...prev.payments] } : prev,
        );

        setMessage(b.portalPaymentSent);
        setTimeout(() => setMessage(null), 4000);
      } catch (err) {
        setMessage(
          err instanceof Error ? err.message : "Failed to submit payment.",
        );
        setTimeout(() => setMessage(null), 4000);
      } finally {
        setIsSubmittingPayment(false);
      }
    },
    [token, b.portalPaymentSent, setEvent, setMessage, setIsSubmittingPayment],
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {message && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        <PortalHeader
          event={event}
          vendorName={vendorName}
          vendorImage={vendorImage}
          eventStatusLabel={eventStatusLabel}
          paymentStatusLabel={paymentStatusLabel}
          labels={{
            portalWelcome: b.portalWelcome,
            portalWelcomeDesc: b.portalWelcomeDesc,
            portalContactVendor: b.portalContactVendor,
          }}
        />

        <div className="mt-6">
          <PortalStatusTracker
            currentStatus={event.eventStatus}
            statusLabel={eventStatusLabel}
            title={b.statusTracker}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <PortalEventInfo
              event={event}
              labels={{
                portalEventDetails: b.portalEventDetails,
                portalEventType: b.portalEventType,
                portalEventDate: b.portalEventDate,
                portalEventTime: b.portalEventTime,
                portalEventLocation: b.portalEventLocation,
                portalYourPackage: b.portalYourPackage,
                portalNoPackage: b.portalNoPackage,
                portalYourAddOns: b.portalYourAddOns,
                portalNoAddOns: b.portalNoAddOns,
                portalIncluded: b.portalIncluded,
                addToCalendar: dict.googleCalendar.addToCalendar,
              }}
              addOnLabels={{ qty: b.qty, perUnit: b.perUnit }}
              formatDate={formatDate}
            />
          </div>

          <div className="space-y-4 lg:col-span-2">
            <PortalPaymentProgress
              totalAmount={totalAmount}
              totalPaid={totalPaid}
              remaining={remaining}
              labels={{
                totalAmount: b.totalAmount,
                totalPaid: b.totalPaid,
                remaining: b.remaining,
              }}
            />

            <PortalPaymentHistory
              payments={event.payments}
              paymentTypeMap={paymentTypeMap}
              labels={{
                paymentHistory: b.paymentHistory,
                noPayments: b.noPayments,
                viewReceipt: b.portalViewReceipt,
                verified: b.verified,
                pending: b.pending,
              }}
              formatDate={formatDate}
            />

            <PortalUploadPayment
              onSubmit={handleAddPayment}
              isSubmitting={isSubmittingPayment}
              labels={{
                uploadReceipt: b.uploadReceipt,
                uploadReceiptDesc: b.uploadReceiptDesc,
                paymentAmount: b.paymentAmount,
                paymentType: b.paymentType,
                paymentNote: b.paymentNote,
                paymentNotePlaceholder: b.paymentNotePlaceholder,
                selectFile: b.selectFile,
                noFileSelected: b.noFileSelected,
                dpPayment: b.dpPayment,
                fullPayment: b.fullPayment,
                installment: b.installment,
                submitPayment: b.submitPayment,
                uploading: b.uploading,
              }}
            />
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            Powered by{" "}
            <span className="font-medium text-gray-500">Kraftalis</span>
          </p>
        </div>
      </div>
    </div>
  );
}
