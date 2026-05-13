"use client";

import { FormEvent, useState } from "react";
import { X } from "lucide-react";
import { getInsightTypeLabel } from "@/lib/labels";
import { useCompactMode } from "@/contexts/CompactModeContext";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import type { Insight, InsightType } from "@/types";

type AddInsightModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Insight) => void;
};

const sourceTypes: InsightType[] = ["book", "video", "article", "thought"];

const defaultForm = {
  sourceType: "book" as InsightType,
  title: "",
  keySentence: "",
  actionItem: "",
  tags: "",
  relatedGoal: "",
};

export function AddInsightModal({ isOpen, onClose, onAdd }: AddInsightModalProps) {
  const { isCompact } = useCompactMode();
  const [form, setForm] = useState(defaultForm);
  const [errorMessage, setErrorMessage] = useState("");
  useEscapeKey(isOpen, onClose);

  if (!isOpen) return null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = form.title.trim();
    if (!title) {
      setErrorMessage("제목을 입력해 주세요.");
      return;
    }

    const keySentence = form.keySentence.trim();
    if (!keySentence) {
      setErrorMessage("핵심 문장을 입력해 주세요.");
      return;
    }

    const nextItem: Insight = {
      id: getInsightId(),
      title,
      sourceType: form.sourceType,
      keySentence,
      actionItem: form.actionItem.trim() || "다음 행동을 아직 정리하지 않았습니다.",
      tags: getTags(form.tags),
      relatedGoal: form.relatedGoal.trim() || "미분류",
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
            <h3 className={`font-semibold text-zinc-50 ${isCompact ? "text-xl" : "text-2xl"}`}>인사이트 추가</h3>
            {isCompact ? null : <p className="mt-1 text-sm text-zinc-500">읽고 본 내용을 행동 단위로 압축합니다.</p>}
          </div>
          <button type="button" onClick={onClose} className="rounded-2xl border border-zinc-800 p-2 text-zinc-400 hover:text-zinc-50">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={`${isCompact ? "mt-4" : "mt-6"} space-y-4`}>
          <div className={`grid gap-3 ${isCompact ? "grid-cols-2" : "sm:grid-cols-2"}`}>
            <SelectField
              label="출처"
              value={form.sourceType}
              options={sourceTypes}
              getOptionLabel={(option) => getInsightTypeLabel(option as InsightType)}
              onChange={(value) => setForm((prev) => ({ ...prev, sourceType: value as InsightType }))}
            />
            <TextField label="제목" value={form.title} onChange={(value) => setForm((prev) => ({ ...prev, title: value }))} />
            <TextField label="관련 목표" value={form.relatedGoal} onChange={(value) => setForm((prev) => ({ ...prev, relatedGoal: value }))} />
            <TextField label="태그" value={form.tags} onChange={(value) => setForm((prev) => ({ ...prev, tags: value }))} />
          </div>

          <label className="block rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
            <span className="text-sm text-zinc-500">핵심 문장</span>
            <textarea
              value={form.keySentence}
              onChange={(event) => setForm((prev) => ({ ...prev, keySentence: event.target.value }))}
              rows={3}
              className="mt-3 w-full resize-none bg-transparent text-sm leading-6 text-zinc-100 outline-none"
            />
          </label>

          <label className="block rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
            <span className="text-sm text-zinc-500">다음 행동</span>
            <textarea
              value={form.actionItem}
              onChange={(event) => setForm((prev) => ({ ...prev, actionItem: event.target.value }))}
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

function getTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function getInsightId() {
  return crypto.randomUUID?.() ?? Date.now().toString();
}
