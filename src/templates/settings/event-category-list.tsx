"use client";

import { Card, CardBody, Button, Skeleton } from "@/components/ui";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconCalendar,
} from "@/components/icons";
import type { EventCategory } from "@/services/event-category/types";

interface Props {
  categories: EventCategory[];
  isLoading: boolean;
  onAdd: () => void;
  onEdit: (cat: EventCategory) => void;
  onDelete: (id: string) => void;
  deletingId: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: Record<string, any>;
}

export default function EventCategoryList({
  categories,
  isLoading,
  onAdd,
  onEdit,
  onDelete,
  deletingId,
  dict,
}: Props) {
  const s = dict.settings;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {s.eventCategoriesTitle}
          </h2>
          <p className="text-sm text-gray-500">{s.eventCategoriesSubtitle}</p>
        </div>
        <Button size="md" onClick={onAdd}>
          <IconPlus size={16} />
          {s.addEventCategory}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardBody className="flex items-center gap-3 px-5 py-4">
                <Skeleton className="h-7 w-7 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-16 rounded-md" />
                <Skeleton className="h-8 w-16 rounded-md" />
              </CardBody>
            </Card>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center">
            <IconCalendar size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">
              {s.noEventCategories}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              {s.noEventCategoriesDesc}
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <Card key={cat.id}>
              <CardBody className="p-0">
                <div className="flex items-center gap-3 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {cat.name}
                    </h3>
                    {cat.description && (
                      <p className="mt-0.5 text-xs text-gray-500 truncate">
                        {cat.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(cat)}
                    >
                      <IconEdit size={14} />
                    </Button>
                    <Button
                      variant={deletingId === cat.id ? "danger" : "outline"}
                      size="sm"
                      onClick={() => onDelete(cat.id)}
                    >
                      {deletingId === cat.id ? (
                        s.confirmDeleteEventCategory
                      ) : (
                        <IconTrash size={14} />
                      )}
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
