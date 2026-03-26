"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout";
import { Badge, Button, Modal } from "@/components/ui";
import {
  IconChevronLeft,
  IconEdit,
  IconLink,
  IconCopy,
  IconGoogleCalendar,
} from "@/components/icons";
import { useDictionary } from "@/i18n";
import { buildGoogleCalendarUrl } from "@/lib/google-calendar";
import { getBookingUrl } from "@/lib/booking-url";
// types imported from services when needed
import { eventStatusVariant, paymentStatusVariant } from "./types";
import {
  useEventDetail,
  useUpdateEvent,
  useAddPayment,
  useVerifyPayment,
} from "@/hooks/event";
import { EventDetailView } from "./event-detail-view";
import { EventDetailEdit } from "./event-detail-edit";
import {
  PaymentProgress,
  PaymentRecords,
  AddPaymentForm,
} from "./payment-tracking";

// ─── Orchestrator ───────────────────────────────────────────

interface EventDetailTemplateProps {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
  eventId: string;
}

export default function EventDetailTemplate({
  user,
  eventId,
}: EventDetailTemplateProps) {
  const { dict } = useDictionary();
  const router = useRouter();

  const { data: eventData, isLoading, isError } = useEventDetail(eventId);
  const updateEvent = useUpdateEvent();
  const addPaymentMut = useAddPayment(eventId);
  const verifyPaymentMut = useVerifyPayment(eventId);

  const [editing, setEditing] = useState(false);
  const [isSaving, startSaveTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  // Payment modal
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Memoised calculations
  const totalPaid = useMemo(() => {
    const payments = eventData?.payments ?? [];
    return payments
      .filter((p) => p.isVerified)
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);
  }, [eventData?.payments]);

  const totalAmount = useMemo(
    () => (eventData?.amount ? parseFloat(eventData.amount) : 0),
    [eventData],
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

  // ─── Status labels ────────────────────────────────────────

  const eventStatusLabel: Record<string, string> = {
    INQUIRY: dict.event.statusInquiry,
    WAITING_CONFIRMATION: dict.event.statusWaitingConfirmation,
    BOOKED: dict.event.statusBooked,
    ONGOING: dict.event.statusOngoing,
    COMPLETED: dict.event.statusCompleted,
  };

  const paymentStatusLabel: Record<string, string> = {
    UNPAID: dict.event.paymentUnpaid,
    DP_PAID: dict.event.paymentDpPaid,
    PAID: dict.event.paymentPaid,
  };

  const paymentTypeMap: Record<string, string> = {
    DOWN_PAYMENT: dict.booking.dpPayment,
    INSTALLMENT: dict.booking.installment,
    FULL_PAYMENT: dict.booking.fullPayment,
  };

  const eventTypes = [
    { value: "Wedding", label: dict.booking.typeWedding },
    { value: "Engagement", label: dict.booking.typeEngagement },
    { value: "Birthday", label: dict.booking.typeBirthday },
    { value: "Graduation", label: dict.booking.typeGraduation },
    { value: "Corporate", label: dict.booking.typeCorporate },
    { value: "Other", label: dict.booking.typeOther },
  ];

  const eventStatusOptions = [
    { value: "INQUIRY", label: dict.event.statusInquiry },
    {
      value: "WAITING_CONFIRMATION",
      label: dict.event.statusWaitingConfirmation,
    },
    { value: "BOOKED", label: dict.event.statusBooked },
    { value: "ONGOING", label: dict.event.statusOngoing },
    { value: "COMPLETED", label: dict.event.statusCompleted },
  ];

  const paymentStatusOptions = [
    { value: "UNPAID", label: dict.event.paymentUnpaid },
    { value: "DP_PAID", label: dict.event.paymentDpPaid },
    { value: "PAID", label: dict.event.paymentPaid },
  ];

  // ─── Handlers ─────────────────────────────────────────────

  function handleSave(formData: FormData) {
    if (!eventData) return;

    startSaveTransition(() => {
      const payload = Object.fromEntries(formData) as Record<string, unknown>;
      updateEvent.mutate(
        { id: eventData.id, payload },
        {
          onSuccess: () => {
            setEditing(false);
            setMessage(dict.eventDetail.saveChanges);
            setTimeout(() => setMessage(null), 3000);
            router.refresh();
          },
        },
      );
    });
  }

  function handleCopyLink() {
    const bookingToken = eventData?.bookingToken;
    if (!bookingToken) return;
    const url = getBookingUrl(bookingToken);
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  function handleVerifyPayment(paymentId: string) {
    verifyPaymentMut.mutate(
      { paymentId, action: "verify" },
      {
        onSuccess: () => {
          setMessage(dict.eventDetail.paymentVerified);
          setTimeout(() => setMessage(null), 3000);
        },
      },
    );
  }

  function handleRejectPayment(paymentId: string) {
    verifyPaymentMut.mutate(
      { paymentId, action: "reject" },
      {
        onSuccess: () => {
          setMessage(dict.eventDetail.paymentRejected);
          setTimeout(() => setMessage(null), 3000);
        },
      },
    );
  }

  async function handleAddPayment(data: {
    amount: string;
    paymentType: string;
    note: string;
    receiptFile: File | null;
  }) {
    setIsSubmittingPayment(true);

    let receiptUrl: string | null = null;
    let receiptName: string | null = null;

    // Upload receipt if provided
    if (data.receiptFile) {
      try {
        const formData = new FormData();
        formData.append("file", data.receiptFile);
        formData.append("folder", "receipts");

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.data?.publicUrl) {
          receiptUrl = uploadData.data.publicUrl;
          receiptName = uploadData.data.fileName;
        }
      } catch (err) {
        console.error("Receipt upload failed:", err);
      }
    }

    addPaymentMut.mutate(
      {
        amount: parseFloat(data.amount) || 0,
        paymentType: data.paymentType as
          | "DOWN_PAYMENT"
          | "INSTALLMENT"
          | "FULL_PAYMENT",
        note: data.note || null,
        receiptUrl,
        receiptName,
      },
      {
        onSuccess: () => {
          setIsSubmittingPayment(false);
          setShowAddPayment(false);
          setMessage(
            dict.eventDetail.paymentAdded ?? "Payment recorded successfully.",
          );
          setTimeout(() => setMessage(null), 3000);
        },
        onError: () => {
          setIsSubmittingPayment(false);
        },
      },
    );
  }

  // ─── Render ───────────────────────────────────────────────

  if (isLoading) {
    return (
      <AppLayout user={user} title={dict.nav.event}>
        <div className="py-12 text-center text-sm text-slate-500">
          {dict.common.loading}
        </div>
      </AppLayout>
    );
  }

  if (isError || !eventData) {
    return (
      <AppLayout user={user} title={dict.nav.event}>
        <div className="py-12 text-center text-sm text-red-500">
          {dict.event.errorLoading}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout user={user} title={dict.nav.event}>
      {/* Top message toast */}
      {message && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/event"
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
          >
            <IconChevronLeft size={16} />
            {dict.eventDetail.backToEvents}
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {/* Status badges */}
          <Badge variant={eventStatusVariant(eventData.eventStatus)} dot>
            {eventStatusLabel[eventData.eventStatus] ?? eventData.eventStatus}
          </Badge>
          <Badge variant={paymentStatusVariant(eventData.paymentStatus)} dot>
            {paymentStatusLabel[eventData.paymentStatus] ??
              eventData.paymentStatus}
          </Badge>

          {/* Copy link */}
          {eventData.bookingToken && (
            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              {linkCopied ? (
                <>{dict.bookingLink.copied}</>
              ) : (
                <>
                  <IconCopy size={14} />
                  <IconLink size={14} />
                </>
              )}
            </Button>
          )}

          {/* Google Calendar */}
          {eventData.eventDate && (
            <a
              href={buildGoogleCalendarUrl({
                title: `${eventData.eventType ?? "Event"} – ${eventData.clientName}`,
                date: eventData.eventDate,
                time: eventData.eventTime ?? null,
                location: eventData.eventLocation ?? null,
                description: (
                  eventData.packageSnapshot as { name?: string } | null
                )?.name
                  ? `Package: ${(eventData.packageSnapshot as { name?: string }).name}`
                  : undefined,
              })}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" type="button">
                <IconGoogleCalendar size={14} />
                <span className="hidden sm:inline">
                  {dict.googleCalendar.addToCalendar}
                </span>
              </Button>
            </a>
          )}

          {/* Edit toggle */}
          {!editing && (
            <Button size="sm" onClick={() => setEditing(true)}>
              <IconEdit size={14} />
              {dict.eventDetail.editEvent}
            </Button>
          )}
        </div>
      </div>

      {/* Main content: 2 columns on large screens */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: view or edit */}
        <div className="lg:col-span-2">
          {editing ? (
            <EventDetailEdit
              event={eventData}
              onSave={handleSave}
              onCancel={() => setEditing(false)}
              isSaving={isSaving}
              eventTypes={eventTypes}
              eventStatusOptions={eventStatusOptions}
              paymentStatusOptions={paymentStatusOptions}
              labels={{
                clientInfo: dict.eventDetail.clientInfo,
                clientName: dict.eventDetail.clientName,
                clientPhone: dict.eventDetail.clientPhone,
                clientEmail: dict.eventDetail.clientEmail,
                eventInfo: dict.eventDetail.eventInfo,
                eventType: dict.eventDetail.eventType,
                eventDate: dict.eventDetail.eventDate,
                eventTime: dict.eventDetail.eventTime,
                eventLocation: dict.eventDetail.eventLocation,
                paymentInfo: dict.eventDetail.paymentInfo,
                totalAmount: dict.eventDetail.totalAmount,
                notes: dict.eventDetail.notes,
                saveChanges: dict.eventDetail.saveChanges,
                updateStatus: dict.eventDetail.updateStatus,
                paymentStatus: dict.eventDetail.paymentStatus,
              }}
              cancelLabel={dict.common.cancel}
            />
          ) : (
            <EventDetailView
              event={eventData}
              formatDate={formatDate}
              labels={{
                clientInfo: dict.eventDetail.clientInfo,
                clientName: dict.eventDetail.clientName,
                clientPhone: dict.eventDetail.clientPhone,
                clientEmail: dict.eventDetail.clientEmail,
                eventInfo: dict.eventDetail.eventInfo,
                eventType: dict.eventDetail.eventType,
                eventDate: dict.eventDetail.eventDate,
                eventTime: dict.eventDetail.eventTime,
                eventLocation: dict.eventDetail.eventLocation,
                packageInfo: dict.eventDetail.packageInfo,
                packageName: dict.eventDetail.packageName,
                addOns: dict.eventDetail.addOns,
                paymentInfo: dict.eventDetail.paymentInfo,
                totalAmount: dict.eventDetail.totalAmount,
                notes: dict.eventDetail.notes,
                noNotes: dict.eventDetail.noNotes,
              }}
              bookingLabels={{
                totalPaid: dict.booking.totalPaid,
                remaining: dict.booking.remaining,
              }}
              totalPaid={totalPaid}
              remaining={remaining}
            />
          )}
        </div>

        {/* Right column: payment tracking */}
        <div className="space-y-4">
          <PaymentProgress
            totalAmount={totalAmount}
            totalPaid={totalPaid}
            remaining={remaining}
            labels={{
              paymentProgress: dict.eventDetail.paymentProgress,
              paidOf: dict.eventDetail.paidOf,
              totalPaid: dict.booking.totalPaid,
              remaining: dict.booking.remaining,
            }}
          />

          <div className="flex justify-end">
            <Button size="sm" onClick={() => setShowAddPayment(true)}>
              {dict.eventDetail.addPayment}
            </Button>
          </div>

          <PaymentRecords
            payments={eventData.payments}
            paymentTypeMap={paymentTypeMap}
            onVerify={handleVerifyPayment}
            onReject={handleRejectPayment}
            labels={{
              paymentRecords: dict.eventDetail.paymentRecords,
              noPaymentsYet: dict.eventDetail.noPaymentsYet,
              noPaymentsDesc: dict.eventDetail.noPaymentsDesc,
              amountLabel: dict.eventDetail.amountLabel,
              typeLabel: dict.eventDetail.typeLabel,
              dateLabel: dict.eventDetail.dateLabel,
              statusLabel: dict.eventDetail.statusLabel,
              receiptLabel: dict.eventDetail.receiptLabel,
              actionLabel: dict.eventDetail.actionLabel,
              viewReceipt: dict.eventDetail.viewReceipt,
              verifyPayment: dict.eventDetail.verifyPayment,
              rejectPayment: dict.eventDetail.rejectPayment,
              verified: dict.booking.verified,
              pending: dict.booking.pending,
              receiptUploaded: dict.eventDetail.receiptUploaded,
              noReceipt: dict.eventDetail.noReceipt,
            }}
            formatDate={formatDate}
          />
        </div>
      </div>

      {/* Add Payment Modal */}
      <Modal
        open={showAddPayment}
        onClose={() => setShowAddPayment(false)}
        title={dict.eventDetail.addPayment}
      >
        <AddPaymentForm
          onSubmit={handleAddPayment}
          isSubmitting={isSubmittingPayment}
          paymentTypeMap={paymentTypeMap}
          labels={{
            amountLabel: dict.eventDetail.amountLabel,
            typeLabel: dict.eventDetail.typeLabel,
            receiptLabel: dict.eventDetail.receiptLabel,
            addPayment: dict.eventDetail.addPayment,
          }}
          bookingLabels={{
            paymentAmount: dict.booking.paymentAmount,
            paymentType: dict.booking.paymentType,
            paymentNote: dict.booking.paymentNote,
            paymentNotePlaceholder: dict.booking.paymentNotePlaceholder,
            selectFile: dict.booking.selectFile,
            noFileSelected: dict.booking.noFileSelected,
            dpPayment: dict.booking.dpPayment,
            fullPayment: dict.booking.fullPayment,
            installment: dict.booking.installment,
            submitPayment: dict.booking.submitPayment,
            uploading: dict.booking.uploading,
          }}
          cancelLabel={dict.common.cancel}
          onCancel={() => setShowAddPayment(false)}
        />
      </Modal>
    </AppLayout>
  );
}
