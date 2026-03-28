"use client";

import { useState, createContext, useContext, useCallback } from "react";

// ─── Context ────────────────────────────────────────────────

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tab components must be used within <Tabs>");
  return ctx;
}

// ─── Tabs (Root) ────────────────────────────────────────────

export interface TabsProps {
  defaultTab: string;
  children: React.ReactNode;
  className?: string;
  onChange?: (tabId: string) => void;
}

export function Tabs({ defaultTab, children, className, onChange }: TabsProps) {
  const [activeTab, setActiveTabState] = useState(defaultTab);

  const setActiveTab = useCallback(
    (id: string) => {
      setActiveTabState(id);
      onChange?.(id);
    },
    [onChange],
  );

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

// ─── TabList ────────────────────────────────────────────────

export interface TabListProps {
  children: React.ReactNode;
  className?: string;
}

export function TabList({ children, className }: TabListProps) {
  return (
    <div
      role="tablist"
      className={`flex gap-1 overflow-x-auto border-b border-gray-200 ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

// ─── Tab (Button) ───────────────────────────────────────────

export interface TabProps {
  id: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function Tab({ id, children, icon, className }: TabProps) {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === id;

  return (
    <button
      role="tab"
      type="button"
      aria-selected={isActive}
      onClick={() => setActiveTab(id)}
      className={`inline-flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
        isActive
          ? "border-blue-600 text-blue-600"
          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
      } ${className ?? ""}`}
    >
      {icon}
      {children}
    </button>
  );
}

// ─── TabPanel ───────────────────────────────────────────────

export interface TabPanelProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({ id, children, className }: TabPanelProps) {
  const { activeTab } = useTabsContext();
  if (activeTab !== id) return null;

  return (
    <div role="tabpanel" className={className}>
      {children}
    </div>
  );
}
