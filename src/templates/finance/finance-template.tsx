"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout";
import { IconPricing, IconWallet, IconChartBar } from "@/components/icons";
import { useDictionary } from "@/i18n";
import PricingTab from "./pricing-tab";
import TransactionsTab from "./transactions-tab";
import ReportsTab from "./reports-tab";

// ─── Types ──────────────────────────────────────────────────

type TabKey = "packages" | "transactions" | "reports";

interface FinanceTemplateProps {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
}

// ─── Component ──────────────────────────────────────────────

export default function FinanceTemplate({ user }: FinanceTemplateProps) {
  const { dict } = useDictionary();
  const f = dict.finance;

  const [activeTab, setActiveTab] = useState<TabKey>("packages");

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    {
      key: "packages",
      label: f.tabPackages,
      icon: <IconPricing size={16} />,
    },
    {
      key: "transactions",
      label: f.tabTransactions,
      icon: <IconWallet size={16} />,
    },
    {
      key: "reports",
      label: f.tabReports,
      icon: <IconChartBar size={16} />,
    },
  ];

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {f.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{f.subtitle}</p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 overflow-x-auto border-b border-gray-200">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {activeTab === "packages" && <PricingTab />}
        {activeTab === "transactions" && <TransactionsTab />}
        {activeTab === "reports" && <ReportsTab />}
      </div>
    </AppLayout>
  );
}
