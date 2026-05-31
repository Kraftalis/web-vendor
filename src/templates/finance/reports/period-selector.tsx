"use client";

import { Card, CardBody, Select } from "@/components/ui";
import type { Preset } from "./utils";

interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  preset: Preset;
  setPreset: (v: Preset) => void;
  customStart: string;
  setCustomStart: (v: string) => void;
  customEnd: string;
  setCustomEnd: (v: string) => void;
  filterAccountId: string;
  setFilterAccountId: (v: string) => void;
  accountOptions: SelectOption[];
}

const PRESET_OPTIONS = [
  { value: "this-month", label: "Bulan Ini" },
  { value: "last-month", label: "Bulan Lalu" },
  { value: "3-months", label: "3 Bulan Terakhir" },
  { value: "6-months", label: "6 Bulan Terakhir" },
  { value: "year", label: "Tahun Ini" },
  { value: "custom", label: "Rentang Kustom" },
];

export const PeriodSelector = ({
  preset,
  setPreset,
  customStart,
  setCustomStart,
  customEnd,
  setCustomEnd,
  filterAccountId,
  setFilterAccountId,
  accountOptions,
}: Props) => {
  return (
    <Card>
      <CardBody>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <Select
            label="Periode"
            options={PRESET_OPTIONS}
            value={preset}
            onChange={(e) => setPreset(e.target.value as Preset)}
          />
          {preset === "custom" && (
            <>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Tanggal Akhir
                </label>
                <input
                  type="date"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                />
              </div>
            </>
          )}
          <Select
            label="Semua Rekening"
            options={[
              { value: "", label: "Semua Rekening" },
              ...accountOptions,
            ]}
            value={filterAccountId}
            onChange={(e) => setFilterAccountId(e.target.value)}
          />
        </div>
      </CardBody>
    </Card>
  );
};
