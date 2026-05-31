"use client";

import Link from "next/link";
import { AppLayout } from "@/components/layout";
import {
  Badge,
  Button,
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
  IconX,
  IconCash,
} from "@/components/icons";
import { buildGoogleCalendarUrl } from "@/lib/google-calendar";
import { eventStatusVariant, paymentStatusVariant, formatCurrency } from "../event/types";
import type { PackageSnapshot, AddOnSnapshot } from "../event/types";
import { EventDetailView } from "./event-detail-view";
import { EventDetailEdit } from "./event-detail-edit";
import type { ScheduleRow } from "./event-detail-edit";
import { PaymentProgress } from "./payment-progress";
import { PaymentRecords } from "./payment-records";
import { BriefTab } from "./brief-tab";
import { CostTracking } from "./cost-tracking";
import { AddPaymentModal } from "./add-payment-modal";
import { AddCostModal } from "./add-cost-modal";
import { CancelEventModal } from "./cancel-event-modal";
import { ReceiptPreviewModal } from "./receipt-preview-modal";
import { EditPackageModal } from "./edit-package-modal";
import { EditAddOnsModal } from "./edit-addons-modal";
import { useEventDetailPage } from "./use-event-detail-page";

interface EventDetailTemplateProps {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
  eventId: string;
}

export const EventDetailTemplate = ({
  user,
  eventId,
}: EventDetailTemplateProps) => {
  const {
    eventData,
    isLoading,
    isError,
    updateEvent,
    transactionData,
    eventCategories,
    editingSection,
    setEditingSection,
    isSaving,
    message,
    linkCopied,
    showAddPayment,
    setShowAddPayment,
    showCancelModal,
    setShowCancelModal,
    isSubmittingPayment,
    showEditPackage,
    setShowEditPackage,
    showEditAddOns,
    setShowEditAddOns,
    receiptModal,
    setReceiptModal,
    showAddCost,
    setShowAddCost,
    isSubmittingCost,
    totalAmount,
    totalPaid,
    remaining,
    formatDate,
    handleSave,
    handleSaveSchedules,
    handleSavePackage,
    handleSaveAddOns,
    handleCopyLink,
    handleAddCost,
    handleDeleteCost,
    handleVerifyPayment,
    handleRejectPayment,
    handleAddPayment,
    handleCancelEvent,
    eventStatusLabel,
    paymentStatusLabel,
    paymentTypeMap,
    eventStatusOptions,
    paymentStatusOptions,
  } = useEventDetailPage(eventId);

  if (isLoading) {
    return (
      <AppLayout user={user} title="Acara">
        <div className="py-12 text-center text-sm text-slate-500">Memuat...</div>
      </AppLayout>
    );
  }

  if (isError || !eventData) {
    return (
      <AppLayout user={user} title="Acara">
        <div className="py-12 text-center text-sm text-red-500">
          Gagal memuat data acara
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout user={user} title="Acara" contentContainerClassName="max-w-6xl pb-20">
      {message && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/event"
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <IconChevronLeft size={16} />
          Kembali ke Acara
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          {eventData.eventStatus !== "CANCELED" && (
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
              onClick={() => setShowCancelModal(true)}
            >
              <IconX size={14} />
              Batalkan Acara
            </Button>
          )}
          <Badge variant={eventStatusVariant(eventData.eventStatus)} dot>
            {eventStatusLabel[eventData.eventStatus] ?? eventData.eventStatus}
          </Badge>
          <Badge variant={paymentStatusVariant(eventData.paymentStatus)} dot>
            {paymentStatusLabel[eventData.paymentStatus] ?? eventData.paymentStatus}
          </Badge>
          {eventData.bookingToken && (
            <Button variant="outline" size="sm" onClick={() => handleCopyLink(eventData.bookingToken!)}>
              {linkCopied ? <>Disalin</> : <><IconCopy size={14} /><IconLink size={14} /></>}
            </Button>
          )}
          {eventData.schedules && eventData.schedules.length > 0 && (
            <a
              href={buildGoogleCalendarUrl({
                title: `${eventData.eventCategoryName ?? eventData.eventType ?? "Acara"} – ${eventData.clientName}`,
                date: eventData.schedules[0].date,
                time: eventData.schedules[0].startTime ?? null,
                location: eventData.eventLocation ?? null,
                description: (eventData.packageSnapshot as { name?: string } | null)?.name
                  ? `Paket: ${(eventData.packageSnapshot as { name?: string }).name}`
                  : undefined,
              })}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" type="button">
                <IconGoogleCalendar size={14} />
                <span className="hidden sm:inline">Tambahkan ke Kalender</span>
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultTab="general" onChange={() => setEditingSection(null)}>
        <TabList className="mb-6">
          <Tab id="general" icon={<IconInfo size={16} />}>Informasi Umum</Tab>
          <Tab id="package-payments" icon={<IconPackage size={16} />}>Paket &amp; Pembayaran</Tab>
          <Tab id="cost-tracking" icon={<IconCash size={16} />}>Pelacakan Biaya</Tab>
          <Tab id="brief" icon={<IconDocument size={16} />}>Brief</Tab>
        </TabList>

        {/* Tab: General */}
        <TabPanel id="general">
          <div className="space-y-6">
            {editingSection === "client" ? (
              <EventDetailEdit event={eventData} onSave={handleSave} onCancel={() => setEditingSection(null)} isSaving={isSaving} section="client" eventCategories={eventCategories} eventStatusOptions={eventStatusOptions} paymentStatusOptions={paymentStatusOptions} />
            ) : (
              <EventDetailView event={eventData} formatDate={formatDate} variant="client-only" onEditClient={() => setEditingSection("client")} />
            )}
            {editingSection === "event" ? (
              <EventDetailEdit event={eventData} onSave={handleSave} onCancel={() => setEditingSection(null)} isSaving={isSaving} section="event" eventCategories={eventCategories} eventStatusOptions={eventStatusOptions} paymentStatusOptions={paymentStatusOptions} />
            ) : (
              <EventDetailView event={eventData} formatDate={formatDate} variant="event-only" onEditEvent={() => setEditingSection("event")} />
            )}
            {editingSection === "schedule" ? (
              <EventDetailEdit event={eventData} onSave={handleSave} onSaveSchedules={handleSaveSchedules} onCancel={() => setEditingSection(null)} isSaving={isSaving} section="schedule" eventCategories={eventCategories} eventStatusOptions={eventStatusOptions} paymentStatusOptions={paymentStatusOptions} />
            ) : (
              <EventDetailView event={eventData} formatDate={formatDate} variant="schedule-only" onEditSchedule={() => setEditingSection("schedule")} />
            )}
            {editingSection === "status" ? (
              <EventDetailEdit event={eventData} onSave={handleSave} onCancel={() => setEditingSection(null)} isSaving={isSaving} section="status" eventCategories={eventCategories} eventStatusOptions={eventStatusOptions} paymentStatusOptions={paymentStatusOptions} />
            ) : (
              <EventDetailView event={eventData} formatDate={formatDate} variant="status-only" onEditStatus={() => setEditingSection("status")} eventStatusLabel={eventStatusLabel[eventData.eventStatus] ?? eventData.eventStatus} paymentStatusLabel={paymentStatusLabel[eventData.paymentStatus] ?? eventData.paymentStatus} />
            )}
            {editingSection === "notes" ? (
              <EventDetailEdit event={eventData} onSave={handleSave} onCancel={() => setEditingSection(null)} isSaving={isSaving} section="notes" eventCategories={eventCategories} eventStatusOptions={eventStatusOptions} paymentStatusOptions={paymentStatusOptions} />
            ) : (
              <EventDetailView event={eventData} formatDate={formatDate} variant="notes-only" onEditNotes={() => setEditingSection("notes")} />
            )}
          </div>
        </TabPanel>

        {/* Tab: Package & Payments */}
        <TabPanel id="package-payments">
          <div className="space-y-6">
            <EventDetailView event={eventData} formatDate={formatDate} variant="package-only" onEditPackage={() => setShowEditPackage(true)} onEditAddOns={() => setShowEditAddOns(true)} totalPaid={totalPaid} remaining={remaining} />
            <PaymentProgress totalAmount={totalAmount} totalPaid={totalPaid} remaining={remaining} onAddPayment={() => setShowAddPayment(true)} />
            <PaymentRecords payments={eventData.payments} paymentTypeMap={paymentTypeMap} onVerify={handleVerifyPayment} onReject={handleRejectPayment} onViewReceipt={(receipt) => setReceiptModal(receipt)} formatDate={formatDate} />
          </div>
        </TabPanel>

        {/* Tab: Cost Tracking */}
        <TabPanel id="cost-tracking">
          <CostTracking eventId={eventId} transactions={transactionData?.data ?? []} onAddCost={() => setShowAddCost(true)} onDeleteCost={handleDeleteCost} onViewReceipt={(receipt) => setReceiptModal(receipt)} />
        </TabPanel>

        {/* Tab: Brief */}
        <TabPanel id="brief">
          <BriefTab eventId={eventId} formatDate={formatDate} />
        </TabPanel>
      </Tabs>

      {/* Modals */}
      <AddCostModal isOpen={showAddCost} onOpenChange={setShowAddCost} onSubmit={handleAddCost} isSubmitting={isSubmittingCost} />
      <AddPaymentModal isOpen={showAddPayment} onOpenChange={setShowAddPayment} onSubmit={handleAddPayment} isSubmitting={isSubmittingPayment} paymentTypeMap={paymentTypeMap} />
      <ReceiptPreviewModal receipt={receiptModal} onClose={() => setReceiptModal(null)} />
      <EditPackageModal
        isOpen={showEditPackage}
        onOpenChange={setShowEditPackage}
        currentSnapshot={eventData.packageSnapshot != null ? (eventData.packageSnapshot as PackageSnapshot) : null}
        onSave={handleSavePackage}
        isSaving={updateEvent.isPending}
        formatCurrencyFn={formatCurrency}
        currency={eventData.currency}
      />
      <EditAddOnsModal
        isOpen={showEditAddOns}
        onOpenChange={setShowEditAddOns}
        currentSnapshot={Array.isArray(eventData.addOnsSnapshot) ? (eventData.addOnsSnapshot as AddOnSnapshot[]) : []}
        onSave={handleSaveAddOns}
        isSaving={updateEvent.isPending}
        formatCurrencyFn={formatCurrency}
        currency={eventData.currency}
      />
      <CancelEventModal isOpen={showCancelModal} onOpenChange={setShowCancelModal} onConfirm={handleCancelEvent} isSaving={isSaving} />
    </AppLayout>
  );
};
