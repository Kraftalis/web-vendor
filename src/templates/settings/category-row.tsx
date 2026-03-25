"use client";

import { Card, CardBody, Button } from "@/components/ui";
import { IconEdit, IconTrash } from "@/components/icons";
import type { Category } from "@/services/pricing";

interface Props {
  cat: Category;
  onEditCategory: (cat: Category) => void;
  onDeleteCategory: (id: string) => void;
  deletingCatId: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: Record<string, any>;
}

export default function CategoryRow({
  cat,
  onEditCategory,
  onDeleteCategory,
  deletingCatId,
  dict,
}: Props) {
  const s = dict.settings;

  return (
    <Card>
      <CardBody className="p-0">
        {/* Category header */}
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900">{cat.name}</h3>
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
              onClick={() => onEditCategory(cat)}
            >
              <IconEdit size={14} />
            </Button>
            <Button
              variant={deletingCatId === cat.id ? "danger" : "outline"}
              size="sm"
              onClick={() => onDeleteCategory(cat.id)}
            >
              {deletingCatId === cat.id ? (
                s.confirmDeleteCategory
              ) : (
                <IconTrash size={14} />
              )}
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
