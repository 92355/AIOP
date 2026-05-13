"use client";

import { X } from "lucide-react";
import { FormEvent, useState } from "react";
import { MoneyInputField } from "@/components/inputs/MoneyInputField";
import { calculateMonthlyCashflowNeeded, calculateRequiredCapital } from "@/lib/calculations";
import { getWantCategoryLabel, getWantPriorityLabel, getWantStatusLabel } from "@/lib/labels";
import { calculateWantDecisionScore } from "@/lib/wants";
import { useCompactMode } from "@/contexts/CompactModeContext";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import type { Currency, WantItem, WantPriority, WantStatus } from "@/types";

type AddWantModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: WantItem) => void;
};

const categories: WantItem["category"][] = ["Productivity", "Lifestyle", "Investment", "Hobby"];
const priorities: WantPriority[] = ["low", "medium", "high"];
const statuses: WantStatus[] = ["thinking", "planned", "bought", "skipped"];
const currencies: Currency[] = ["KRW", "USD"];

const defaultForm = {
  name: "",
  price: 0,
  currency: "KRW" as Currency,
  category: "Productivity" as WantItem["category"],
  reason: "",
  priority: "medium" as WantPriority,
  status: "thinking" as WantStatus,
  targetMonths: 12,
  expectedYield: 4,
};

export function AddWantModal({ isOpen, onClose, onAdd }: AddWantModalProps) {
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

    if (form.price <= 0) {
      setErrorMessage("가격은 0보다 커야 합니다.");
      return;
    }

    const targetMonths = Math.max(1, form.targetMonths);
    const expectedYield = Math.max(0, form.expectedYield);
    const targetDate = getTargetDate(targetMonths);
    const monthlyCashflowNeeded = calculateMonthlyCashflowNeeded(form.price, targetMonths);
    const score = calculateWantDecisionScore({
      price: form.price,
      priority: form.priority,
      status: form.status,
      targetMonths,
      monthlyCashflowNeeded,
      reason: form.reason,
    });

    const nextItem: WantItem = {
      id: getWantId(),
      name,
      price: form.price,
      currency: form.currency,
      category: form.category,
      reason: form.reason.trim() || "구매 이유를 아직 정리하지 않았습니다.",
      status: form.status,
      priority: form.priority,
      score,
      requiredCapital: calculateRequiredCapital(form.price, expectedYield),
      monthlyCashflowNeeded,
      targetMonths,
      expectedYield,
      targetDate,
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
            <h3 className={`font-semibold text-zinc-50 ${isCompact ? "text-xl" : "text-2xl"}`}>구매 목표 추가</h3>
            {isCompact ? null : <p className="mt-1 text-sm text-zinc-500">구매 욕구를 목표와 현금흐름 기준으로 기록합니다.</p>}
          </div>
          <button type="button" onClick={onClose} className="rounded-2xl border border-zinc-800 p-2 text-zinc-400 hover:text-zinc-50">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={`${isCompact ? "mt-4" : "mt-6"} space-y-4`}>
          <div className={`grid gap-3 ${isCompact ? "grid-cols-2" : "sm:grid-cols-2"}`}>
            <TextField label="이름" value={form.name} onChange={(value) => setForm((prev) => ({ ...prev, name: value }))} />
            <MoneyInputField
              label="가격"
              value={form.price}
              currency={form.currency}
              helperText="천 / 만 / 억 단위로 입력 가능합니다."
              onChange={(value) => setForm((prev) => ({ ...prev, price: value }))}
            />
            <SelectField label="통화" value={form.currency} options={currencies} onChange={(value) => setForm((prev) => ({ ...prev, currency: value as Currency }))} />
            <SelectField label="카테고리" value={form.category} options={categories} getOptionLabel={(option) => getWantCategoryLabel(option as WantItem["category"])} onChange={(value) => setForm((prev) => ({ ...prev, category: value as WantItem["category"] }))} />
            <SelectField label="우선순위" value={form.priority} options={priorities} getOptionLabel={(option) => getWantPriorityLabel(option as WantPriority)} onChange={(value) => setForm((prev) => ({ ...prev, priority: value as WantPriority }))} />
            <SelectField label="상태" value={form.status} options={statuses} getOptionLabel={(option) => getWantStatusLabel(option as WantStatus)} onChange={(value) => setForm((prev) => ({ ...prev, status: value as WantStatus }))} />
            <NumberField label="목표 기간" value={form.targetMonths} onChange={(value) => setForm((prev) => ({ ...prev, targetMonths: value }))} />
            <NumberField label="예상 수익률" value={form.expectedYield} onChange={(value) => setForm((prev) => ({ ...prev, expectedYield: value }))} />
          </div>

          <label className="block rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
            <span className="text-sm text-zinc-500">구매 이유</span>
            <textarea
              value={form.reason}
              onChange={(event) => setForm((prev) => ({ ...prev, reason: event.target.value }))}
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

function SelectField({
  label,
  value,
  options,
  getOptionLabel = (option) => option,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  getOptionLabel?: (option: string) => string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
      <span className="text-sm text-zinc-500">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-3 w-full bg-zinc-950 text-lg font-semibold text-zinc-50 outline-none">
        {options.map((option) => (
          <option key={option} value={option}>
            {getOptionLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
      <span className="text-sm text-zinc-500">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(toSafeNumber(event.target.value))}
        className="mt-3 w-full bg-transparent text-lg font-semibold text-zinc-50 outline-none"
      />
    </label>
  );
}

function toSafeNumber(value: string) {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : 0;
}

function getWantId() {
  return crypto.randomUUID?.() ?? Date.now().toString();
}

function getTargetDate(targetMonths: number) {
  const date = new Date();
  date.setMonth(date.getMonth() + targetMonths);
  return date.toISOString().slice(0, 10);
}
