"use client";

import { Card, CardBody } from "@/components/ui";
import { IconActivity } from "@/components/icons";

// ─── Activity Log Tab (placeholder — data will come from API later) ─────

interface ActivityLogTabProps {
  eventId: string;
  labels: {
    noActivityLog: string;
    noActivityLogDesc: string;
  };
  formatDate: (dateStr: string) => string;
}

// Placeholder type for future activity log entries
interface ActivityLogEntry {
  id: string;
  action: string;
  description: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export function ActivityLogTab({
  eventId,
  labels,
  formatDate,
}: ActivityLogTabProps) {
  // TODO: Replace with useActivityLog(eventId) hook when API is ready
  const activities: ActivityLogEntry[] = [];
  void eventId; // suppress unused warning until API is connected

  if (activities.length === 0) {
    return (
      <Card>
        <CardBody>
          <div className="py-12 text-center">
            <IconActivity size={32} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">
              {labels.noActivityLog}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              {labels.noActivityLogDesc}
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="divide-y divide-gray-100">
        {activities.map((entry) => (
          <div key={entry.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
            {/* Timeline dot */}
            <div className="flex flex-col items-center pt-1">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <div className="mt-1 flex-1 border-l border-gray-200" />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">
                {entry.action}
              </p>
              <p className="mt-0.5 text-sm text-gray-600">
                {entry.description}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {formatDate(entry.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
