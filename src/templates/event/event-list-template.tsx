"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout";
import { Button, Input, Select } from "@/components/ui";
import {
  IconLink,
  IconSearch,
  IconList,
  IconKanban,
  IconRefresh,
} from "@/components/icons";
import { useDictionary } from "@/i18n";
import { useEvents } from "@/hooks/event";
import { useQuickVerifyPayment } from "@/hooks/event";
import { useBookingLinks } from "@/hooks/booking";
import type { EventItem } from "./types";
import type { BookingLinkItem } from "@/services/booking";
import { EventStats } from "./event-stats";
import { EventTable } from "./event-table";
import { KanbanBoard } from "./kanban-board";
import { EventListSkeleton } from "./event-list-skeleton";
import { BookingLinkModal } from "./event-modals";
import { ActiveOfferingsSection } from "./active-offerings-section";

export type { EventItem };

interface EventListTemplateProps {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
}

type ViewMode = "list" | "kanban";

export default function EventListTemplate({ user }: EventListTemplateProps) {
  const { dict } = useDictionary();

  const { data: events = [], isLoading, isError, refetch } = useEvents();
  const { data: bookingLinks = [], isLoading: isLinksLoading } =
    useBookingLinks();
  const quickVerify = useQuickVerifyPayment();

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [editingLink, setEditingLink] = useState<BookingLinkItem | null>(null);

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

  const filtered = events.filter((e) => {
    if (statusFilter && e.eventStatus !== statusFilter) return false;
    if (paymentFilter && e.paymentStatus !== paymentFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        e.clientName.toLowerCase().includes(q) ||
        e.eventType.toLowerCase().includes(q) ||
        (e.eventCategoryName?.toLowerCase().includes(q) ?? false) ||
        (e.eventLocation?.toLowerCase().includes(q) ?? false)
      );
    }
    return true;
  });

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <AppLayout user={user} title={dict.nav.event}>
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {dict.event.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{dict.event.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button size="md" onClick={() => setShowLinkModal(true)}>
            <IconLink size={16} />
            {dict.event.generateLink}
          </Button>
        </div>
      </div>

      {/* Loading / Error / Content */}
      {isLoading ? (
        <EventListSkeleton />
      ) : isError ? (
        <div className="flex flex-col items-center py-20">
          <p className="text-sm text-red-500 mb-3">{dict.event.errorLoading}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <IconRefresh size={14} />
            {dict.event.retry}
          </Button>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="mb-6">
            <EventStats
              events={events}
              labels={{
                totalEvents: dict.event.totalEvents,
                upcoming: dict.event.upcoming,
                booked: dict.event.booked,
                revenue: dict.event.revenue,
                thisMonth: dict.event.thisMonth,
              }}
            />
          </div>

          {/* Active Offerings */}
          <ActiveOfferingsSection
            links={bookingLinks}
            isLoading={isLinksLoading}
            onEdit={(link) => {
              setEditingLink(link);
              setShowLinkModal(true);
            }}
            labels={dict.activeOfferings}
          />

          {/* Filters + View Toggle */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <IconSearch
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
              />
              <Input
                type="text"
                placeholder={dict.event.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "", label: dict.event.allStatuses },
                { value: "INQUIRY", label: dict.event.statusInquiry },
                {
                  value: "WAITING_CONFIRMATION",
                  label: dict.event.statusWaitingConfirmation,
                },
                { value: "BOOKED", label: dict.event.statusBooked },
                { value: "ONGOING", label: dict.event.statusOngoing },
                { value: "COMPLETED", label: dict.event.statusCompleted },
              ]}
              className="w-auto"
            />
            <Select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              options={[
                { value: "", label: dict.event.allPayments },
                { value: "UNPAID", label: dict.event.paymentUnpaid },
                { value: "DP_PAID", label: dict.event.paymentDpPaid },
                { value: "PAID", label: dict.event.paymentPaid },
              ]}
              className="w-auto"
            />

            {/* View toggle */}
            <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                title={dict.event.listView}
              >
                <IconList size={16} />
              </button>
              <button
                onClick={() => setViewMode("kanban")}
                className={`rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === "kanban"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                title={dict.event.kanbanView}
              >
                <IconKanban size={16} />
              </button>
            </div>
          </div>

          {/* Content */}
          {viewMode === "list" ? (
            <EventTable
              events={filtered}
              allEventsCount={events.length}
              eventStatusLabel={eventStatusLabel}
              paymentStatusLabel={paymentStatusLabel}
              viewLabel={dict.event.view}
              formatDate={formatDate}
              columns={dict.event}
              emptyLabels={dict.event}
              onQuickVerify={(eventId, paymentId) =>
                quickVerify.mutate({ eventId, paymentId, action: "verify" })
              }
              isVerifying={quickVerify.isPending}
              quickVerifyLabels={{
                verifyPayment: dict.eventDetail.verifyPayment,
                pendingPayment: dict.event.pendingPayment,
                viewReceipt: dict.eventDetail.viewReceipt,
              }}
            />
          ) : (
            <KanbanBoard
              events={filtered}
              eventStatusLabel={eventStatusLabel}
              paymentStatusLabel={paymentStatusLabel}
              noEventsLabel={dict.event.kanbanNoEvents}
              viewLabel={dict.event.view}
              formatDate={formatDate}
            />
          )}
        </>
      )}

      {/* Modals */}
      <BookingLinkModal
        open={showLinkModal}
        onClose={() => {
          setShowLinkModal(false);
          setEditingLink(null);
        }}
        editingLink={editingLink}
        labels={dict.bookingLink}
      />
    </AppLayout>
  );
}
