"use client";

import { useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout";
import StatCard from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui";
import {
  BadgeDollarSign,
  Briefcase,
  Users,
  Link as LinkIcon,
  Plus,
} from "lucide-react";
import { BookingLinkModal } from "@/templates/event/booking-link-modal/booking-link-modal";
import { useHomeStats } from "./use-home-stats";
import { PipelineChart } from "./pipeline-chart";
import { RevenueChart } from "./revenue-chart";
import { UpcomingEvents } from "./upcoming-events";
import { FinancialHealth } from "./financial-health";
import { formatCurrency } from "./utils";
import type { HomeTemplateProps } from "./types";

export const HomeTemplate = ({ user }: HomeTemplateProps) => {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const { events, isLoading, stats, pipelineData } = useHomeStats();

  return (
    <AppLayout user={user} title="Dashboard Overview">
      {/* ─── Welcome Header ──────────────────────────────── */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
            Halo{user?.name ? `, ${user.name}` : ""}! ✨
          </h1>
          <p className="mt-1 text-sm font-medium text-gray-500">
            Ada {stats.upcoming.length} acara yang menunggu di jadwal Anda.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowLinkModal(true)}
            size="lg"
            className="group flex-1 rounded-xl shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-95 sm:flex-none"
          >
            <LinkIcon
              size={18}
              className="transition-transform group-hover:rotate-12"
            />
            Booking Link
          </Button>
        </div>
      </div>

      {/* ─── Stat Cards ──────────────────────────────────── */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<BadgeDollarSign size={20} />}
          title="Total Pendapatan"
          value={isLoading ? "—" : formatCurrency(stats.totalRevenue)}
          trend={
            stats.collectedRevenue > 0
              ? {
                  value: `${Math.round((stats.collectedRevenue / Math.max(stats.totalRevenue, 1)) * 100)}%`,
                  direction: "up",
                }
              : undefined
          }
        />
        <StatCard
          icon={<Briefcase size={20} />}
          title="Total Acara"
          value={isLoading ? "—" : String(events.length)}
          trend={
            stats.upcoming.length > 0
              ? { value: `${stats.upcoming.length} baru`, direction: "up" }
              : undefined
          }
        />
        <StatCard
          icon={<Users size={20} />}
          title="Total Klien"
          value={isLoading ? "—" : String(stats.uniqueClients)}
        />
        <StatCard
          icon={<LinkIcon size={20} />}
          title="Tautan Aktif"
          value={isLoading ? "—" : String(stats.activeLinks.length)}
          trend={
            stats.expiringSoon.length > 0
              ? {
                  value: `${stats.expiringSoon.length} segera`,
                  direction: "down",
                }
              : undefined
          }
        />
      </div>

      {/* ─── Main Dashboard Grid ─────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        {/* Left Column: Analytics (8/12) */}
        <div className="space-y-6 lg:col-span-8">
          <div className="grid gap-6 md:grid-cols-2">
            <PipelineChart
              pipelineData={pipelineData}
              isEmpty={events.length === 0 && !isLoading}
            />
            <RevenueChart
              monthlyRevenue={stats.monthlyRevenue}
              collectedRevenue={stats.collectedRevenue}
              outstandingRevenue={stats.outstandingRevenue}
              isEmpty={
                stats.monthlyRevenue.every((m) => m.amount === 0) && !isLoading
              }
            />
          </div>
          <UpcomingEvents
            upcomingSummary={stats.upcomingSummary}
            isLoading={isLoading}
          />
        </div>

        {/* Right Column: Financial & Shortcuts (4/12) */}
        <div className="space-y-6 lg:col-span-4">
          <FinancialHealth
            paymentCounts={stats.paymentCounts}
            totalEvents={events.length}
            conversionRate={stats.conversionRate}
            avgEventValue={stats.avgEventValue}
          />

          {/* Quick Shortcuts */}
          <div className="rounded-2xl border border-gray-100 bg-linear-to-br from-gray-900 to-gray-800 p-6 text-white shadow-xl shadow-gray-900/10">
            <h2 className="mb-4 text-sm font-bold tracking-tight">
              Cepat &amp; Responsif
            </h2>
            <p className="mb-6 text-xs text-gray-400">
              Optimalkan kinerja bisnis Anda dengan fitur cepat.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/event/new"
                className="flex items-center gap-2 rounded-xl bg-white/10 p-3 transition-colors hover:bg-white/20"
              >
                <Plus size={16} />
                <span className="text-xs font-bold">Event</span>
              </Link>
              <Button
                variant="secondary"
                onClick={() => setShowLinkModal(true)}
                className="group flex h-auto items-center justify-start gap-2 rounded-xl bg-blue-500/20 p-3 text-blue-300 transition-colors hover:bg-blue-500/30 border-none"
              >
                <LinkIcon size={16} />
                <span className="text-xs font-bold">Link</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <BookingLinkModal
        isOpen={showLinkModal}
        onOpenChange={(open) => {
          if (!open) setShowLinkModal(false);
        }}
      />
    </AppLayout>
  );
};
