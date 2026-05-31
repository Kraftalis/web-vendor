"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { Link as LinkIcon, Check } from "lucide-react";
import { IconWhatsApp } from "@/components/icons";
import { getBookingUrl } from "@/lib/booking-url";

interface Props {
  token: string;
  expiresAt: string;
  totalAmount: string | null;
  onCreateAnother: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  labels: Record<string, any>;
}

export default function BookingLinkResult({
  token,
  expiresAt,
  totalAmount,
  onCreateAnother,
  labels,
}: Props) {
  const [copied, setCopied] = useState(false);

  const bookingUrl = getBookingUrl(token);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `${labels.waMessage ?? "Here's your booking link:"} ${bookingUrl}`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const expiresDate = new Date(expiresAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-5 text-center">
      {/* Success indicator */}
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
        <Check size={28} className="text-green-600" />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          {labels.linkCreated ?? "Booking Link Created!"}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {labels.linkExpiresOn ?? "Expires on"} {expiresDate}
        </p>
        {totalAmount && (
          <p className="mt-1 text-sm font-medium text-blue-600">
            Total: Rp {Number(totalAmount).toLocaleString("id-ID")}
          </p>
        )}
      </div>

      {/* URL box */}
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
        <LinkIcon size={16} className="shrink-0 text-gray-400" />
        <span className="flex-1 truncate text-left text-xs text-gray-600">
          {bookingUrl}
        </span>
        <Button variant="outline" size="sm" onClick={handleCopy}>
          {copied ? (labels.copied ?? "Copied!") : (labels.copyLink ?? "Copy")}
        </Button>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button onClick={handleShareWhatsApp} className="gap-2">
          <IconWhatsApp size={16} />
          {labels.shareWhatsApp ?? "Share via WhatsApp"}
        </Button>
        <Button variant="outline" onClick={onCreateAnother}>
          {labels.createAnother ?? "Create Another"}
        </Button>
      </div>
    </div>
  );
}
