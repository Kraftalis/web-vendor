"use client";

import {
  IconCalendar,
  IconEvent,
  IconHome,
  IconPricing,
  IconSettings,
  KraftalisLogo,
} from "@/components/icons";
import {
  LanguageSwitcher,
  NotificationDropdown,
  ProfileDropdown,
} from "@/components/topbar";
import { useDictionary } from "@/i18n";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

/**
 * AppLayout — Google Workspace-inspired authenticated app shell.
 * Clean top navigation bar (desktop) + bottom tab bar (mobile PWA).
 */

interface AppLayoutProps {
  children: ReactNode;
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
  /** Page title shown in the topbar breadcrumb */
  title?: string;
  /** If true, the layout will be full width and have no padding */
  fullWidth?: boolean;
}

interface NavItem {
  labelKey: "home" | "schedule" | "event" | "pricingPackage" | "settings";
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const navItems: NavItem[] = [
  { labelKey: "home", href: "/", icon: IconHome },
  { labelKey: "schedule", href: "/schedule", icon: IconCalendar },
  { labelKey: "event", href: "/event", icon: IconEvent },
  { labelKey: "pricingPackage", href: "/finance", icon: IconPricing },
  { labelKey: "settings", href: "/settings", icon: IconSettings },
];

export default function AppLayout({
  children,
  user,
  fullWidth = false,
}: AppLayoutProps) {
  const pathname = usePathname();
  const { dict } = useDictionary();

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50/60">
      {/* ── Decorative blobs — CSS blur, no SVG, clearly visible ── */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        {/* blue — top right */}
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />
        {/* indigo — top left */}
        <div className="absolute -top-24 -left-32 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />
        {/* sky — center right, mid-page */}
        <div className="absolute top-1/2 right-0 h-64 w-64 rounded-full bg-sky-300/20 blur-3xl" />
        {/* teal — bottom left */}
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-teal-400/20 blur-3xl" />
        {/* amber — bottom right */}
        <div className="absolute -bottom-16 right-12 h-72 w-72 rounded-full bg-amber-300/15 blur-3xl" />
      </div>

      {/* ─── Top Navigation Bar (Desktop + Mobile) ──────── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm shadow-gray-200/60">
        <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Left: Logo + Desktop Nav */}
          <div className="flex items-center gap-8">
            {/* Brand */}
            <Link href="/" className="flex items-center gap-2.5">
              <KraftalisLogo size={32} />
              <span className="hidden text-lg font-semibold text-foreground sm:block">
                Kraftalis
              </span>
            </Link>

            {/* Desktop nav links */}
            <nav className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-accent-light text-accent"
                        : "text-(--text-secondary) hover:bg-gray-100 hover:text-foreground"
                    }`}
                  >
                    <item.icon
                      size={16}
                      className={
                        isActive ? "text-accent" : "text-(--text-tertiary)"
                      }
                    />
                    {dict.nav[item.labelKey]}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <NotificationDropdown />
            <div className="mx-1.5 hidden h-6 w-px bg-(--border) sm:block" />
            {user && <ProfileDropdown user={user} />}
          </div>
        </div>
      </header>

      {/* ─── Page Content ───────────────────────────────── */}
      <main className="flex-1">
        {fullWidth ? (
          children
        ) : (
          <div className="mx-auto px-4 py-6 sm:px-6">{children}</div>
        )}
      </main>

      {/* ─── Mobile Bottom Tab Bar ──────────────────────── */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-(--border) bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[12px] font-medium transition-colors ${
                  isActive
                    ? "text-accent font-semibold"
                    : "text-(--text-tertiary)"
                }`}
              >
                <item.icon
                  size={20}
                  className={
                    isActive ? "text-accent" : "text-(--text-tertiary)"
                  }
                />
                <span>{dict.nav[item.labelKey]}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom padding for mobile nav */}
      <div className="h-16 md:hidden" />
    </div>
  );
}

export type { AppLayoutProps };
