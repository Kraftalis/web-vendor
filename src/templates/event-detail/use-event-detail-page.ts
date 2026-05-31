"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useEventCategories } from "@/hooks";
import {
  useEventDetail,
  useUpdateEvent,
  useAddPayment,
  useVerifyPayment,
} from "@/hooks/event";
import {
  useTransactions,
  useCreateTransaction,
  useDeleteTransaction,
} from "@/hooks/finance";
import { getBookingUrl } from "@/lib/booking-url";
import type { PackageSnapshot, AddOnSnapshot } from "../event/types";
import type { ScheduleRow } from "./event-detail-edit";

export const useEventDetailPage = (eventId: string) => {
  const router = useRouter();

  const { data: eventData, isLoading, isError } = useEventDetail(eventId);
  const updateEvent = useUpdateEvent();
  const addPaymentMut = useAddPayment(eventId);
  const verifyPaymentMut = useVerifyPayment(eventId);

  const { data: transactionData } = useTransactions({
    eventId,
    type: "EXPENSE",
  });
  const createTransactionMut = useCreateTransaction();
  const deleteTransactionMut = useDeleteTransaction();

  const { data: eventCategoriesData } = useEventCategories();
  const eventCategories = useMemo(
    () =>
      (eventCategoriesData ?? []).map((c: { id: string; name: string }) => ({
        value: c.id,
        label: c.name,
      })),
    [eventCategoriesData],
  );

  const [editingSection, setEditingSection] = useState<
    "client" | "event" | "status" | "notes" | "schedule" | null
  >(null);
  const [isSaving, startSaveTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  const [showEditPackage, setShowEditPackage] = useState(false);
  const [showEditAddOns, setShowEditAddOns] = useState(false);

  const [receiptModal, setReceiptModal] = useState<{
    url: string;
    name: string;
    type: string;
  } | null>(null);

  const [showAddCost, setShowAddCost] = useState(false);
  const [isSubmittingCost, setIsSubmittingCost] = useState(false);

  const totalAmount = useMemo(
    () => (eventData?.amount ? parseFloat(eventData.amount) : 0),
    [eventData],
  );

  const totalPaid = useMemo(() => {
    const payments = eventData?.payments ?? [];
    const positives = payments
      .filter((p) => p.isVerified && p.paymentType !== "REFUND")
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const refunds = payments
      .filter((p) => p.isVerified && p.paymentType === "REFUND")
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);
    return positives - refunds;
  }, [eventData?.payments]);

  const remaining = useMemo(
    () => Math.max(totalAmount - totalPaid, 0),
    [totalAmount, totalPaid],
  );

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSave = (formData: FormData) => {
    if (!eventData) return;
    startSaveTransition(() => {
      const raw = Object.fromEntries(formData) as Record<string, unknown>;
      if (raw.amount !== undefined) {
        const n = parseFloat(raw.amount as string);
        raw.amount = isNaN(n) ? null : n;
      }
      for (const key of [
        "clientPhoneSecondary",
        "clientEmail",
        "eventTime",
        "eventLocation",
        "eventLocationUrl",
        "notes",
      ]) {
        if (raw[key] === "") raw[key] = null;
      }
      updateEvent.mutate(
        { id: eventData.id, payload: raw },
        {
          onSuccess: () => {
            setEditingSection(null);
            showMessage("Perubahan disimpan");
            router.refresh();
          },
        },
      );
    });
  };

  const handleSaveSchedules = (rows: ScheduleRow[]) => {
    if (!eventData) return;
    startSaveTransition(() => {
      updateEvent.mutate(
        {
          id: eventData.id,
          payload: {
            schedules: rows.map((r) => ({
              id: r.id,
              date: r.date,
              startTime: r.startTime || null,
              endTime: r.endTime || null,
              label: r.label || null,
            })),
          },
        },
        {
          onSuccess: () => {
            setEditingSection(null);
            showMessage("Perubahan disimpan");
            router.refresh();
          },
        },
      );
    });
  };

  const handleSavePackage = (snapshot: PackageSnapshot | null) => {
    if (!eventData) return;
    const addOnsTotal = (
      (eventData.addOnsSnapshot as AddOnSnapshot[]) ?? []
    ).reduce((sum, item) => sum + Number(item.price || 0), 0);
    const newTotal = Number(snapshot?.price || 0) + addOnsTotal;
    updateEvent.mutate(
      { id: eventData.id, payload: { packageSnapshot: snapshot, amount: newTotal } },
      {
        onSuccess: () => {
          setShowEditPackage(false);
          showMessage("Perubahan disimpan");
          router.refresh();
        },
      },
    );
  };

  const handleSaveAddOns = (snapshot: AddOnSnapshot[]) => {
    if (!eventData) return;
    const packageTotal = Number(
      (eventData.packageSnapshot as PackageSnapshot)?.price || 0,
    );
    const newTotal =
      snapshot.reduce((sum, item) => sum + Number(item.price || 0), 0) +
      packageTotal;
    updateEvent.mutate(
      { id: eventData.id, payload: { addOnsSnapshot: snapshot, amount: newTotal } },
      {
        onSuccess: () => {
          setShowEditAddOns(false);
          showMessage("Perubahan disimpan");
          router.refresh();
        },
      },
    );
  };

  const handleCopyLink = (bookingToken: string) => {
    const url = getBookingUrl(bookingToken);
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleAddCost = async (data: {
    label: string;
    amount: string;
    transactionDate: string;
    receiptFile: File | null;
  }) => {
    setIsSubmittingCost(true);
    let receiptUrl: string | null = null;
    let receiptName: string | null = null;

    if (data.receiptFile) {
      try {
        const formData = new FormData();
        formData.append("file", data.receiptFile);
        formData.append("folder", "receipts");
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.data?.publicUrl) {
          receiptUrl = uploadData.data.publicUrl;
          receiptName = uploadData.data.fileName;
        }
      } catch (err) {
        console.error("Receipt upload failed:", err);
      }
    }

    createTransactionMut.mutate(
      {
        description: data.label,
        amount: parseFloat(data.amount),
        transactionDate: data.transactionDate,
        type: "EXPENSE",
        category: "Event Cost",
        eventId,
        receiptUrl,
        receiptName,
      },
      {
        onSuccess: () => {
          setIsSubmittingCost(false);
          setShowAddCost(false);
          showMessage("Biaya tercatat berhasil.");
        },
        onError: () => {
          setIsSubmittingCost(false);
        },
      },
    );
  };

  const handleDeleteCost = (id: string) => {
    deleteTransactionMut.mutate(id, {
      onSuccess: () => showMessage("Biaya dihapus."),
    });
  };

  const handleVerifyPayment = (paymentId: string) => {
    verifyPaymentMut.mutate(
      { paymentId, action: "verify" },
      { onSuccess: () => showMessage("Pembayaran diverifikasi") },
    );
  };

  const handleRejectPayment = (paymentId: string) => {
    verifyPaymentMut.mutate(
      { paymentId, action: "reject" },
      { onSuccess: () => showMessage("Pembayaran ditolak") },
    );
  };

  const handleAddPayment = async (data: {
    amount: string;
    paymentType: string;
    note: string;
    receiptFile: File | null;
  }) => {
    setIsSubmittingPayment(true);
    let receiptUrl: string | null = null;
    let receiptName: string | null = null;

    if (data.receiptFile) {
      try {
        const formData = new FormData();
        formData.append("file", data.receiptFile);
        formData.append("folder", "receipts");
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.data?.publicUrl) {
          receiptUrl = uploadData.data.publicUrl;
          receiptName = uploadData.data.fileName;
        }
      } catch (err) {
        console.error("Receipt upload failed:", err);
      }
    }

    addPaymentMut.mutate(
      {
        amount: parseFloat(data.amount) || 0,
        paymentType: data.paymentType as
          | "DOWN_PAYMENT"
          | "INSTALLMENT"
          | "FULL_PAYMENT"
          | "REFUND",
        note: data.note || null,
        receiptUrl,
        receiptName,
      },
      {
        onSuccess: () => {
          setIsSubmittingPayment(false);
          setShowAddPayment(false);
          showMessage("Pembayaran tercatat berhasil.");
        },
        onError: () => {
          setIsSubmittingPayment(false);
        },
      },
    );
  };

  const handleCancelEvent = () => {
    if (!eventData) return;
    startSaveTransition(() => {
      updateEvent.mutate(
        { id: eventData.id, payload: { eventStatus: "CANCELED" } },
        {
          onSuccess: () => {
            setShowCancelModal(false);
            showMessage("Acara dibatalkan.");
            router.refresh();
          },
        },
      );
    });
  };

  const eventStatusLabel: Record<string, string> = {
    INQUIRY: "Pertanyaan",
    WAITING_CONFIRMATION: "Menunggu Konfirmasi",
    BOOKED: "Terjadwal",
    ONGOING: "Sedang Berlangsung",
    COMPLETED: "Selesai",
    CANCELED: "Dibatalkan",
  };

  const paymentStatusLabel: Record<string, string> = {
    UNPAID: "Belum Dibayar",
    DP_PAID: "DP Dibayar",
    PAID: "Lunas",
  };

  const paymentTypeMap: Record<string, string> = {
    DOWN_PAYMENT: "Uang Muka",
    INSTALLMENT: "Cicilan",
    FULL_PAYMENT: "Pembayaran Penuh",
  };

  const eventStatusOptions = [
    { value: "INQUIRY", label: "Pertanyaan" },
    { value: "WAITING_CONFIRMATION", label: "Menunggu Konfirmasi" },
    { value: "BOOKED", label: "Terjadwal" },
    { value: "ONGOING", label: "Sedang Berlangsung" },
    { value: "COMPLETED", label: "Selesai" },
    { value: "CANCELED", label: "Dibatalkan" },
  ];

  const paymentStatusOptions = [
    { value: "UNPAID", label: "Belum Dibayar" },
    { value: "DP_PAID", label: "DP Dibayar" },
    { value: "PAID", label: "Lunas" },
  ];

  return {
    eventData,
    isLoading,
    isError,
    updateEvent,
    transactionData,
    eventCategories,
    editingSection,
    setEditingSection,
    isSaving,
    startSaveTransition,
    message,
    linkCopied,
    showAddPayment,
    setShowAddPayment,
    showCancelModal,
    setShowCancelModal,
    isSubmittingPayment,
    showEditPackage,
    setShowEditPackage,
    showEditAddOns,
    setShowEditAddOns,
    receiptModal,
    setReceiptModal,
    showAddCost,
    setShowAddCost,
    isSubmittingCost,
    totalAmount,
    totalPaid,
    remaining,
    formatDate,
    handleSave,
    handleSaveSchedules,
    handleSavePackage,
    handleSaveAddOns,
    handleCopyLink,
    handleAddCost,
    handleDeleteCost,
    handleVerifyPayment,
    handleRejectPayment,
    handleAddPayment,
    handleCancelEvent,
    eventStatusLabel,
    paymentStatusLabel,
    paymentTypeMap,
    eventStatusOptions,
    paymentStatusOptions,
  };
};
