"use client";

import { FormEvent, useState } from "react";
import { Send, X } from "lucide-react";
import { useCompactMode } from "@/contexts/CompactModeContext";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import type { Note } from "@/types";

type AddNoteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (note: Note) => void;
};

const quickTags = ["구매목표", "인사이트", "구독", "나중에"];

export function AddNoteModal({ isOpen, onClose, onAdd }: AddNoteModalProps) {
  const { isCompact } = useCompactMode();
  const [body, setBody] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  useEscapeKey(isOpen, onClose);

  if (!isOpen) return null;

  function handleToggleTag(tag: string) {
    setSelectedTags((currentTags) => (currentTags.includes(tag) ? currentTags.filter((item) => item !== tag) : [...currentTags, tag]));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedBody = body.trim();
    if (!trimmedBody) {
      setErrorMessage("메모 내용을 입력해주세요.");
      return;
    }

    const nextNote: Note = {
      id: getNoteId(),
      body: trimmedBody,
      tags: selectedTags,
      createdAt: formatCreatedAt(new Date()),
      status: "inbox",
    };

    onAdd(nextNote);
    setBody("");
    setSelectedTags([]);
    setErrorMessage("");
    onClose();
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm ${isCompact ? "p-0" : "p-4"}`}>
      <div className={`w-full overflow-y-auto border border-zinc-800 bg-zinc-900 shadow-soft ${isCompact ? "h-[100dvh] max-w-full rounded-none p-4" : "max-w-xl rounded-2xl p-6"}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold text-zinc-50">메모 추가</h3>
            {isCompact ? null : <p className="mt-1 text-sm text-zinc-500">나중에 분류할 생각을 빠르게 보관합니다.</p>}
          </div>
          <button type="button" onClick={onClose} className="rounded-2xl border border-zinc-800 p-2 text-zinc-400 hover:text-zinc-50">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <label className="block rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
            <span className="text-sm text-zinc-500">메모</span>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={6}
              className="mt-3 w-full resize-none bg-transparent text-sm leading-6 text-zinc-100 outline-none"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {quickTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleToggleTag(tag)}
                className={`rounded-full border px-3 py-1 text-xs ${
                  selectedTags.includes(tag)
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                    : "border-zinc-800 text-zinc-400 hover:text-zinc-100"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>

          {errorMessage ? <p className="text-sm text-red-300">{errorMessage}</p> : null}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-2xl border border-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-300 hover:text-zinc-50">
              취소
            </button>
            <button type="submit" className="flex items-center gap-2 rounded-2xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-300">
              <Send className="h-4 w-4" />
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getNoteId() {
  return crypto.randomUUID?.() ?? Date.now().toString();
}

function formatCreatedAt(date: Date) {
  return `오늘 ${date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })}`;
}
