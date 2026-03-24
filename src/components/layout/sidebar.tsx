"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconHome,
  IconCalendar,
  IconEvent,
  IconWallet,
  IconSettings,
  IconChevronLeft,
  IconChevronRight,
} from "@/components/icons";
import { useSidebarStore } from "@/stores/sidebar-store";
import { useDictionary } from "@/i18n";

/**
 * Navigation item config used by the sidebar.
 */
interface NavItem {
  labelKey: "home" | "schedule" | "event" | "pricingPackage" | "settings";
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  groupKey: "main" | "other";
}

const navigation: NavItem[] = [
  { labelKey: "home", href: "/", icon: IconHome, groupKey: "main" },
  {
    labelKey: "schedule",
    href: "/schedule",
    icon: IconCalendar,
    groupKey: "main",
  },
  { labelKey: "event", href: "/event", icon: IconEvent, groupKey: "main" },
  {
    labelKey: "pricingPackage",
    href: "/finance",
    icon: IconWallet,
    groupKey: "main",
  },
  {
    labelKey: "settings",
    href: "/settings",
    icon: IconSettings,
    groupKey: "other",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebarStore();
  const { dict } = useDictionary();

  // Group nav items
  const groups = navigation.reduce<Record<string, NavItem[]>>((acc, item) => {
    const group = item.groupKey;
    acc[group] = acc[group] ?? [];
    acc[group].push(item);
    return acc;
  }, {});

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={toggle}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white transition-all duration-200 ease-in-out lg:static lg:z-auto ${
          collapsed ? "w-[70px]" : "w-[250px]"
        } ${collapsed ? "-translate-x-full lg:translate-x-0" : "translate-x-0"}`}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <span className="text-sm font-bold text-white">K</span>
              </div>
              <span className="text-base font-bold tracking-tight text-slate-900">
                Kraftalis
              </span>
            </Link>
          )}
          {collapsed && (
            <Link href="/" className="mx-auto flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <span className="text-sm font-bold text-white">K</span>
              </div>
            </Link>
          )}
          <button
            onClick={toggle}
            className={`hidden rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:flex ${
              collapsed ? "mx-auto mt-2" : ""
            }`}
            aria-label="Toggle sidebar"
          >
            {collapsed ? (
              <IconChevronRight size={16} />
            ) : (
              <IconChevronLeft size={16} />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {Object.entries(groups).map(([groupKey, items]) => (
            <div key={groupKey} className="mb-4">
              {!collapsed && (
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {dict.nav[groupKey as "main" | "other"]}
                </p>
              )}
              <ul className="space-y-1">
                {items.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);
                  const label = dict.nav[item.labelKey];
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-blue-50 text-blue-700"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        } ${collapsed ? "justify-center px-0" : ""}`}
                        title={collapsed ? label : undefined}
                      >
                        <item.icon
                          size={20}
                          className={
                            isActive ? "text-blue-600" : "text-slate-400"
                          }
                        />
                        {!collapsed && <span>{label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Sidebar footer — version or help */}
        {!collapsed && (
          <div className="border-t border-slate-100 px-4 py-3">
            <p className="text-[11px] text-slate-400">Kraftalis v0.1.0</p>
          </div>
        )}
      </aside>
    </>
  );
}
