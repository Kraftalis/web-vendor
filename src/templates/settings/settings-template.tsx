"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout";
import { Card, CardHeader, CardBody, Button } from "@/components/ui";
import {
  IconBell,
  IconCheck,
  IconBriefcase,
  IconSettings,
  IconCalendar,
} from "@/components/icons";
import { useDictionary } from "@/i18n";
import { useCategories } from "@/hooks/pricing";
import { useEventCategories } from "@/hooks/event-category";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import BusinessProfileForm from "./business-profile-form";
import CategoryList from "./category-list";
import EventCategoryList from "./event-category-list";
import type { Category } from "@/services/pricing";
import type { EventCategory } from "@/services/event-category/types";

// ─── Types ──────────────────────────────────────────────────

type TabKey =
  | "business-profile"
  | "notifications"
  | "categories"
  | "event-categories";

interface SettingsTemplateProps {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
}

// ─── Component ──────────────────────────────────────────────

export default function SettingsTemplate({ user }: SettingsTemplateProps) {
  const { dict } = useDictionary();
  const s = dict.settings;

  // ─── Tabs ─────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabKey>("business-profile");

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    {
      key: "business-profile",
      label: s.tabBusinessProfile,
      icon: <IconBriefcase size={16} />,
    },
    {
      key: "notifications",
      label: s.tabNotifications,
      icon: <IconBell size={16} />,
    },
  ];

  // Queries
  const categoriesQuery = useCategories();
  const categories: Category[] = categoriesQuery.data ?? [];

  const eventCatQuery = useEventCategories();
  const eventCategories: EventCategory[] = eventCatQuery.data ?? [];

  // ─── Push notifications ───────────────────────────────────
  const push = usePushNotifications();
  const pn = dict.pushNotifications;

  // ─── Render ───────────────────────────────────────────────

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {s.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{s.subtitle}</p>
        </div>

        {/* Tab Navigation */}
        <div className="-mb-px flex gap-1 overflow-x-auto border-b border-(--border)">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "border-accent text-accent"
                  : "border-transparent text-(--text-secondary) hover:border-gray-300 hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "business-profile" && (
          <Card>
            <CardBody>
              <BusinessProfileForm />
            </CardBody>
          </Card>
        )}

        {activeTab === "notifications" && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <IconBell size={18} className="text-accent" />
                <h2 className="text-lg font-semibold text-gray-900">
                  {pn.title}
                </h2>
              </div>
              <p className="mt-0.5 text-sm text-gray-500">{pn.subtitle}</p>
            </CardHeader>
            <CardBody>
              {!push.isSupported ? (
                <p className="text-sm text-gray-500">{pn.notSupported}</p>
              ) : push.permission === "denied" ? (
                <div className="rounded-lg bg-red-50 px-4 py-3">
                  <p className="text-sm font-medium text-red-700">
                    {pn.denied}
                  </p>
                  <p className="mt-1 text-xs text-red-600">{pn.deniedDesc}</p>
                </div>
              ) : push.isSubscribed ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                      <IconCheck size={16} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {pn.enabled}
                      </p>
                      <p className="text-xs text-gray-500">{pn.enabledDesc}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => push.unsubscribe()}
                  >
                    {pn.disable}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {pn.disabled}
                    </p>
                    <p className="text-xs text-gray-500">{pn.disabledDesc}</p>
                  </div>
                  <Button size="sm" onClick={() => push.subscribe()}>
                    {pn.enable}
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {activeTab === "categories" && (
          <CategoryList
            categories={categories}
            isLoading={categoriesQuery.isLoading}
            dict={dict}
          />
        )}

        {activeTab === "event-categories" && (
          <EventCategoryList
            categories={eventCategories}
            isLoading={eventCatQuery.isLoading}
            dict={dict}
          />
        )}
      </div>
    </AppLayout>
  );
}
