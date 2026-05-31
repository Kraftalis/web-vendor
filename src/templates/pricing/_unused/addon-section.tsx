"use client";

import {
  Card,
  CardBody,
  Badge,
  Button,
  Skeleton,
} from "@/components/ui";
import { Plus, Edit2, PackageOpen, Tag, Trash2 } from "lucide-react";
import type { AddOn } from "./types";
import { formatCurrency } from "./helpers";

interface Props {
  addOns: AddOn[];
  isLoading: boolean;
  onAdd: () => void;
  onEdit: (addon: AddOn) => void;
  onDelete: (id: string) => void;
  deletingAddonId: string | null;
}

export const AddOnSection = ({
  addOns,
  isLoading,
  onAdd,
  onEdit,
  onDelete,
  deletingAddonId,
}: Props) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Add-on (Ekstra)</h2>
          <p className="text-sm text-gray-500">Layanan tambahan di luar paket utama</p>
        </div>
        <Button variant="primary" size="md" onClick={onAdd} className="hidden sm:inline-flex rounded-full">
          <Plus size={16} />
          <span className="ml-1">Tambah Add-on</span>
        </Button>
        <Button variant="primary" size="sm" onClick={onAdd} className="sm:hidden rounded-full px-2">
          <Plus size={16} />
        </Button>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
             <Card key={i}>
               <CardBody className="p-4 space-y-3">
                 <div className="flex justify-between">
                   <Skeleton className="h-5 w-1/2" />
                   <Skeleton className="h-5 w-16" />
                 </div>
                 <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-4 w-1/3" />
               </CardBody>
             </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && addOns.length === 0 && (
        <Card className="border-dashed shadow-none bg-gray-50/50">
          <CardBody className="py-12 text-center flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100/50 text-blue-600 mb-4">
              <PackageOpen size={24} />
            </div>
            <p className="text-sm font-medium text-gray-900">Belum ada add-on</p>
            <p className="mt-1 text-xs text-gray-500 max-w-sm mb-4">
              Buat add-on untuk menawarkan layanan ekstra (seperti dekorasi atau lensa khusus) kepada klien Anda.
            </p>
            <Button variant="primary" size="sm" onClick={onAdd} className="rounded-full">
              <Plus size={16} /> Tambah Add-on Pertama
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Grid view (Mobile & Desktop) */}
      {!isLoading && addOns.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {addOns.map((addon) => (
            <Card key={addon.id} className="group relative overflow-hidden transition-all hover:shadow-md border-gray-200/80">
              <CardBody className="p-5 flex flex-col h-full">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={addon.isActive ? "success" : "default"} size="sm" className="font-medium">
                      {addon.isActive ? "Aktif" : "Tidak Aktif"}
                    </Badge>
                  </div>
                  <div className="flex opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity gap-1">
                     <button
                        type="button"
                        onClick={() => onEdit(addon)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(addon.id)}
                        disabled={deletingAddonId === addon.id}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                      </button>
                  </div>
                </div>
                
                <h3 className="text-base font-bold text-gray-900 line-clamp-1 mb-1" title={addon.name}>
                  {addon.name}
                </h3>
                
                <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow" title={addon.description || ""}>
                  {addon.description || <span className="italic text-gray-400">Tanpa deskripsi</span>}
                </p>

                <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                   <div className="flex items-center gap-1.5 text-blue-700 font-semibold">
                      <Tag size={16} className="text-blue-500" />
                      {formatCurrency(addon.price, addon.currency)}
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
