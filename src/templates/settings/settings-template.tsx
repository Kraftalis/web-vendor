"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui";
import {
  Bell,
  Check,
  Briefcase,
  Tags,
  FolderGit2,
  ChevronRight,
  Settings2,
} from "lucide-react";
import { useCategories } from "@/hooks/pricing";
import { useEventCategories } from "@/hooks/event-category";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { BusinessProfileForm } from "./business-profile-form";
import { CategoryList } from "./category-list";
import { EventCategoryList } from "./event-category-list";
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

export const SettingsTemplate = ({ user }: SettingsTemplateProps) => {
  // ─── Tabs ─────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabKey>("business-profile");

  const tabs: {
    key: TabKey;
    label: string;
    description: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: "business-profile",
      label: "Profil Bisnis",
      description: "Informasi dasar & identitas bisnis",
      icon: <Briefcase size={20} />,
    },
    {
      key: "categories",
      label: "Kategori Layanan",
      description: "Kelola grup paket layanan Anda",
      icon: <Tags size={20} />,
    },
    {
      key: "event-categories",
      label: "Kategori Acara",
      description: "Tipe acara yang Anda tangani",
      icon: <FolderGit2 size={20} />,
    },
    {
      key: "notifications",
      label: "Notifikasi",
      description: "Pengaturan pemberitahuan",
      icon: <Bell size={20} />,
    },
  ];

  // Queries
  const categoriesQuery = useCategories();
  const categories: Category[] = categoriesQuery.data ?? [];

  const eventCatQuery = useEventCategories();
  const eventCategories: EventCategory[] = eventCatQuery.data ?? [];

  // ─── Push notifications ───────────────────────────────────
  const push = usePushNotifications();

  // ─── Render ───────────────────────────────────────────────

  return (
    <AppLayout user={user} contentContainerClassName="max-w-7xl pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Settings2 className="text-accent h-8 w-8" />
            Pengaturan
          </h1>
          <p className="mt-2 text-base text-slate-500">
            Kelola profil bisnis, preferensi, dan konfigurasi layanan Anda.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-72 shrink-0">
          <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide snap-x">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`group relative flex items-center gap-4 rounded-xl px-4 py-3 text-left transition-all duration-200 snap-start
                    ${
                      isActive
                        ? "bg-white shadow-sm ring-1 ring-slate-200"
                        : "hover:bg-slate-100/50 text-slate-600 hover:text-slate-900"
                    }
                  `}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors
                      ${
                        isActive
                          ? "bg-accent/10 text-accent"
                          : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700"
                      }
                    `}
                  >
                    {tab.icon}
                  </div>
                  <div className="flex flex-col hidden sm:block">
                    <span
                      className={`text-sm font-semibold ${
                        isActive ? "text-slate-900" : "text-slate-700"
                      }`}
                    >
                      {tab.label}
                    </span>
                    <span className="text-xs text-slate-500 line-clamp-1">
                      {tab.description}
                    </span>
                  </div>
                  {isActive && (
                    <ChevronRight
                      size={18}
                      className="absolute right-4 text-slate-400 hidden lg:block"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {activeTab === "business-profile" && (
              <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Profil Bisnis
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Informasi ini akan ditampilkan kepada klien Anda di halaman
                    pemesanan.
                  </p>
                </div>
                <div className="p-6">
                  <BusinessProfileForm />
                </div>
              </div>
            )}

            {activeTab === "categories" && (
              <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Kategori Layanan
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Buat dan kelola kategori untuk mengorganisir paket layanan
                    secara rapi.
                  </p>
                </div>
                <div className="p-6">
                  <CategoryList
                    categories={categories}
                    isLoading={categoriesQuery.isLoading}
                  />
                </div>
              </div>
            )}

            {activeTab === "event-categories" && (
              <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Kategori Acara
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Tentukan jenis acara yang Anda tangani (misalnya Wedding,
                    Birthday, Corporate).
                  </p>
                </div>
                <div className="p-6">
                  <EventCategoryList
                    categories={eventCategories}
                    isLoading={eventCatQuery.isLoading}
                  />
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Notifikasi Push
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Atur preferensi pemberitahuan di peramban ini.
                  </p>
                </div>
                <div className="p-6">
                  {!push.isSupported ? (
                    <div className="flex items-center justify-center p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <div>
                        <Bell className="mx-auto h-8 w-8 text-slate-400 mb-3" />
                        <p className="text-sm font-medium text-slate-900">
                          Tidak Didukung
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Notifikasi push tidak didukung di sistem atau peramban
                          ini.
                        </p>
                      </div>
                    </div>
                  ) : push.permission === "denied" ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                            <Bell className="h-5 w-5 text-red-600" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-red-900">
                            Akses Notifikasi Ditolak
                          </p>
                          <p className="mt-1 text-sm text-red-700">
                            Anda telah memblokir akses notifikasi dari peramban.
                            Silakan ubah pengaturan browser Anda jika ingin
                            menerima pemberitahuan.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : push.isSubscribed ? (
                    <div className="rounded-xl border border-green-200 bg-green-50 p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                              <Check className="h-5 w-5 text-green-600" />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-green-900">
                              Notifikasi Aktif
                            </p>
                            <p className="mt-1 text-sm text-green-700">
                              Anda sedang menerima pemberitahuan realtime untuk
                              event dan layanan.
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => push.unsubscribe()}
                          className="shrink-0 border-green-300 text-green-700 hover:bg-green-100"
                        >
                          Nonaktifkan
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                              <Bell className="h-5 w-5 text-slate-500" />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              Notifikasi Dinonaktifkan
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              Aktifkan untuk menerima pembaruan instan mengenai
                              pemesanan baru.
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => push.subscribe()}
                          className="shrink-0 bg-slate-900 text-white hover:bg-slate-800"
                        >
                          Aktifkan
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
