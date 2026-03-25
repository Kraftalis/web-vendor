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
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/pricing";
import {
  useEventCategories,
  useCreateEventCategory,
  useUpdateEventCategory,
  useDeleteEventCategory,
} from "@/hooks/event-category";
import { useConfirmDelete } from "@/hooks/use-confirm-delete";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import BusinessProfileForm from "./business-profile-form";
import CategoryList from "./category-list";
import CategoryModal from "./category-modal";
import EventCategoryList from "./event-category-list";
import EventCategoryModal from "./event-category-modal";
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
    {
      key: "categories",
      label: s.tabCategories,
      icon: <IconSettings size={16} />,
    },
    {
      key: "event-categories",
      label: s.tabEventCategories,
      icon: <IconCalendar size={16} />,
    },
  ];

  // Queries
  const categoriesQuery = useCategories();
  const categories: Category[] = categoriesQuery.data ?? [];

  const eventCatQuery = useEventCategories();
  const eventCategories: EventCategory[] = eventCatQuery.data ?? [];

  // Mutations
  const createCatMut = useCreateCategory();
  const updateCatMut = useUpdateCategory();
  const deleteCatMut = useDeleteCategory();

  const createEvtCatMut = useCreateEventCategory();
  const updateEvtCatMut = useUpdateEventCategory();
  const deleteEvtCatMut = useDeleteEventCategory();

  // ─── Category modal ───────────────────────────────────────
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  const openAddCategory = () => {
    setEditingCat(null);
    setCatModalOpen(true);
  };

  const openEditCategory = (cat: Category) => {
    setEditingCat(cat);
    setCatModalOpen(true);
  };

  const closeCatModal = () => {
    setCatModalOpen(false);
    setEditingCat(null);
  };

  const handleSaveCategory = (formData: FormData) => {
    const name = (formData.get("name") as string).trim();
    const description = (formData.get("description") as string).trim() || null;
    if (!name) return;

    if (editingCat) {
      updateCatMut.mutate(
        { id: editingCat.id, payload: { name, description } },
        { onSuccess: closeCatModal },
      );
    } else {
      createCatMut.mutate(
        { name, description },
        { onSuccess: () => setCatModalOpen(false) },
      );
    }
  };

  const catDelete = useConfirmDelete((id) => deleteCatMut.mutate(id));

  // ─── Event category modal ─────────────────────────────────
  const [evtCatModalOpen, setEvtCatModalOpen] = useState(false);
  const [editingEvtCat, setEditingEvtCat] = useState<EventCategory | null>(
    null,
  );

  const openAddEvtCat = () => {
    setEditingEvtCat(null);
    setEvtCatModalOpen(true);
  };

  const openEditEvtCat = (cat: EventCategory) => {
    setEditingEvtCat(cat);
    setEvtCatModalOpen(true);
  };

  const closeEvtCatModal = () => {
    setEvtCatModalOpen(false);
    setEditingEvtCat(null);
  };

  const handleSaveEvtCat = (formData: FormData) => {
    const name = (formData.get("name") as string).trim();
    const description = (formData.get("description") as string).trim() || null;
    if (!name) return;

    if (editingEvtCat) {
      updateEvtCatMut.mutate(
        { id: editingEvtCat.id, payload: { name, description } },
        { onSuccess: closeEvtCatModal },
      );
    } else {
      createEvtCatMut.mutate(
        { name, description },
        { onSuccess: () => setEvtCatModalOpen(false) },
      );
    }
  };

  const evtCatDelete = useConfirmDelete((id) => deleteEvtCatMut.mutate(id));

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
            onAddCategory={openAddCategory}
            onEditCategory={openEditCategory}
            onDeleteCategory={catDelete.handleDelete}
            deletingCatId={catDelete.pendingId}
            dict={dict}
          />
        )}

        {activeTab === "event-categories" && (
          <EventCategoryList
            categories={eventCategories}
            isLoading={eventCatQuery.isLoading}
            onAdd={openAddEvtCat}
            onEdit={openEditEvtCat}
            onDelete={evtCatDelete.handleDelete}
            deletingId={evtCatDelete.pendingId}
            dict={dict}
          />
        )}
      </div>

      {/* Category Modal */}
      <CategoryModal
        key={editingCat?.id ?? "new-cat"}
        open={catModalOpen}
        editingCat={editingCat}
        onClose={closeCatModal}
        onSave={handleSaveCategory}
        isSaving={createCatMut.isPending || updateCatMut.isPending}
        dict={dict}
      />

      {/* Event Category Modal */}
      <EventCategoryModal
        key={editingEvtCat?.id ?? "new-evt-cat"}
        open={evtCatModalOpen}
        editing={editingEvtCat}
        onClose={closeEvtCatModal}
        onSave={handleSaveEvtCat}
        isSaving={createEvtCatMut.isPending || updateEvtCatMut.isPending}
        dict={dict}
      />
    </AppLayout>
  );
}
