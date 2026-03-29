"use client";

import { Card, CardBody, Button, Skeleton } from "@/components/ui";
import { IconSettings } from "@/components/icons";
import CategoryRow from "./category-row";
import type { Category } from "@/services/pricing";

interface Props {
  categories: Category[];
  isLoading: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: Record<string, any>;
}

export default function CategoryList({ categories, isLoading, dict }: Props) {
  const s = dict.settings;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {s.categoriesTitle}
          </h2>
          <p className="text-sm text-gray-500">{s.categoriesSubtitle}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
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
            <IconSettings size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">
              {s.noCategories}
            </p>
            <p className="mt-1 text-xs text-gray-400">{s.noCategoriesDesc}</p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <CategoryRow key={cat.id} cat={cat} />
          ))}
        </div>
      )}
    </section>
  );
}
