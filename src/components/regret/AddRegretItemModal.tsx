"use client";

import { FormEvent, useState } from "react";
import { X } from "lucide-react";
import { MoneyInputField } from "@/components/inputs/MoneyInputField";
import { calculateProfitAmount, calculateRegretPercent } from "@/lib/calculations";
import { useCompactMode } from "@/contexts/CompactModeContext";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import type { Currency, RegretItem } from "@/types";

type AddRegretItemModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: RegretItem) => void;
};

const currencies: Currency[] = ["KRW", "USD"];
const assetTypes = ["주식", "암호자산", "부동산", "제품", "장비", "기타"];

const defaultForm = {
  name: "",
  assetType: "주식",
  symbol: "",
  watchedPrice: 0,
  currentPrice: 0,
  currency: "KRW" as Currency,
  quantity: 1,
  watchedAt: "",
  note: "",
};

export function AddRegretItemModal({ isOpen, onClose, onAdd }: AddRegretItemModalProps) {
  const { isCompact } = useCompactMode();
  const [form, setForm] = useState(defaultForm);
  const [errorMessage, setErrorMessage] = useState("");
  useEscapeKey(isOpen, onClose);

  if (!isOpen) return null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();
    if (!name) {
      setErrorMessage("이름을 입력해 주세요.");
      return;
    }

    if (form.watchedPrice <= 0) {
      setErrorMessage("관심 가격은 0보다 커야 합니다.");
      return;
    }

    if (form.currentPrice <= 0) {
      setErrorMessage("현재 가격은 0보다 커야 합니다.");
      return;
    }

    if (form.quantity <= 0) {
      setErrorMessage("수량은 0보다 커야 합니다.");
      return;
    }

    const nextItem: RegretItem = {
      id: getRegretItemId(),
      name,
      assetType: form.assetType,
      symbol: form.symbol.trim() || undefined,
      watchedPrice: form.watchedPrice,
      currentPrice: form.currentPrice,
      currency: form.currency,
      quantity: form.quantity,
      watchedAt: form.watchedAt || undefined,
      note: form.note.trim() || "판단 이유를 아직 정리하지 않았습니다.",
      resultPercent: calculateRegretPercent(form.watchedPrice, form.currentPrice),
      profitAmount: calculateProfitAmount(form.watchedPrice, form.currentPrice, form.quantity),
    };

    onAdd(nextItem);
    setForm(defaultForm);
    setErrorMessage("");
    onClose();
  }

  return (
    <div className={`fixed inset-0 z-50 flex bg-zinc-950/80 backdrop-blur-sm ${isCompact ? "items-end" : "items-center justify-center p-4"}`} onClick={onClose}>
      <div className={`w-full overflow-y-auto bg-zinc-900 shadow-soft border-zinc-800 ${isCompact ? "rounded-t-2xl border-x border-t max-h-[88dvh] p-4" : "rounded-2xl border max-h-[90vh] max-w-2xl p-6"}`} onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className={`font-semibold text-zinc-50 ${isCompact ? "text-xl" : "text-2xl"}`}>후회 항목 추가</h3>
            {isCompact ? null : <p className="mt-1 text-sm text-zinc-500">관심 가격과 현재 가격을 비교해 놓친 손익을 기록합니다.</p>}
          </div>
          <button type="button" onClick={onClose} className="rounded-2xl border border-zinc-800 p-2 text-zinc-400 hover:text-zinc-50">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={`${isCompact ? "mt-4" : "mt-6"} space-y-4`}>
          <div className={`grid gap-3 ${isCompact ? "grid-cols-2" : "sm:grid-cols-2"}`}>
            <TextField label="이름" value={form.name} onChange={(value) => setForm((prev) => ({ ...prev, name: value }))} />
            <SelectField label="자산 유형" value={form.assetType} options={assetTypes} onChange={(value) => setForm((prev) => ({ ...prev, assetType: value }))} />
            <TextField label="심볼" value={form.symbol} onChange={(value) => setForm((prev) => ({ ...prev, symbol: value }))} />
            <SelectField label="통화" value={form.currency} options={currencies} onChange={(value) => setForm((prev) => ({ ...prev, currency: value as Currency }))} />
            <MoneyInputField
              label="관심 가격"
              value={form.watchedPrice}
              currency={form.currency}
              onChange={(value) => setForm((prev) => ({ ...prev, watchedPrice: value }))}
            />
            <MoneyInputField
              label="현재 가격"
              value={form.currentPrice}
              currency={form.currency}
              onChange={(value) => setForm((prev) => ({ ...prev, currentPrice: value }))}
            />
            <NumberField label="수량" value={form.quantity} onChange={(value) => setForm((prev) => ({ ...prev, quantity: value }))} />
            <DateField label="관심 날짜" value={form.watchedAt} onChange={(value) => setForm((prev) => ({ ...prev, watchedAt: value }))} />
          </div>

          <label className="block rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
            <span className="text-sm text-zinc-500">메모</span>
            <textarea
              value={form.note}
              onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
              rows={3}
              className="mt-3 w-full resize-none bg-transparent text-sm leading-6 text-zinc-100 outline-none"
            />
          </label>

          {errorMessage ? <p className="text-sm text-red-300">{errorMessage}</p> : null}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-2xl border border-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-300 hover:text-zinc-50">
              취소
            </button>
            <button type="submit" className="rounded-2xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-300">
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
      <span className="text-sm text-zinc-500">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-3 w-full bg-transparent text-lg font-semibold text-zinc-50 outline-none" />
    </label>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
      <span className="text-sm text-zinc-500">{label}</span>
      <input type="number" value={value} onChange={(event) => onChange(toSafeNumber(event.target.value))} className="mt-3 w-full bg-transparent text-lg font-semibold text-zinc-50 outline-none" />
    </label>
  );
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
      <span className="text-sm text-zinc-500">{label}</span>
      <input type="date" value={value} onChange={(event) => onChange(event.target.value)} className="mt-3 w-full bg-transparent text-lg font-semibold text-zinc-50 outline-none" />
    </label>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
      <span className="text-sm text-zinc-500">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-3 w-full bg-zinc-950 text-lg font-semibold text-zinc-50 outline-none">
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function toSafeNumber(value: string) {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : 0;
}

function getRegretItemId() {
  return crypto.randomUUID?.() ?? Date.now().toString();
}
