"use client";

import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui";
import { Link as LinkIcon, RefreshCw } from "lucide-react";

import {
  EVENT_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  formatDate,
} from "./types";
import type { EventItem } from "./types";
import { EventStats } from "./event-stats";
import { EventTable } from "./event-table";
import { KanbanBoard } from "./kanban-board";
import { EventListSkeleton } from "./event-list-skeleton";
import { BookingLinkModal } from "./event-modals";
import { ActiveOfferingsSection } from "./active-offerings-section";
import { EventFilterBar } from "./event-filter-bar";
import { useEventList } from "./use-event-list";

export type { EventItem };

interface EventListTemplateProps {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
}

export const EventListTemplate = ({ user }: EventListTemplateProps) => {
  const {
    events,
    filteredEvents,
    bookingLinks,
    isLoading,
    isError,
    isLinksLoading,
    isVerifying,
    refetch,
    viewMode,
    setViewMode,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    paymentFilter,
    setPaymentFilter,
    showLinkModal,
    setShowLinkModal,
    editingLink,
    handleEditLink,
    handleCloseLinkModal,
    handleQuickVerify,
  } = useEventList();

  return (
    <AppLayout user={user} title="Acara" contentContainerClassName="pb-20">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Acara
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola semua acara dan booking Anda
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto mt-2 sm:mt-0">
          <Button
            size="md"
            onPress={() => setShowLinkModal(true)}
            className="w-full sm:w-auto"
          >
            <LinkIcon size={16} />
            Buat Tautan Booking
          </Button>
        </div>
      </div>

      {/* Loading / Error / Content */}
      {isLoading ? (
        <EventListSkeleton />
      ) : isError ? (
        <div className="flex flex-col items-center py-20 bg-white rounded-xl border border-gray-100">
          <p className="text-sm text-red-500 mb-3">Gagal memuat acara</p>
          <Button variant="outline" size="sm" onPress={() => refetch()}>
            <RefreshCw size={14} className="mr-1.5" />
            Coba Lagi
          </Button>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="mb-6">
            <EventStats events={events} />
          </div>

          {/* Active Offerings */}
          <ActiveOfferingsSection
            links={bookingLinks}
            isLoading={isLinksLoading}
            onEdit={handleEditLink}
          />

          {/* Filters + View Toggle */}
          <EventFilterBar
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            paymentFilter={paymentFilter}
            onPaymentFilterChange={setPaymentFilter}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {/* Content */}
          {viewMode === "list" ? (
            <EventTable
              events={filteredEvents}
              allEventsCount={events.length}
              eventStatusLabel={EVENT_STATUS_LABELS}
              paymentStatusLabel={PAYMENT_STATUS_LABELS}
              viewLabel="Lihat"
              formatDate={formatDate}
              onQuickVerify={handleQuickVerify}
              isVerifying={isVerifying}
            />
          ) : (
            <KanbanBoard
              events={filteredEvents}
              eventStatusLabel={EVENT_STATUS_LABELS}
              paymentStatusLabel={PAYMENT_STATUS_LABELS}
              formatDate={formatDate}
            />
          )}
        </>
      )}

      {/* Modals */}
      <BookingLinkModal
        isOpen={showLinkModal}
        onOpenChange={(open) => {
          if (!open) handleCloseLinkModal();
        }}
        editingLink={editingLink}
      />
    </AppLayout>
  );
};
