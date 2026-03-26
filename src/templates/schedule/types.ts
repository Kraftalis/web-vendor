import type { BadgeVariant } from "@/components/ui";

// ─── Types ──────────────────────────────────────────────────

export interface ScheduleEvent {
  id: string;
  clientName: string;
  eventType: string;
  eventCategoryName: string | null;
  eventDate: string; // ISO
  eventTime: string | null;
  eventLocation: string | null;
  packageName: string | null;
  eventStatus: string;
  paymentStatus: string;
}

export interface ScheduleTemplateProps {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
}

export type ViewMode = "calendar" | "agenda";

export interface CalendarDay {
  date: Date;
  inMonth: boolean;
  events: ScheduleEvent[];
}

// ─── Helpers ────────────────────────────────────────────────

export function eventStatusVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    INQUIRY: "info",
    WAITING_CONFIRMATION: "warning",
    BOOKED: "success",
    ONGOING: "primary",
    COMPLETED: "default",
  };
  return map[status] ?? "default";
}

export function eventTypeColor(type: string): string {
  const map: Record<string, string> = {
    Wedding: "bg-pink-500",
    Engagement: "bg-rose-400",
    Birthday: "bg-amber-500",
    Graduation: "bg-indigo-500",
    Corporate: "bg-slate-600",
    Other: "bg-gray-400",
  };
  return map[type] ?? "bg-gray-400";
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
