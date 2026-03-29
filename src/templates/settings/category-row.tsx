"use client";

import { Card, CardBody } from "@/components/ui";
import type { Category } from "@/services/pricing";

interface Props {
  cat: Category;
}

export default function CategoryRow({ cat }: Props) {
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
        </div>
      </CardBody>
    </Card>
  );
}
