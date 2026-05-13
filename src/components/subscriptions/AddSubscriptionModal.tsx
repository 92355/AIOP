"use client";

import { FormEvent, useState } from "react";
import { X } from "lucide-react";
import { MoneyInputField } from "@/components/inputs/MoneyInputField";
import { getSubscriptionStatusLabel, getUsageLabel } from "@/lib/labels";
import { useCompactMode } from "@/contexts/CompactModeContext";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import type { Subscription, SubscriptionStatus } from "@/types";

type AddSubscriptionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Subscription) => void;
};

const usages: Subscription["usage"][] = ["daily", "weekly", "monthly", "rare"];
const statuses: SubscriptionStatus[] = ["keep", "review", "cancel"];

const defaultForm = {
  service: "",
  monthlyPrice: 0,
  category: "",
  usage: "daily" as Subscription["usage"],
  valueScore: 80,
  status: "keep" as SubscriptionStatus,
  billingDay: null as number | null,
};

export function AddSubscriptionModal({ isOpen, onClose, onAdd }: AddSubscriptionModalProps) {
  const { isCompact } = useCompactMode();
  const [form, setForm] = useState(defaultForm);
  const [errorMessage, setErrorMessage] = useState("");
  useEscapeKey(isOpen, onClose);

  if (!isOpen) return null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const service = form.service.trim();
    if (!service) {
      setErrorMessage("서비스명을 입력해 주세요.");
      return;
    }

    if (form.monthlyPrice <= 0) {
      setErrorMessage("월 금액은 0보다 커야 합니다.");
      return;
    }

    const nextItem: Subscription = {
      id: getSubscriptionId(),
      service,
      monthlyPrice: form.monthlyPrice,
      category: form.category.trim() || "기타",
      usage: form.usage,
      valueScore: clampScore(form.valueScore),
      status: form.status,
      ...(form.billingDay !== null ? { billingDay: form.billingDay } : {}),
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
            <h3 className={`font-semibold text-zinc-50 ${isCompact ? "text-xl" : "text-2xl"}`}>구독 추가</h3>
            {isCompact ? null : <p className="mt-1 text-sm text-zinc-500">반복 지출을 사용 빈도와 가치 기준으로 기록합니다.</p>}
          </div>
          <button type="button" onClick={onClose} className="rounded-2xl border border-zinc-800 p-2 text-zinc-400 hover:text-zinc-50">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={`${isCompact ? "mt-4" : "mt-6"} space-y-4`}>
          <div className={`grid gap-3 ${isCompact ? "grid-cols-2" : "sm:grid-cols-2"}`}>
            <TextField label="서비스명" value={form.service} onChange={(value) => setForm((prev) => ({ ...prev, service: value }))} />
            <MoneyInputField label="월 금액" value={form.monthlyPrice} onChange={(value) => setForm((prev) => ({ ...prev, monthlyPrice: value }))} />
            <TextField label="카테고리" value={form.category} onChange={(value) => setForm((prev) => ({ ...prev, category: value }))} />
            <SelectField label="사용 빈도" value={form.usage} options={usages} getOptionLabel={(option) => getUsageLabel(option as Subscription["usage"])} onChange={(value) => setForm((prev) => ({ ...prev, usage: value as Subscription["usage"] }))} />
            <NumberField label="가치 점수" value={form.valueScore} onChange={(value) => setForm((prev) => ({ ...prev, valueScore: value }))} />
            <SelectField label="상태" value={form.status} options={statuses} getOptionLabel={(option) => getSubscriptionStatusLabel(option as SubscriptionStatus)} onChange={(value) => setForm((prev) => ({ ...prev, status: value as SubscriptionStatus }))} />
            <BillingDayField value={form.billingDay} onChange={(value) => setForm((prev) => ({ ...prev, billingDay: value }))} />
          </div>

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

function SelectField({
  label,
  value,
  options,
  getOptionLabel,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  getOptionLabel: (option: string) => string;
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

const BILLING_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

function BillingDayField({ value, onChange }: { value: number | null; onChange: (value: number | null) => void }) {
  return (
    <label className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
      <span className="text-sm text-zinc-500">
        결제일 <span className="text-zinc-600">(선택)</span>
      </span>
      <select
        value={value ?? ""}
        onChange={(event) => {
          const raw = event.target.value;
          onChange(raw === "" ? null : Number(raw));
        }}
        className="mt-3 w-full bg-zinc-950 text-lg font-semibold text-zinc-50 outline-none"
      >
        <option value="">선택 안 함</option>
        {BILLING_DAYS.map((day) => (
          <option key={day} value={day}>
            매월 {day}일
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

function clampScore(value: number) {
  return Math.min(100, Math.max(0, value));
}

function getSubscriptionId() {
  return crypto.randomUUID?.() ?? Date.now().toString();
}
