"use client";

import { Card, CardBody, Badge, Button } from "@/components/ui";
import { Check, Edit2 } from "lucide-react";
import type { Package } from "./types";
import { getDisplayPrice } from "./helpers";

interface Props {
  pkg: Package;
  onEdit: (pkg: Package) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export const PackageGridCard = ({
  pkg,
  onEdit,
  onDelete,
  isDeleting,
}: Props) => {
  const display = getDisplayPrice(pkg);

  return (
    <Card className="flex flex-col">
      <CardBody className="flex flex-1 flex-col space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 truncate">{pkg.name}</h3>
          <Badge
            variant={pkg.isActive ? "success" : "default"}
            className="shrink-0"
          >
            {pkg.isActive ? "Aktif" : "Arsip"}
          </Badge>
        </div>

        {/* Description */}
        {pkg.description && (
          <p className="text-xs text-gray-500 line-clamp-2">
            {pkg.description}
          </p>
        )}

        {/* Price */}
        <div>
          {display.isRange && (
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
              Mulai dari
            </p>
          )}
          <p className="text-xl font-bold text-gray-900">{display.label}</p>
        </div>

        {/* Variations */}
        {pkg.items.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
              Variasi
            </p>
            <div className="flex flex-wrap gap-1">
              {pkg.items.map((v) => (
                <span
                  key={v.id}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700"
                >
                  {v.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Inclusions */}
        {pkg.inclusions && pkg.inclusions.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
              Paket Termasuk
            </p>
            <ul className="space-y-0.5">
              {pkg.inclusions.slice(0, 3).map((inc, i) => (
                <li
                  key={i}
                  className="flex items-center gap-1.5 text-xs text-gray-600"
                >
                  <Check size={12} className="shrink-0 text-green-500" />
                  <span className="truncate">{inc}</span>
                </li>
              ))}
              {pkg.inclusions.length > 3 && (
                <li className="text-xs text-gray-400">
                  +{pkg.inclusions.length - 3} lainnya
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="flex gap-2 border-t border-gray-100 pt-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(pkg)}
          >
            <Edit2 size={14} />
            <span className="ml-1">Ubah</span>
          </Button>
          <Button
            variant={isDeleting ? "danger" : "outline"}
            size="sm"
            onClick={() => onDelete(pkg.id)}
          >
            {isDeleting ? "Yakin hapus?" : "Hapus"}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};
