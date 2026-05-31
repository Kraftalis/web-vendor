"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { Button, Input, Textarea } from "@/components/ui";
import { Check, Plus, ChevronLeft, AlertCircle } from "lucide-react";
import { useCreateAddOn } from "@/hooks/pricing";
import { completeOnboarding } from "@/services/onboarding";

interface Props {
  onBack: () => void;
}

interface CreatedSummary {
  id: string;
  name: string;
  price: number;
}

interface FormValues {
  addonName: string;
  addonDescription: string;
  addonPrice: string;
}

export const AddonStep = ({ onBack }: Props) => {
  const router = useRouter();
  const createAddon = useCreateAddOn();

  const [createdAddOns, setCreatedAddOns] = useState<CreatedSummary[]>([]);
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { addonName: "", addonDescription: "", addonPrice: "" },
  });

  const onAddAddon = (values: FormValues) =>
    new Promise<void>((resolve, reject) => {
      createAddon.mutate(
        {
          name: values.addonName.trim(),
          description: values.addonDescription.trim() || null,
          price: parseFloat(values.addonPrice) || 0,
          currency: "IDR",
        },
        {
          onSuccess: (result) => {
            setCreatedAddOns((prev) => [
              ...prev,
              {
                id: result?.id ?? crypto.randomUUID(),
                name: values.addonName.trim(),
                price: parseFloat(values.addonPrice) || 0,
              },
            ]);
            reset();
            resolve();
          },
          onError: () => reject(new Error("Gagal menyimpan. Coba lagi.")),
        },
      );
    });

  const handleFinish = async () => {
    setFinishing(true);
    setFinishError(null);

    try {
      const complete = await completeOnboarding();
      if (complete) {
        router.push("/");
        router.refresh();
      } else {
        setFinishError("Gagal menyelesaikan onboarding. Coba lagi.");
      }
    } catch {
      setFinishError("Gagal menyimpan. Coba lagi.");
    } finally {
      setFinishing(false);
    }
  };

  return (
    <div className="space-y-6">
      {createdAddOns.length > 0 && (
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">
              Add-on Tersimpan
            </h3>
            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
              {createdAddOns.length} add-on
            </span>
          </div>
          <div className="space-y-3">
            {createdAddOns.map((addon) => (
              <div
                key={addon.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900">
                    {addon.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    Rp {addon.price.toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <Check className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onAddAddon)}
        noValidate
        className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
      >
        <div className="space-y-5">
          <div className="mb-4 border-b border-slate-200 pb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Layanan Ekstra (Add-on)
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Tambahkan layanan ekstra yang bisa dipesan di luar paket utama.
              Opsional.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-900">
              Nama Add-on <span className="text-red-500">*</span>
            </label>
            <Input
              {...register("addonName", {
                required: "Nama add-on wajib diisi",
              })}
              placeholder="Misal: Cetak Album Tambahan"
              className="rounded-xl bg-white"
            />
            {errors.addonName && (
              <p className="mt-1 text-xs text-red-500">
                {errors.addonName.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-900">
              Deskripsi
            </label>
            <Textarea
              {...register("addonDescription")}
              placeholder="Penjelasan singkat mengenai add-on ini"
              rows={2}
              className="rounded-xl bg-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-900">
              Harga <span className="text-red-500">*</span>
            </label>
            <Controller
              name="addonPrice"
              control={control}
              rules={{
                required: "Harga add-on wajib diisi",
                validate: (v) => Number(v) > 0 || "Harga harus lebih dari 0",
              }}
              render={({ field }) => (
                <NumericFormat
                  customInput={Input}
                  allowNegative={false}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="Rp "
                  value={field.value}
                  onValueChange={(values) => field.onChange(values.value)}
                  placeholder="Rp 0"
                  className="rounded-xl bg-white"
                />
              )}
            />
            {errors.addonPrice && (
              <p className="mt-1 text-xs text-red-500">
                {errors.addonPrice.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="outline"
            className="mt-2 w-full rounded-xl border-slate-300 py-3 font-semibold transition-all hover:bg-slate-100"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-transparent" />
                Menyimpan...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Tambah Add-on
              </span>
            )}
          </Button>
        </div>
      </form>

      {finishError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{finishError}</span>
        </div>
      )}

      <div className="flex gap-4 pt-4">
        <Button
          variant="outline"
          className="flex-1 rounded-xl border-slate-300 bg-white py-3.5 font-semibold text-slate-700 hover:bg-slate-50"
          onClick={onBack}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        <Button
          variant="primary"
          className="flex-1 rounded-xl bg-slate-900 py-3.5 font-semibold text-white transition-all hover:bg-slate-800 disabled:opacity-50"
          onClick={handleFinish}
          disabled={finishing}
        >
          {finishing ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Menyelesaikan...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Selesaikan Setup
              <Check size={18} />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};
