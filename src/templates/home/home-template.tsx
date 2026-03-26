"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout";
import { StatCard } from "@/components/dashboard";
import { Badge } from "@/components/ui";
import {
  IconCalendar,
  IconEvent,
  IconUsers,
  IconDollar,
  IconLink,
  IconChevronRight,
  IconClock,
} from "@/components/icons";
import BookingLinkModal from "@/templates/event/booking-link-modal/booking-link-modal";
import { useDictionary } from "@/i18n";
import { useEvents } from "@/hooks/event";
import { useBookingLinks } from "@/hooks/booking";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// ─── Types ──────────────────────────────────────────────────

interface HomeTemplateProps {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
}

// ─── Helpers ────────────────────────────────────────────────

function formatCurrency(amount: number, currency = "IDR"): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
}

const PIPELINE_BAR_COLORS: Record<string, string> = {
  INQUIRY: "#3b82f6",
  WAITING_CONFIRMATION: "#f59e0b",
  BOOKED: "#22c55e",
  ONGOING: "#a855f7",
  COMPLETED: "#6b7280",
};

const STATUS_PILL: Record<string, string> = {
  INQUIRY: "bg-blue-100 text-blue-700",
  WAITING_CONFIRMATION: "bg-amber-100 text-amber-700",
  BOOKED: "bg-green-100 text-green-700",
  ONGOING: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-gray-100 text-gray-600",
};

// ─── Component ──────────────────────────────────────────────

export default function HomeTemplate({ user }: HomeTemplateProps) {
  const { dict } = useDictionary();
  const { data: events = [], isLoading: eventsLoading } = useEvents();
  const { data: bookingLinks = [], isLoading: linksLoading } =
    useBookingLinks();

  const isLoading = eventsLoading || linksLoading;
  const [showLinkModal, setShowLinkModal] = useState(false);

  // ─── Computed stats ─────────────────────────────────────

  const stats = useMemo(() => {
    const now = new Date();

    // Revenue
    const totalRevenue = events.reduce(
      (sum, e) => sum + (e.amount ? parseFloat(e.amount) : 0),
      0,
    );
    const paidEvents = events.filter((e) => e.paymentStatus === "PAID");
    const collectedRevenue = paidEvents.reduce(
      (sum, e) => sum + (e.amount ? parseFloat(e.amount) : 0),
      0,
    );
    const outstandingRevenue = totalRevenue - collectedRevenue;

    // Unique clients
    const uniqueClients = new Set(
      events.map((e) => e.clientPhone || e.clientName),
    ).size;

    // Upcoming events (today or future, not completed)
    const upcoming = events
      .filter((e) => {
        const d = new Date(e.eventDate);
        d.setHours(0, 0, 0, 0);
        const t = new Date();
        t.setHours(0, 0, 0, 0);
        return d >= t && e.eventStatus !== "COMPLETED";
      })
      .sort(
        (a, b) =>
          new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime(),
      );

    // Event pipeline counts
    const pipeline: Record<string, number> = {
      INQUIRY: 0,
      WAITING_CONFIRMATION: 0,
      BOOKED: 0,
      ONGOING: 0,
      COMPLETED: 0,
    };
    for (const e of events) {
      if (pipeline[e.eventStatus] !== undefined) {
        pipeline[e.eventStatus]++;
      }
    }

    // Payment status counts
    const paymentCounts: Record<string, number> = {
      UNPAID: 0,
      DP_PAID: 0,
      PAID: 0,
    };
    for (const e of events) {
      if (paymentCounts[e.paymentStatus] !== undefined) {
        paymentCounts[e.paymentStatus]++;
      }
    }

    // Monthly revenue (last 6 months)
    const monthlyRevenue: { month: string; amount: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleDateString("en-US", { month: "short" });
      const amount = events
        .filter((e) => {
          const ed = new Date(e.eventDate);
          return (
            ed.getFullYear() === d.getFullYear() &&
            ed.getMonth() === d.getMonth() &&
            e.amount
          );
        })
        .reduce((sum, e) => sum + (e.amount ? parseFloat(e.amount) : 0), 0);
      monthlyRevenue.push({ month: monthLabel, amount });
    }

    // Active booking links (not expired, not yet converted)
    const activeLinks = bookingLinks.filter(
      (l) => new Date(l.expiresAt) > now && !l.event,
    );
    const expiringSoon = activeLinks.filter((l) => {
      const hoursLeft =
        (new Date(l.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60);
      return hoursLeft < 24;
    });

    // Conversion: events with status beyond INQUIRY / total events
    const converted = events.filter((e) => e.eventStatus !== "INQUIRY").length;
    const conversionRate =
      events.length > 0 ? Math.round((converted / events.length) * 100) : 0;

    // Avg event value
    const eventsWithAmount = events.filter(
      (e) => e.amount && parseFloat(e.amount) > 0,
    );
    const avgEventValue =
      eventsWithAmount.length > 0
        ? eventsWithAmount.reduce((sum, e) => sum + parseFloat(e.amount!), 0) /
          eventsWithAmount.length
        : 0;

    return {
      totalRevenue,
      collectedRevenue,
      outstandingRevenue,
      uniqueClients,
      upcoming,
      pipeline,
      paymentCounts,
      monthlyRevenue,
      activeLinks,
      expiringSoon,
      conversionRate,
      avgEventValue,
    };
  }, [events, bookingLinks]);

  // ─── Pipeline chart data ────────────────────────────────

  const pipelineData = useMemo(() => {
    const labels: Record<string, string> = {
      INQUIRY: dict.dashboard.inquiry,
      WAITING_CONFIRMATION: dict.dashboard.waitingConfirmation,
      BOOKED: dict.dashboard.booked,
      ONGOING: dict.dashboard.ongoing,
      COMPLETED: dict.dashboard.completed,
    };
    return Object.entries(stats.pipeline).map(([key, count]) => ({
      name: labels[key] ?? key,
      count,
      key,
    }));
  }, [stats.pipeline, dict]);

  // ─── Render ─────────────────────────────────────────────

  return (
    <AppLayout user={user} title={dict.nav.home}>
      {/* ─── Welcome Header ─────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          {dict.dashboard.welcomeBack}
          {user?.name ? `, ${user.name}` : ""}! 👋
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {dict.dashboard.hereIsOverview}
        </p>
      </div>

      {/* ─── Stat Cards ─────────────────────────────────── */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<IconDollar size={20} />}
          title={dict.dashboard.totalRevenue}
          value={isLoading ? "—" : formatCurrency(stats.totalRevenue)}
          trend={
            stats.collectedRevenue > 0
              ? {
                  value: `${Math.round((stats.collectedRevenue / Math.max(stats.totalRevenue, 1)) * 100)}% ${dict.dashboard.collected.toLowerCase()}`,
                  direction: "up" as const,
                }
              : undefined
          }
        />
        <StatCard
          icon={<IconEvent size={20} />}
          title={dict.dashboard.totalEvents}
          value={isLoading ? "—" : String(events.length)}
          trend={
            stats.upcoming.length > 0
              ? {
                  value: `${stats.upcoming.length} ${dict.dashboard.upcomingEvents.toLowerCase()}`,
                  direction: "up" as const,
                }
              : undefined
          }
        />
        <StatCard
          icon={<IconUsers size={20} />}
          title={dict.dashboard.totalClients}
          value={isLoading ? "—" : String(stats.uniqueClients)}
        />
        <StatCard
          icon={<IconLink size={20} />}
          title={dict.dashboard.activeOfferingsCount}
          value={isLoading ? "—" : String(stats.activeLinks.length)}
          trend={
            stats.expiringSoon.length > 0
              ? {
                  value: `${stats.expiringSoon.length} ${dict.dashboard.expiringSoon.toLowerCase()}`,
                  direction: "down" as const,
                }
              : undefined
          }
        />
      </div>

      {/* ─── Two-Column: Pipeline + Revenue Chart ───────── */}
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        {/* Event Pipeline */}
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900">
              {dict.dashboard.eventPipeline}
            </h2>
            <Link
              href="/vendor/event"
              className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              {dict.dashboard.viewAll}
              <IconChevronRight size={14} />
            </Link>
          </div>

          {events.length === 0 && !isLoading ? (
            <EmptyState
              icon={<IconEvent size={24} />}
              title={dict.dashboard.noEventsInPipeline}
              desc={dict.dashboard.noEventsInPipelineDesc}
            />
          ) : (
            <div className="p-5">
              {/* Pipeline bar chart */}
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={pipelineData}
                    margin={{ top: 5, right: 5, bottom: 5, left: -20 }}
                  >
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 8,
                        border: "1px solid #e5e7eb",
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={36}>
                      {pipelineData.map((entry) => (
                        <Cell
                          key={entry.key}
                          fill={PIPELINE_BAR_COLORS[entry.key] ?? "#6b7280"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pipeline legend pills */}
              <div className="mt-3 flex flex-wrap gap-2">
                {pipelineData.map((item) => (
                  <span
                    key={item.key}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_PILL[item.key] ?? "bg-gray-100 text-gray-600"}`}
                  >
                    <span className="text-sm font-bold">{item.count}</span>
                    {item.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Monthly Revenue Chart */}
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900">
              {dict.dashboard.monthlyRevenue}
            </h2>
          </div>

          {stats.monthlyRevenue.every((m) => m.amount === 0) && !isLoading ? (
            <EmptyState
              icon={<IconDollar size={24} />}
              title={dict.dashboard.noRevenueData}
              desc={dict.dashboard.noRevenueDesc}
            />
          ) : (
            <div className="p-5">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.monthlyRevenue}
                    margin={{ top: 5, right: 5, bottom: 5, left: -10 }}
                  >
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) =>
                        v >= 1_000_000
                          ? `${(v / 1_000_000).toFixed(0)}M`
                          : v >= 1_000
                            ? `${(v / 1_000).toFixed(0)}K`
                            : String(v)
                      }
                    />
                    <Tooltip
                      formatter={(value) => [
                        formatCurrency(Number(value)),
                        dict.dashboard.amount,
                      ]}
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 8,
                        border: "1px solid #e5e7eb",
                      }}
                    />
                    <Bar
                      dataKey="amount"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      barSize={36}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Revenue summary line */}
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                <span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(stats.collectedRevenue)}
                  </span>{" "}
                  {dict.dashboard.collected.toLowerCase()}
                </span>
                <span>•</span>
                <span>
                  <span className="font-semibold text-amber-600">
                    {formatCurrency(stats.outstandingRevenue)}
                  </span>{" "}
                  {dict.dashboard.outstanding.toLowerCase()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Two-Column: Upcoming Events + Financial ────── */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Upcoming Events — 3/5 */}
        <div className="lg:col-span-3">
          <div className="rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-900">
                {dict.dashboard.upcomingEvents}
              </h2>
              <Link
                href="/vendor/schedule"
                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                {dict.dashboard.viewAll}
                <IconChevronRight size={14} />
              </Link>
            </div>

            {stats.upcoming.length === 0 && !isLoading ? (
              <EmptyState
                icon={<IconCalendar size={24} />}
                title={dict.dashboard.noUpcomingEvents}
                desc={dict.dashboard.noUpcomingEventsDesc}
              />
            ) : (
              <div className="divide-y divide-gray-100">
                {stats.upcoming.slice(0, 5).map((event) => {
                  const days = daysUntil(event.eventDate);
                  const dateLabel = new Date(
                    event.eventDate,
                  ).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  });
                  const daysLabel =
                    days === 0
                      ? dict.dashboard.today
                      : days === 1
                        ? dict.dashboard.tomorrow
                        : `${days} ${dict.dashboard.daysAway}`;

                  return (
                    <Link
                      key={event.id}
                      href={`/event/${event.id}`}
                      className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-gray-50"
                    >
                      {/* Date badge */}
                      <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <span className="text-lg font-bold leading-none">
                          {new Date(event.eventDate).getDate()}
                        </span>
                        <span className="text-[10px] font-medium uppercase">
                          {new Date(event.eventDate).toLocaleDateString(
                            "en-US",
                            { month: "short" },
                          )}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {event.clientName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {event.eventType} • {dateLabel}
                          {event.eventTime ? ` • ${event.eventTime}` : ""}
                        </p>
                      </div>

                      {/* Right side */}
                      <div className="flex flex-col items-end gap-1">
                        <Badge
                          variant={
                            event.eventStatus === "BOOKED"
                              ? "success"
                              : event.eventStatus === "WAITING_CONFIRMATION"
                                ? "warning"
                                : "default"
                          }
                          dot
                        >
                          {event.eventStatus.replace("_", " ")}
                        </Badge>
                        <span className="flex items-center gap-1 text-[10px] text-gray-400">
                          <IconClock size={10} />
                          {daysLabel}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Financial Summary — 2/5 */}
        <div className="lg:col-span-2 space-y-4">
          {/* Financial card */}
          <div className="rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-5 py-4">
              <h2 className="text-sm font-semibold text-gray-900">
                {dict.dashboard.financialSummary}
              </h2>
            </div>
            <div className="p-5 space-y-4">
              {/* Payment breakdown bars */}
              <div className="space-y-3">
                <FinancialRow
                  label={dict.dashboard.paidAmount}
                  count={stats.paymentCounts.PAID}
                  total={events.length}
                  color="bg-green-500"
                />
                <FinancialRow
                  label={dict.dashboard.dpPaidAmount}
                  count={stats.paymentCounts.DP_PAID}
                  total={events.length}
                  color="bg-amber-500"
                />
                <FinancialRow
                  label={dict.dashboard.unpaidAmount}
                  count={stats.paymentCounts.UNPAID}
                  total={events.length}
                  color="bg-red-500"
                />
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">
                    {dict.dashboard.conversionRate}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {stats.conversionRate}%
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">
                    {dict.dashboard.avgEventValue}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(stats.avgEventValue)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Floating Action Button ──────────────────────── */}
      <button
        onClick={() => setShowLinkModal(true)}
        className="fixed bottom-22 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-700 active:scale-95 md:bottom-6"
        aria-label={dict.event.generateLink}
      >
        <IconLink size={22} />
      </button>

      <BookingLinkModal
        open={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        labels={dict.bookingLink}
      />
    </AppLayout>
  );
}

// ─── Sub-components ─────────────────────────────────────────

function EmptyState({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        {icon}
      </div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-1 text-xs text-gray-400">{desc}</p>
    </div>
  );
}

function FinancialRow({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">
          {count} <span className="text-gray-400">({pct}%)</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
