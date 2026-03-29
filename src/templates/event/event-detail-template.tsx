"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout";
import {
  Badge,
  Button,
  Modal,
  Tabs,
  TabList,
  Tab,
  TabPanel,
} from "@/components/ui";
import {
  IconChevronLeft,
  IconLink,
  IconCopy,
  IconGoogleCalendar,
  IconInfo,
  IconPackage,
  IconDocument,
} from "@/components/icons";
import { useDictionary } from "@/i18n";
import { buildGoogleCalendarUrl } from "@/lib/google-calendar";
import { getBookingUrl } from "@/lib/booking-url";
import { useEventCategories } from "@/hooks";
import {
  eventStatusVariant,
  paymentStatusVariant,
  formatCurrency,
  type PackageSnapshot,
  type AddOnSnapshot,
} from "./types";
import {
  useEventDetail,
  useUpdateEvent,
  useAddPayment,
  useVerifyPayment,
} from "@/hooks/event";
import { EventDetailView } from "./event-detail-view";
import { EventDetailEdit } from "./event-detail-edit";
import type { ScheduleRow } from "./event-detail-edit";
import {
  EditPackageModalContent,
  EditAddOnsModalContent,
} from "./edit-package-modal";
import {
  PaymentProgress,
  PaymentRecords,
  AddPaymentForm,
} from "./payment-tracking";
import { BriefTab } from "./brief-tab";

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

  const { data: eventCategoriesData } = useEventCategories();
  const eventCategories = useMemo(
    () =>
      (eventCategoriesData ?? []).map((c: { id: string; name: string }) => ({
        value: c.id,
        label: c.name,
      })),
    [eventCategoriesData],
  );

  const [editingSection, setEditingSection] = useState<
    "client" | "event" | "status" | "notes" | "schedule" | null
  >(null);
  const [isSaving, startSaveTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  // Payment modal
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Package & Add-ons edit modals
  const [showEditPackage, setShowEditPackage] = useState(false);
  const [showEditAddOns, setShowEditAddOns] = useState(false);

  // Receipt / attachment preview modal
  const [receiptModal, setReceiptModal] = useState<{
    url: string;
    name: string;
    type: string;
  } | null>(null);

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
      const raw = Object.fromEntries(formData) as Record<string, unknown>;

      // Convert amount string → number (Zod will also accept this)
      if (raw.amount !== undefined) {
        const n = parseFloat(raw.amount as string);
        raw.amount = isNaN(n) ? null : n;
      }

      // Strip empty optional strings so the API receives null
      for (const key of [
        "clientPhoneSecondary",
        "clientEmail",
        "eventTime",
        "eventLocation",
        "eventLocationUrl",
        "notes",
      ]) {
        if (raw[key] === "") raw[key] = null;
      }

      updateEvent.mutate(
        { id: eventData.id, payload: raw },
        {
          onSuccess: () => {
            setEditingSection(null);
            setMessage(dict.eventDetail.saveChanges);
            setTimeout(() => setMessage(null), 3000);
            router.refresh();
          },
        },
      );
    });
  }

  function handleSaveSchedules(rows: ScheduleRow[]) {
    if (!eventData) return;
    startSaveTransition(() => {
      updateEvent.mutate(
        {
          id: eventData.id,
          payload: {
            schedules: rows.map((r) => ({
              id: r.id,
              date: r.date,
              startTime: r.startTime || null,
              endTime: r.endTime || null,
              label: r.label || null,
            })),
          },
        },
        {
          onSuccess: () => {
            setEditingSection(null);
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
        <div className="flex flex-wrap items-center gap-3">
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
          {eventData.schedules && eventData.schedules.length > 0 && (
            <a
              href={buildGoogleCalendarUrl({
                title: `${eventData.eventCategoryName ?? eventData.eventType ?? "Event"} – ${eventData.clientName}`,
                date: eventData.schedules[0].date,
                time: eventData.schedules[0].startTime ?? null,
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
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        defaultTab="general"
        onChange={() => {
          setEditingSection(null);
        }}
      >
        <TabList className="mb-6">
          <Tab id="general" icon={<IconInfo size={16} />}>
            {dict.eventDetail.tabGeneralInfo}
          </Tab>
          <Tab id="package-payments" icon={<IconPackage size={16} />}>
            {dict.eventDetail.tabPackagePayments}
          </Tab>
          <Tab id="brief" icon={<IconDocument size={16} />}>
            {dict.eventDetail.tabBrief}
          </Tab>
        </TabList>

        {/* ═══ Tab 1: General Information ═══ */}
        <TabPanel id="general">
          <div className="space-y-6">
            {/* ── Client Info ── */}
            {editingSection === "client" ? (
              <EventDetailEdit
                event={eventData}
                onSave={handleSave}
                onCancel={() => setEditingSection(null)}
                isSaving={isSaving}
                section="client"
                eventCategories={eventCategories}
                eventStatusOptions={eventStatusOptions}
                paymentStatusOptions={paymentStatusOptions}
                labels={{
                  clientInfo: dict.eventDetail.clientInfo,
                  clientName: dict.eventDetail.clientName,
                  clientPhone: dict.eventDetail.clientPhone,
                  clientPhoneSecondary: dict.eventDetail.clientPhoneSecondary,
                  clientEmail: dict.eventDetail.clientEmail,
                  eventInfo: dict.eventDetail.eventInfo,
                  eventCategory: dict.eventDetail.eventCategory,
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
                  clientPhoneSecondary: dict.eventDetail.clientPhoneSecondary,
                  clientEmail: dict.eventDetail.clientEmail,
                  eventInfo: dict.eventDetail.eventInfo,
                  eventCategory: dict.eventDetail.eventCategory,
                  eventDate: dict.eventDetail.eventDate,
                  eventTime: dict.eventDetail.eventTime,
                  eventLocation: dict.eventDetail.eventLocation,
                  eventLocationUrl: dict.eventDetail.eventLocationUrl,
                  notes: dict.eventDetail.notes,
                  noNotes: dict.eventDetail.noNotes,
                  editLabel: dict.eventDetail.edit,
                  notSet: dict.eventDetail.notSet,
                }}
                variant="client-only"
                onEditClient={() => setEditingSection("client")}
              />
            )}

            {/* ── Event Info ── */}
            {editingSection === "event" ? (
              <EventDetailEdit
                event={eventData}
                onSave={handleSave}
                onCancel={() => setEditingSection(null)}
                isSaving={isSaving}
                section="event"
                eventCategories={eventCategories}
                eventStatusOptions={eventStatusOptions}
                paymentStatusOptions={paymentStatusOptions}
                labels={{
                  clientInfo: dict.eventDetail.clientInfo,
                  clientName: dict.eventDetail.clientName,
                  clientPhone: dict.eventDetail.clientPhone,
                  clientPhoneSecondary: dict.eventDetail.clientPhoneSecondary,
                  clientEmail: dict.eventDetail.clientEmail,
                  eventInfo: dict.eventDetail.eventInfo,
                  eventCategory: dict.eventDetail.eventCategory,
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
                  clientPhoneSecondary: dict.eventDetail.clientPhoneSecondary,
                  clientEmail: dict.eventDetail.clientEmail,
                  eventInfo: dict.eventDetail.eventInfo,
                  eventCategory: dict.eventDetail.eventCategory,
                  eventDate: dict.eventDetail.eventDate,
                  eventTime: dict.eventDetail.eventTime,
                  eventLocation: dict.eventDetail.eventLocation,
                  eventLocationUrl: dict.eventDetail.eventLocationUrl,
                  notes: dict.eventDetail.notes,
                  noNotes: dict.eventDetail.noNotes,
                  editLabel: dict.eventDetail.edit,
                  notSet: dict.eventDetail.notSet,
                }}
                variant="event-only"
                onEditEvent={() => setEditingSection("event")}
              />
            )}

            {/* ── Schedule ── */}
            {editingSection === "schedule" ? (
              <EventDetailEdit
                event={eventData}
                onSave={handleSave}
                onSaveSchedules={handleSaveSchedules}
                onCancel={() => setEditingSection(null)}
                isSaving={isSaving}
                section="schedule"
                eventCategories={eventCategories}
                eventStatusOptions={eventStatusOptions}
                paymentStatusOptions={paymentStatusOptions}
                labels={{
                  clientInfo: dict.eventDetail.clientInfo,
                  clientName: dict.eventDetail.clientName,
                  clientPhone: dict.eventDetail.clientPhone,
                  clientPhoneSecondary: dict.eventDetail.clientPhoneSecondary,
                  clientEmail: dict.eventDetail.clientEmail,
                  eventInfo: dict.eventDetail.eventInfo,
                  eventCategory: dict.eventDetail.eventCategory,
                  eventDate: dict.eventDetail.eventDate,
                  eventTime: dict.eventDetail.eventTime,
                  eventLocation: dict.eventDetail.eventLocation,
                  paymentInfo: dict.eventDetail.paymentInfo,
                  totalAmount: dict.eventDetail.totalAmount,
                  notes: dict.eventDetail.notes,
                  saveChanges: dict.eventDetail.saveChanges,
                  updateStatus: dict.eventDetail.updateStatus,
                  paymentStatus: dict.eventDetail.paymentStatus,
                  scheduleTitle: dict.eventDetail.scheduleTitle,
                  scheduleDate: dict.eventDetail.scheduleDate,
                  scheduleStartTime: dict.eventDetail.scheduleStartTime,
                  scheduleEndTime: dict.eventDetail.scheduleEndTime,
                  scheduleLabel: dict.eventDetail.scheduleLabel,
                  addScheduleDate: dict.eventDetail.addScheduleDate,
                  removeScheduleDate: dict.eventDetail.removeScheduleDate,
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
                  clientPhoneSecondary: dict.eventDetail.clientPhoneSecondary,
                  clientEmail: dict.eventDetail.clientEmail,
                  eventInfo: dict.eventDetail.eventInfo,
                  eventCategory: dict.eventDetail.eventCategory,
                  eventDate: dict.eventDetail.eventDate,
                  eventTime: dict.eventDetail.eventTime,
                  eventLocation: dict.eventDetail.eventLocation,
                  eventLocationUrl: dict.eventDetail.eventLocationUrl,
                  notes: dict.eventDetail.notes,
                  noNotes: dict.eventDetail.noNotes,
                  editLabel: dict.eventDetail.edit,
                  notSet: dict.eventDetail.notSet,
                  scheduleTitle: dict.eventDetail.scheduleTitle,
                  noScheduleDates: dict.eventDetail.noScheduleDates,
                }}
                variant="schedule-only"
                onEditSchedule={() => setEditingSection("schedule")}
              />
            )}

            {/* ── Status ── */}
            {editingSection === "status" ? (
              <EventDetailEdit
                event={eventData}
                onSave={handleSave}
                onCancel={() => setEditingSection(null)}
                isSaving={isSaving}
                section="status"
                eventCategories={eventCategories}
                eventStatusOptions={eventStatusOptions}
                paymentStatusOptions={paymentStatusOptions}
                labels={{
                  clientInfo: dict.eventDetail.clientInfo,
                  clientName: dict.eventDetail.clientName,
                  clientPhone: dict.eventDetail.clientPhone,
                  clientPhoneSecondary: dict.eventDetail.clientPhoneSecondary,
                  clientEmail: dict.eventDetail.clientEmail,
                  eventInfo: dict.eventDetail.eventInfo,
                  eventCategory: dict.eventDetail.eventCategory,
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
                  clientPhoneSecondary: dict.eventDetail.clientPhoneSecondary,
                  clientEmail: dict.eventDetail.clientEmail,
                  eventInfo: dict.eventDetail.eventInfo,
                  eventCategory: dict.eventDetail.eventCategory,
                  eventDate: dict.eventDetail.eventDate,
                  eventTime: dict.eventDetail.eventTime,
                  eventLocation: dict.eventDetail.eventLocation,
                  eventLocationUrl: dict.eventDetail.eventLocationUrl,
                  notes: dict.eventDetail.notes,
                  noNotes: dict.eventDetail.noNotes,
                  editLabel: dict.eventDetail.edit,
                  notSet: dict.eventDetail.notSet,
                  updateStatus: dict.eventDetail.updateStatus,
                  paymentStatus: dict.eventDetail.paymentStatus,
                }}
                variant="status-only"
                onEditStatus={() => setEditingSection("status")}
                eventStatusLabel={
                  eventStatusLabel[eventData.eventStatus] ??
                  eventData.eventStatus
                }
                paymentStatusLabel={
                  paymentStatusLabel[eventData.paymentStatus] ??
                  eventData.paymentStatus
                }
              />
            )}

            {/* ── Notes ── */}
            {editingSection === "notes" ? (
              <EventDetailEdit
                event={eventData}
                onSave={handleSave}
                onCancel={() => setEditingSection(null)}
                isSaving={isSaving}
                section="notes"
                eventCategories={eventCategories}
                eventStatusOptions={eventStatusOptions}
                paymentStatusOptions={paymentStatusOptions}
                labels={{
                  clientInfo: dict.eventDetail.clientInfo,
                  clientName: dict.eventDetail.clientName,
                  clientPhone: dict.eventDetail.clientPhone,
                  clientPhoneSecondary: dict.eventDetail.clientPhoneSecondary,
                  clientEmail: dict.eventDetail.clientEmail,
                  eventInfo: dict.eventDetail.eventInfo,
                  eventCategory: dict.eventDetail.eventCategory,
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
                  clientPhoneSecondary: dict.eventDetail.clientPhoneSecondary,
                  clientEmail: dict.eventDetail.clientEmail,
                  eventInfo: dict.eventDetail.eventInfo,
                  eventCategory: dict.eventDetail.eventCategory,
                  eventDate: dict.eventDetail.eventDate,
                  eventTime: dict.eventDetail.eventTime,
                  eventLocation: dict.eventDetail.eventLocation,
                  eventLocationUrl: dict.eventDetail.eventLocationUrl,
                  notes: dict.eventDetail.notes,
                  noNotes: dict.eventDetail.noNotes,
                  editLabel: dict.eventDetail.edit,
                  notSet: dict.eventDetail.notSet,
                }}
                variant="notes-only"
                onEditNotes={() => setEditingSection("notes")}
              />
            )}
          </div>
        </TabPanel>

        {/* ═══ Tab 2: Package & Payments ═══ */}
        <TabPanel id="package-payments">
          <div className="space-y-6">
            {/* Package + Add-ons snapshot cards */}
            <EventDetailView
              event={eventData}
              formatDate={formatDate}
              labels={{
                clientInfo: dict.eventDetail.clientInfo,
                clientName: dict.eventDetail.clientName,
                clientPhone: dict.eventDetail.clientPhone,
                clientPhoneSecondary: dict.eventDetail.clientPhoneSecondary,
                clientEmail: dict.eventDetail.clientEmail,
                eventInfo: dict.eventDetail.eventInfo,
                eventCategory: dict.eventDetail.eventCategory,
                eventDate: dict.eventDetail.eventDate,
                eventTime: dict.eventDetail.eventTime,
                eventLocation: dict.eventDetail.eventLocation,
                eventLocationUrl: dict.eventDetail.eventLocationUrl,
                notes: dict.eventDetail.notes,
                noNotes: dict.eventDetail.noNotes,
                editLabel: dict.eventDetail.edit,
                notSet: dict.eventDetail.notSet,
              }}
              variant="package-only"
              onEditPackage={() => setShowEditPackage(true)}
              onEditAddOns={() => setShowEditAddOns(true)}
              bookingLabels={{
                totalPaid: dict.booking.totalPaid,
                remaining: dict.booking.remaining,
              }}
              totalPaid={totalPaid}
              remaining={remaining}
            />

            {/* Payment Progress with Add Payment in footer */}
            <PaymentProgress
              totalAmount={totalAmount}
              totalPaid={totalPaid}
              remaining={remaining}
              onAddPayment={() => setShowAddPayment(true)}
              labels={{
                paymentProgress: dict.eventDetail.paymentProgress,
                paidOf: dict.eventDetail.paidOf,
                totalPaid: dict.booking.totalPaid,
                remaining: dict.booking.remaining,
                addPayment: dict.eventDetail.addPayment,
              }}
            />

            {/* Payment Records below progress */}
            <PaymentRecords
              payments={eventData.payments}
              paymentTypeMap={paymentTypeMap}
              onVerify={handleVerifyPayment}
              onReject={handleRejectPayment}
              onViewReceipt={(receipt) => setReceiptModal(receipt)}
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
        </TabPanel>

        {/* ═══ Tab 3: Brief ═══ */}
        <TabPanel id="brief">
          <BriefTab
            eventId={eventId}
            labels={{
              noBriefs: dict.eventDetail.noBriefs,
              noBriefsDesc: dict.eventDetail.noBriefsDesc,
              addBrief: dict.eventDetail.addBrief,
              briefTitle: dict.eventDetail.briefTitle,
              briefTitlePlaceholder: dict.eventDetail.briefTitlePlaceholder,
              briefPlaceholder: dict.eventDetail.briefPlaceholder,
              briefAttachFile: dict.eventDetail.briefAttachFile,
              briefSubmit: dict.eventDetail.briefSubmit,
              briefPosting: dict.eventDetail.briefPosting,
              briefDeleteConfirm: dict.eventDetail.briefDeleteConfirm,
              briefDelete: dict.eventDetail.briefDelete,
              briefBy: dict.eventDetail.briefBy,
              briefViewAttachment: dict.eventDetail.briefViewAttachment,
              briefMore: dict.eventDetail.briefMore,
              briefImages: dict.eventDetail.briefImages,
              briefFiles: dict.eventDetail.briefFiles,
            }}
            formatDate={formatDate}
          />
        </TabPanel>
      </Tabs>

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

      {/* Receipt / Attachment Preview Modal */}
      <Modal
        open={!!receiptModal}
        onClose={() => setReceiptModal(null)}
        title={receiptModal?.name ?? dict.eventDetail.viewReceipt}
        className="max-w-2xl"
      >
        {receiptModal && (
          <div className="flex flex-col items-center gap-4">
            {receiptModal.type.startsWith("image/") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={receiptModal.url}
                alt={receiptModal.name}
                className="max-h-[60vh] w-full rounded-lg object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 py-8">
                <IconDocument size={48} className="text-gray-300" />
                <p className="text-sm text-gray-600">{receiptModal.name}</p>
              </div>
            )}
            <a
              href={receiptModal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Open in new tab ↗
            </a>
          </div>
        )}
      </Modal>

      {/* Edit Package Modal */}
      <Modal
        open={showEditPackage}
        onClose={() => setShowEditPackage(false)}
        title={dict.eventDetail.editPackage}
      >
        <EditPackageModalContent
          currentSnapshot={
            eventData.packageSnapshot != null
              ? (eventData.packageSnapshot as {
                  name: string;
                  price: string | number;
                })
              : null
          }
          onSave={(snapshot) => {
            const addOnsTotal = (
              (eventData.addOnsSnapshot as AddOnSnapshot[]) ?? []
            ).reduce((sum, item) => sum + Number(item.price || 0), 0);
            const newTotal = Number(snapshot?.price || 0) + addOnsTotal;

            updateEvent.mutate(
              {
                id: eventData.id,
                payload: { packageSnapshot: snapshot, amount: newTotal },
              },
              {
                onSuccess: () => {
                  setShowEditPackage(false);
                  setMessage(dict.eventDetail.saveChanges);
                  setTimeout(() => setMessage(null), 3000);
                  router.refresh();
                },
              },
            );
          }}
          onCancel={() => setShowEditPackage(false)}
          isSaving={updateEvent.isPending}
          labels={{
            selectPackage: dict.eventDetail.selectPackage,
            customPackage: dict.eventDetail.customPackage,
            packageName: dict.eventDetail.packageNameLabel,
            packageDescription: dict.eventDetail.packageDescription,
            packagePrice: dict.eventDetail.packagePrice,
            save: dict.eventDetail.saveChanges,
            cancel: dict.common.cancel,
            noPackage: dict.eventDetail.noPackage,
            orCustom: dict.eventDetail.orCustom,
            selectVariation: dict.eventDetail.selectVariation,
          }}
          formatCurrencyFn={formatCurrency}
          currency={eventData.currency}
        />
      </Modal>

      {/* Edit Add-ons Modal */}
      <Modal
        open={showEditAddOns}
        onClose={() => setShowEditAddOns(false)}
        title={dict.eventDetail.editAddOns}
      >
        <EditAddOnsModalContent
          currentSnapshot={
            Array.isArray(eventData.addOnsSnapshot)
              ? (eventData.addOnsSnapshot as {
                  name: string;
                  price: string | number;
                  quantity?: number;
                }[])
              : []
          }
          onSave={(snapshot) => {
            const packageTotal = Number(
              (eventData.packageSnapshot as PackageSnapshot)?.price || 0,
            );
            const newTotal =
              snapshot.reduce((sum, item) => sum + Number(item.price || 0), 0) +
              packageTotal;

            updateEvent.mutate(
              {
                id: eventData.id,
                payload: { addOnsSnapshot: snapshot, amount: newTotal },
              },
              {
                onSuccess: () => {
                  setShowEditAddOns(false);
                  setMessage(dict.eventDetail.saveChanges);
                  setTimeout(() => setMessage(null), 3000);
                  router.refresh();
                },
              },
            );
          }}
          onCancel={() => setShowEditAddOns(false)}
          isSaving={updateEvent.isPending}
          labels={{
            selectAddOns: dict.eventDetail.selectAddOns,
            customAddOn: dict.eventDetail.customAddOn,
            addOnName: dict.eventDetail.addOnNameLabel,
            addOnPrice: dict.eventDetail.addOnPriceLabel,
            save: dict.eventDetail.saveChanges,
            cancel: dict.common.cancel,
            addMore: dict.eventDetail.addMore,
            remove: dict.eventDetail.remove,
          }}
          formatCurrencyFn={formatCurrency}
          currency={eventData.currency}
        />
      </Modal>
    </AppLayout>
  );
}
