"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout";
import { PackageOpen, Wallet, BarChart3 } from "lucide-react";
import { PricingTab } from "./packages";
import { TransactionsTab } from "./transactions";
import { ReportsTab } from "./reports";

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

export const FinanceTemplate = ({ user }: FinanceTemplateProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>("packages");

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    {
      key: "packages",
      label: "Paket & Add-on",
      icon: <PackageOpen size={16} />,
    },
    {
      key: "transactions",
      label: "Transaksi",
      icon: <Wallet size={16} />,
    },
    {
      key: "reports",
      label: "Laporan",
      icon: <BarChart3 size={16} />,
    },
  ];

  return (
    <AppLayout user={user} contentContainerClassName="max-w-6xl pb-20">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Keuangan
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola paket, transaksi, dan laporan keuangan bisnis Anda
          </p>
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
};
