"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatKRW } from "@/lib/formatters";
import type { Currency } from "@/types";

type MoneyUnit = "ones" | "thousands" | "tenThousands" | "hundredMillions";

type MoneyInputFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  currency?: Currency;
  helperText?: string;
};

const moneyUnits: Array<{
  id: MoneyUnit;
  label: string;
  multiplier: number;
  hint: string;
}> = [
  { id: "ones", label: "원", multiplier: 1, hint: "1원" },
  { id: "thousands", label: "천", multiplier: 1_000, hint: "1천원" },
  { id: "tenThousands", label: "만", multiplier: 10_000, hint: "1만원" },
  { id: "hundredMillions", label: "억", multiplier: 100_000_000, hint: "1억원" },
];

export function MoneyInputField({ label, value, onChange, currency = "KRW", helperText }: MoneyInputFieldProps) {
  const [unit, setUnit] = useState<MoneyUnit>(() => getAutoUnit(value));
  const [isUnitManual, setIsUnitManual] = useState(false);

  useEffect(() => {
    if (currency !== "KRW" || isUnitManual) return;
    setUnit(getAutoUnit(value));
  }, [currency, isUnitManual, value]);

  const selectedUnit = currency === "KRW" ? moneyUnits.find((item) => item.id === unit) ?? moneyUnits[0] : null;
  const displayValue = selectedUnit ? toDisplayValue(value, selectedUnit.id) : value;
  const previewText = currency === "KRW" ? formatKRW(value) : formatCurrency(value, currency);

  return (
    <label className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
      <span className="text-sm text-zinc-500">{label}</span>
      <div className="mt-3 flex items-center gap-2">
        <input
          type="number"
          value={Number.isFinite(displayValue) ? displayValue : 0}
          onChange={(event) => {
            const nextValue = toSafeNumber(event.target.value);
            onChange(selectedUnit ? toBaseValue(nextValue, selectedUnit.id) : nextValue);
          }}
          className="min-w-0 flex-1 bg-transparent text-2xl font-semibold text-zinc-50 outline-none"
        />
        {currency === "KRW" ? (
          <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
            {moneyUnits.map((moneyUnit) => {
              const active = moneyUnit.id === unit;

              return (
                <button
                  key={moneyUnit.id}
                  type="button"
                  onClick={() => {
                    setIsUnitManual(true);
                    setUnit(moneyUnit.id);
                  }}
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                    active
                      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                      : "border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                  title={moneyUnit.hint}
                  aria-pressed={active}
                >
                  {moneyUnit.label}
                </button>
              );
            })}
          </div>
        ) : (
          <span className="shrink-0 text-sm text-zinc-500">{currency}</span>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-zinc-500">{helperText ?? "금액 입력"}</p>
        <p className="text-sm font-medium text-emerald-300">{previewText}</p>
      </div>
    </label>
  );
}

function getAutoUnit(value: number): MoneyUnit {
  if (value >= 100_000_000) return "hundredMillions";
  if (value >= 10_000) return "tenThousands";
  if (value >= 1_000) return "thousands";
  return "ones";
}

function getUnitMultiplier(unit: MoneyUnit) {
  if (unit === "hundredMillions") return 100_000_000;
  if (unit === "tenThousands") return 10_000;
  if (unit === "thousands") return 1_000;
  return 1;
}

function toDisplayValue(value: number, unit: MoneyUnit) {
  return value / getUnitMultiplier(unit);
}

function toBaseValue(displayValue: number, unit: MoneyUnit) {
  return displayValue * getUnitMultiplier(unit);
}

function toSafeNumber(value: string) {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : 0;
}
