import type { EventItem, EventScheduleItem } from "@/services/event";
import type { BookingLinkItem } from "@/services/booking";

export interface HomeTemplateProps {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
}

export type UpcomingItem = EventItem & {
  schedule: EventScheduleItem;
  sortDate: Date;
};

export interface UpcomingSummaryItem {
  date: string;
  items: UpcomingItem[];
  eventCount: number;
}

export interface PipelineDataItem {
  name: string;
  count: number;
  key: string;
}

export interface HomeStats {
  upcoming: UpcomingItem[];
  upcomingSummary: UpcomingSummaryItem[];
  totalRevenue: number;
  collectedRevenue: number;
  outstandingRevenue: number;
  uniqueClients: number;
  pipeline: Record<string, number>;
  paymentCounts: { UNPAID: number; DP_PAID: number; PAID: number };
  activeLinks: BookingLinkItem[];
  expiringSoon: BookingLinkItem[];
  conversionRate: number;
  monthlyRevenue: { month: string; amount: number }[];
  avgEventValue: number;
}

export const PIPELINE_BAR_COLORS: Record<string, string> = {
  INQUIRY: "#3b82f6",
  WAITING_CONFIRMATION: "#f59e0b",
  BOOKED: "#10b981",
  ONGOING: "#8b5cf6",
  COMPLETED: "#64748b",
};

export const STATUS_PILL: Record<string, string> = {
  INQUIRY: "bg-blue-50 text-blue-700 border-blue-100",
  WAITING_CONFIRMATION: "bg-amber-50 text-amber-700 border-amber-100",
  BOOKED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  ONGOING: "bg-violet-50 text-violet-700 border-violet-100",
  COMPLETED: "bg-slate-50 text-slate-600 border-slate-100",
};

export const PIPELINE_LABELS: Record<string, string> = {
  INQUIRY: "Inquiry",
  WAITING_CONFIRMATION: "Konfirmasi",
  BOOKED: "Booking",
  ONGOING: "Jalan",
  COMPLETED: "Selesai",
};
