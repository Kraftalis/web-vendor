"use client";

import { useState, useMemo, useCallback } from "react";
import { useEvents } from "@/hooks/event";
import { useQuickVerifyPayment } from "@/hooks/event";
import { useBookingLinks } from "@/hooks/booking";
import type { BookingLinkItem } from "@/services/booking";
import type { ViewMode } from "./event-filter-bar";
import type { EventItem } from "./types";

export interface UseEventListReturn {
  // Data
  events: EventItem[];
  filteredEvents: EventItem[];
  bookingLinks: BookingLinkItem[];
  // Loading / error states
  isLoading: boolean;
  isError: boolean;
  isLinksLoading: boolean;
  isVerifying: boolean;
  // Actions
  refetch: () => void;
  // Filters
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  search: string;
  setSearch: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  paymentFilter: string;
  setPaymentFilter: (value: string) => void;
  // Modal state
  showLinkModal: boolean;
  setShowLinkModal: (open: boolean) => void;
  editingLink: BookingLinkItem | null;
  // Handlers
  handleEditLink: (link: BookingLinkItem) => void;
  handleCloseLinkModal: () => void;
  handleQuickVerify: (eventId: string, paymentId: string) => void;
}

export const useEventList = (): UseEventListReturn => {
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

  const filteredEvents = useMemo(
    () =>
      events.filter((e) => {
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
      }),
    [events, search, statusFilter, paymentFilter],
  );

  const handleEditLink = useCallback((link: BookingLinkItem) => {
    setEditingLink(link);
    setShowLinkModal(true);
  }, []);

  const handleCloseLinkModal = useCallback(() => {
    setShowLinkModal(false);
    setEditingLink(null);
  }, []);

  const handleQuickVerify = useCallback(
    (eventId: string, paymentId: string) => {
      quickVerify.mutate({ eventId, paymentId, action: "verify" });
    },
    [quickVerify],
  );

  return {
    events,
    filteredEvents,
    bookingLinks,
    isLoading,
    isError,
    isLinksLoading,
    isVerifying: quickVerify.isPending,
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
  };
};
