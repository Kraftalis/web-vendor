import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendClientEventReminder, sendVendorEventsReminder } from "@/lib/email";
import { sendPushToUser } from "@/lib/push";
import { successResponse, unauthorizedError, internalError } from "@/lib/api";

/**
 * GET /api/cron/reminders
 * Called by an external cron service (e.g. Vercel Cron, GitHub Actions).
 * Sends email & push reminders for events happening today and tomorrow.
 * Protected by CRON_SECRET header.
 */
export async function GET(request: NextRequest) {
  const secret = request.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return unauthorizedError("Invalid cron secret.");
  }

  try {
    const now = new Date();

    // Today (start of day in UTC)
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    // Tomorrow
    const tomorrowStart = new Date(todayEnd);
    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

    // Fetch events for today
    const todayEvents = await prisma.event.findMany({
      where: {
        schedules: { some: { date: { gte: todayStart, lt: todayEnd } } },
        eventStatus: { in: ["BOOKED", "ONGOING"] },
      },
      include: {
        schedules: { where: { date: { gte: todayStart, lt: todayEnd } } },
        businessProfile: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    // Fetch events for tomorrow
    const tomorrowEvents = await prisma.event.findMany({
      where: {
        schedules: { some: { date: { gte: tomorrowStart, lt: tomorrowEnd } } },
        eventStatus: { in: ["BOOKED", "ONGOING"] },
      },
      include: {
        schedules: { where: { date: { gte: tomorrowStart, lt: tomorrowEnd } } },
        businessProfile: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    let emailsSent = 0;
    let pushSent = 0;

    // ─── Process each day ──────────────────────────────────
    for (const { events, daysUntil } of [
      { events: todayEvents, daysUntil: 0 },
      { events: tomorrowEvents, daysUntil: 1 },
    ]) {
      // 1. Send client emails (individual)
      for (const event of events) {
        if (event.clientEmail) {
          const pkg = event.packageSnapshot as { name?: string } | null;
          const schedule = event.schedules[0]; // The first matching schedule for this notification
          try {
            await sendClientEventReminder(
              event.clientEmail,
              {
                clientName: event.clientName,
                eventType: event.eventType,
                eventDate: schedule.date.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }),
                eventTime: schedule.startTime,
                eventLocation: event.eventLocation,
                packageName: pkg?.name ?? null,
              },
              daysUntil,
            );
            emailsSent++;
          } catch (err) {
            console.error(
              "[Cron] Client email failed:",
              event.clientEmail,
              err,
            );
          }
        }
      }

      // 2. Group events by vendor (user) & send consolidated vendor email + push
      const vendorMap = new Map<
        string,
        {
          vendor: { id: string; name: string | null; email: string };
          events: (typeof events)[number][];
        }
      >();

      for (const event of events) {
        const vendorUser = event.businessProfile.user;
        const vid = vendorUser.id;
        if (!vendorMap.has(vid)) {
          vendorMap.set(vid, { vendor: vendorUser, events: [] });
        }
        vendorMap.get(vid)!.events.push(event);
      }

      for (const [, { vendor, events: vendorEvents }] of vendorMap) {
        // Email
        try {
          await sendVendorEventsReminder(
            vendor.email,
            vendor.name ?? "Vendor",
            vendorEvents.map((e) => {
              const pkg = e.packageSnapshot as { name?: string } | null;
              const schedule = e.schedules[0];
              return {
                clientName: e.clientName,
                eventType: e.eventType,
                eventDate: schedule.date.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }),
                eventTime: schedule.startTime,
                eventLocation: e.eventLocation,
                packageName: pkg?.name ?? null,
              };
            }),
            daysUntil,
          );
          emailsSent++;
        } catch (err) {
          console.error("[Cron] Vendor email failed:", vendor.email, err);
        }

        // Push notification
        try {
          const dayLabel = daysUntil === 0 ? "today" : "tomorrow";
          const count = vendorEvents.length;
          await sendPushToUser(vendor.id, {
            title: `${count} event${count > 1 ? "s" : ""} ${dayLabel}`,
            body: vendorEvents
              .map((e) => `${e.clientName} — ${e.eventType}`)
              .join(", "),
            url: "/schedule",
            tag: `reminder-${daysUntil}`,
          });
          pushSent++;
        } catch {
          // Push failures are non-critical
        }
      }
    }

    return successResponse({
      emailsSent,
      pushSent,
      todayCount: todayEvents.length,
      tomorrowCount: tomorrowEvents.length,
    });
  } catch (err) {
    console.error("[Cron] Reminder error:", err);
    return internalError();
  }
}
