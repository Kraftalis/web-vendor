"use client";

import { useMemo } from "react";
import { useEvents } from "@/hooks/event";
import { useBookingLinks } from "@/hooks/booking";
import { PIPELINE_LABELS } from "./types";
import type { HomeStats, PipelineDataItem } from "./types";

export const useHomeStats = () => {
  const { data: events = [], isLoading: eventsLoading } = useEvents();
  const { data: bookingLinks = [], isLoading: linksLoading } =
    useBookingLinks();
  const isLoading = eventsLoading || linksLoading;

  const stats = useMemo((): HomeStats => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = events
      .flatMap((e) =>
        (e.schedules || []).map((s) => ({
          ...e,
          schedule: s,
          sortDate: new Date(s.date),
        })),
      )
      .filter((item) => {
        const d = new Date(item.sortDate);
        d.setHours(0, 0, 0, 0);
        return d >= today && item.eventStatus !== "COMPLETED";
      })
      .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime());

    const upcomingByDate: Record<string, typeof upcoming> = {};
    for (const item of upcoming) {
      const dateKey = new Date(item.schedule.date).toISOString().split("T")[0];
      if (!upcomingByDate[dateKey]) upcomingByDate[dateKey] = [];
      upcomingByDate[dateKey].push(item);
    }
    const upcomingSummary = Object.entries(upcomingByDate)
      .map(([date, items]) => ({ date, items, eventCount: items.length }))
      .sort((a, b) => a.date.localeCompare(b.date));

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

    const uniqueClients = new Set(
      events.map((e) => e.clientPhone || e.clientName),
    ).size;

    const pipeline: Record<string, number> = {
      INQUIRY: 0,
      WAITING_CONFIRMATION: 0,
      BOOKED: 0,
      ONGOING: 0,
      COMPLETED: 0,
    };
    for (const e of events) {
      if (pipeline[e.eventStatus] !== undefined) pipeline[e.eventStatus]++;
    }

    const paymentCounts = { UNPAID: 0, DP_PAID: 0, PAID: 0 };
    for (const e of events) {
      if (e.paymentStatus in paymentCounts) {
        paymentCounts[e.paymentStatus as keyof typeof paymentCounts]++;
      }
    }

    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return d;
    });
    const monthlyRevenue = last6Months.map((d) => ({
      month: d.toLocaleString("default", { month: "short" }),
      amount: events
        .filter((e) => {
          const ed = e.schedules?.[0] ? new Date(e.schedules[0].date) : null;
          return (
            ed &&
            ed.getFullYear() === d.getFullYear() &&
            ed.getMonth() === d.getMonth() &&
            e.amount
          );
        })
        .reduce((sum, e) => sum + (e.amount ? parseFloat(e.amount) : 0), 0),
    }));

    const activeLinks = bookingLinks.filter(
      (l) => new Date(l.expiresAt) > today && !l.event,
    );
    const expiringSoon = activeLinks.filter((l) => {
      const hoursLeft =
        (new Date(l.expiresAt).getTime() - today.getTime()) / (1000 * 60 * 60);
      return hoursLeft < 24;
    });

    const converted = events.filter((e) => e.eventStatus !== "INQUIRY").length;
    const conversionRate =
      events.length > 0 ? Math.round((converted / events.length) * 100) : 0;

    return {
      upcoming,
      upcomingSummary,
      totalRevenue,
      collectedRevenue,
      outstandingRevenue,
      uniqueClients,
      pipeline,
      paymentCounts,
      activeLinks,
      expiringSoon,
      conversionRate,
      monthlyRevenue,
      avgEventValue: events.length > 0 ? totalRevenue / events.length : 0,
    };
  }, [events, bookingLinks]);

  const pipelineData = useMemo((): PipelineDataItem[] => {
    return Object.entries(stats.pipeline).map(([key, count]) => ({
      name: PIPELINE_LABELS[key] ?? key,
      count,
      key,
    }));
  }, [stats.pipeline]);

  return { events, isLoading, stats, pipelineData };
};
