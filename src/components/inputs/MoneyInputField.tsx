"use client";

import { formatCurrency, formatKRW } from "@/lib/formatters";
import type { Currency } from "@/types";

type MoneyInputFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  currency?: Currency;
  helperText?: string;
  compact?: boolean;
};

const KRW_INCREMENTS: Array<{
  label: string;
  value: number;
}> = [
  { label: "+1만", value: 10_000 },
  { label: "+5만", value: 50_000 },
  { label: "+10만", value: 100_000 },
  { label: "+100만", value: 1_000_000 },
];

const USD_INCREMENTS: Array<{
  label: string;
  value: number;
}> = [
  { label: "+10", value: 10 },
  { label: "+100", value: 100 },
  { label: "+1k", value: 1_000 },
  { label: "+10k", value: 10_000 },
];

const CURRENCY_LABELS: Record<Currency, string> = {
  KRW: "원",
  USD: "USD",
};

const INCREMENT_BUTTONS: Record<Currency, Array<{
  label: string;
  value: number;
}>> = {
  KRW: KRW_INCREMENTS,
  USD: USD_INCREMENTS,
};

export function MoneyInputField({ label, value, onChange, currency = "KRW", helperText, compact = false }: MoneyInputFieldProps) {
  const previewText = currency === "KRW" ? formatKRW(value) : formatCurrency(value, currency);
  const increments = INCREMENT_BUTTONS[currency];
  const currencyLabel = CURRENCY_LABELS[currency];

  function handleIncrement(incrementValue: number) {
    const baseValue = Number.isFinite(value) ? value : 0;
    onChange(baseValue + incrementValue);
  }

  return (
    <label className={`min-w-0 w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/70 ${compact ? "p-3" : "p-4"}`}>
      <span className="text-sm text-zinc-500">{label}</span>
      <div className={`flex min-w-0 items-center gap-2 ${compact ? "mt-2" : "mt-3"}`}>
        <input
          type="number"
          value={Number.isFinite(value) ? value : 0}
          onChange={(event) => onChange(toSafeNumber(event.target.value))}
          className={`min-w-0 flex-1 bg-transparent font-semibold text-zinc-50 outline-none ${compact ? "text-xl" : "text-3xl md:text-4xl"}`}
        />
        <span className="shrink-0 text-base text-zinc-500">{currencyLabel}</span>
      </div>
      <div className={`flex flex-wrap gap-1.5 ${compact ? "mt-2" : "mt-3"}`}>
        {increments.map((increment) => (
          <button
            key={increment.label}
            type="button"
            onClick={() => handleIncrement(increment.value)}
            className="rounded-full border border-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-500 transition hover:border-emerald-400/30 hover:bg-emerald-400/10 hover:text-emerald-300"
          >
            {increment.label}
          </button>
        ))}
      </div>
      <div className={`flex min-w-0 items-center justify-between gap-3 ${compact ? "mt-2" : "mt-3"}`}>
        <p className="min-w-0 flex-1 text-xs text-zinc-500">{helperText ?? "금액 입력"}</p>
        <p className="min-w-0 max-w-[55%] truncate text-right text-sm font-medium text-emerald-300">{previewText}</p>
      </div>
    </label>
  );
}

function toSafeNumber(value: string) {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : 0;
}
