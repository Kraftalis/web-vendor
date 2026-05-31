"use client";

import { Card, CardBody, Badge, Button } from "@/components/ui";
import { Check, Edit2, ChevronDown } from "lucide-react";
import type { Package } from "./types";
import { formatCurrency, getDisplayPrice } from "./helpers";

interface Props {
  pkg: Package;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: (pkg: Package) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export const PackageListItem = ({
  pkg,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  isDeleting,
}: Props) => {
  const display = getDisplayPrice(pkg);

  return (
    <Card>
      <CardBody className="space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{pkg.name}</h3>
            {pkg.description && (
              <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">
                {pkg.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <p className="text-lg font-bold text-gray-900 text-right">
              {display.label}
            </p>
            <Badge
              variant={pkg.isActive ? "success" : "default"}
              className="shrink-0"
            >
              {pkg.isActive ? "Aktif" : "Arsip"}
            </Badge>
            <button
              type="button"
              aria-expanded={isExpanded}
              onClick={onToggle}
              className={`p-2 rounded hover:bg-gray-100 transition-transform ${
                isExpanded ? "-rotate-180" : ""
              }`}
            >
              <ChevronDown size={16} />
            </button>
          </div>
        </div>

        {/* Expanded details */}
        {isExpanded && (
          <div className="space-y-2">
            {pkg.items.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Variasi
                </p>
                <ul className="space-y-1">
                  {pkg.items.map((v) => (
                    <li
                      key={v.id}
                      className="flex items-center justify-between gap-2 rounded-md bg-gray-50 px-2.5 py-1.5"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Check
                          size={12}
                          className="shrink-0 text-green-500"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-700 truncate">
                            {v.label}
                          </p>
                          {v.description && (
                            <p className="text-xs text-gray-400 truncate">
                              {v.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-gray-900 shrink-0">
                        {formatCurrency(v.price, pkg.currency)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {pkg.inclusions && pkg.inclusions.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Paket Termasuk
                </p>
                <ul className="mt-1 space-y-1">
                  {pkg.inclusions.map((inc, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check
                        size={14}
                        className="text-green-500 shrink-0 mt-0.5"
                      />
                      <span className="text-sm text-gray-700">{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={() => onEdit(pkg)}>
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
}
