"use client";

import { useState, useMemo } from "react";
import { Card, CardHeader, CardBody, Badge } from "@/components/ui";
import {
  Link as LinkIcon,
  User,
  Calendar,
  MapPin,
  Clock,
  Edit3,
  Trash2,
  Copy,
  Eye,
} from "lucide-react";
import type { BookingLinkItem, PackageSnapshot } from "@/services/booking";
import { useDeleteBookingLink } from "@/hooks/booking";
import { useConfirmDelete } from "@/hooks";
import { getBookingUrl } from "@/lib/booking-url";

// ─── Types ──────────────────────────────────────────────────

import { IconWhatsApp } from "@/components/icons";

interface ActiveOfferingsSectionProps {
  links: BookingLinkItem[];
  isLoading: boolean;
  onEdit: (link: BookingLinkItem) => void;
}

// ─── Helpers ────────────────────────────────────────────────

function formatCurrency(amount: string | number | null, currency = "IDR") {
  if (amount === null || amount === undefined) return "-";
  const num = typeof amount === "number" ? amount : parseFloat(amount);
  if (isNaN(num)) return "-";
  return `${currency} ${num.toLocaleString("id-ID")}`;
}

function getTimeRemaining(expiresAt: string) {
  const now = new Date();
  const expires = new Date(expiresAt);
  const diff = expires.getTime() - now.getTime();

  if (diff <= 0) return { expired: true, days: 0, hours: 0, minutes: 0 };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { expired: false, days, hours, minutes };
}

function formatTimeRemaining(tr: ReturnType<typeof getTimeRemaining>) {
  if (tr.expired) return "";
  if (tr.days > 0) return `${tr.days} hari`;
  if (tr.hours > 0) return `${tr.hours} jam`;
  return `${tr.minutes} menit`;
}

// ─── Component ──────────────────────────────────────────────

export function ActiveOfferingsSection({
  links,
  isLoading,
  onEdit,
}: ActiveOfferingsSectionProps) {
  // Filter to only active (no event, not expired)
  const activeLinks = useMemo(() => {
    const now = new Date();
    return links.filter((l) => {
      if (l.event) return false; // already has an event
      const expires = new Date(l.expiresAt);
      return expires > now; // not expired
    });
  }, [links]);

  const expiredLinks = useMemo(() => {
    const now = new Date();
    return links.filter((l) => {
      if (l.event) return false;
      const expires = new Date(l.expiresAt);
      return expires <= now;
    });
  }, [links]);

  if (isLoading) return null;
  if (activeLinks.length === 0 && expiredLinks.length === 0) return null;

  return (
    <div className="mb-6">
      <Card>
        <CardHeader>
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <LinkIcon size={16} className="text-blue-500" />
              Penawaran Aktif
              {activeLinks.length > 0 && (
                <Badge variant="primary">{activeLinks.length}</Badge>
              )}
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Tautan booking Anda yang sedang aktif
            </p>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {activeLinks.length === 0 && expiredLinks.length === 0 ? (
            <div className="py-8 text-center">
              <LinkIcon size={32} className="mx-auto mb-2 text-gray-200" />
              <p className="text-sm font-medium text-gray-500">
                Belum ada tautan booking
              </p>
              <p className="text-xs text-gray-400">
                Buat tautan booking untuk mulai menerima pesanan
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {activeLinks.map((link) => (
                <OfferingCard key={link.id} link={link} onEdit={onEdit} />
              ))}
              {expiredLinks.map((link) => (
                <ExpiredOfferingCard key={link.id} link={link} />
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

// ─── Active Offering Card ───────────────────────────────────

function OfferingCard({
  link,
  onEdit,
}: {
  link: BookingLinkItem;
  onEdit: (link: BookingLinkItem) => void;
}) {
  const [copied, setCopied] = useState(false);
  const deleteMutation = useDeleteBookingLink();
  const { pendingId, handleDelete } = useConfirmDelete((id) => {
    deleteMutation.mutate(id);
  });

  const timeRemaining = getTimeRemaining(link.expiresAt);
  const timeStr = formatTimeRemaining(timeRemaining);

  const bookingUrl = getBookingUrl(link.token);

  const pkg = link.packageSnapshot as PackageSnapshot | null;
  const addOns = (link.addOnsSnapshot ?? []) as {
    name: string;
    price: number;
    quantity: number;
  }[];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const text = encodeURIComponent(`Here's your booking link: ${bookingUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const isDeletePending = pendingId === link.id;

  return (
    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
      {/* Left — Info */}
      <div className="min-w-0 flex-1 space-y-2">
        {/* Client & expiry */}
        <div className="flex flex-wrap items-center gap-2">
          {link.clientName ? (
            <span className="flex items-center gap-1 text-sm font-semibold text-gray-900">
              <User size={14} className="text-gray-400" />
              {link.clientName}
            </span>
          ) : (
            <span className="text-sm italic text-gray-400">No client name</span>
          )}
          <Badge
            variant={
              timeRemaining.days >= 1
                ? "success"
                : timeRemaining.hours >= 6
                  ? "warning"
                  : "danger"
            }
          >
            Kadaluarsa dalam {timeStr}
          </Badge>
        </div>

        {/* Event details */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
          {link.eventDate && (
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {new Date(link.eventDate).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
          {link.eventTime && (
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {link.eventTime}
            </span>
          )}
          {link.eventLocation && (
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              <span className="max-w-50 truncate">{link.eventLocation}</span>
            </span>
          )}
        </div>

        {/* Package & total */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {pkg && (
            <span className="rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-700">
              Paket: {pkg.name}
              {pkg.variationLabel && ` (${pkg.variationLabel})`}
            </span>
          )}
          {addOns.length > 0 && (
            <span className="text-gray-400">+{addOns.length} add-on</span>
          )}
          {link.totalAmount && (
            <span className="font-semibold text-gray-700">
              Total: {formatCurrency(link.totalAmount)}
            </span>
          )}
        </div>
      </div>

      {/* Right — Actions */}
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          onClick={handleCopy}
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          title="Salin Tautan"
        >
          {copied ? (
            <span className="text-xs font-medium text-green-600">
              Sudah Disalin
            </span>
          ) : (
            <Copy size={16} />
          )}
        </button>
        <button
          onClick={handleShare}
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-green-50 hover:text-green-600"
          title="Bagikan di WhatsApp"
        >
          <IconWhatsApp size={16} />
        </button>
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
          title="Lihat"
        >
          <Eye size={16} />
        </a>
        <button
          onClick={() => onEdit(link)}
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
          title="Edit"
        >
          <Edit3 size={16} />
        </button>
        <button
          onClick={() => handleDelete(link.id)}
          className={`rounded-lg p-2 transition-colors ${
            isDeletePending
              ? "bg-red-100 text-red-600"
              : "text-gray-400 hover:bg-red-50 hover:text-red-600"
          }`}
          title={isDeletePending ? "Hapus Tautan Booking?" : "Hapus"}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

// ─── Expired Offering Card ──────────────────────────────────

function ExpiredOfferingCard({ link }: { link: BookingLinkItem }) {
  const deleteMutation = useDeleteBookingLink();
  const { pendingId, handleDelete } = useConfirmDelete((id) => {
    deleteMutation.mutate(id);
  });

  const pkg = link.packageSnapshot as PackageSnapshot | null;
  const isDeletePending = pendingId === link.id;

  return (
    <div className="flex items-center justify-between bg-gray-50/50 p-4 opacity-60">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {link.clientName || "—"}
          </span>
          <Badge variant="danger">Kadaluarsa</Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {pkg && <span>{pkg.name}</span>}
          {link.totalAmount && <span>{formatCurrency(link.totalAmount)}</span>}
        </div>
      </div>
      <button
        onClick={() => handleDelete(link.id)}
        className={`rounded-lg p-2 transition-colors ${
          isDeletePending
            ? "bg-red-100 text-red-600"
            : "text-gray-400 hover:bg-red-50 hover:text-red-600"
        }`}
        title={isDeletePending ? "Hapus Tautan Booking?" : "Hapus"}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
