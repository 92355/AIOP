"use client";

import { FormEvent, useState } from "react";
import { Send, X } from "lucide-react";
import { useCompactMode } from "@/contexts/CompactModeContext";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import type { TodoItem } from "@/types";

type AddTodoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (todo: TodoItem) => void;
};

export function AddTodoModal({ isOpen, onClose, onAdd }: AddTodoModalProps) {
  const { isCompact } = useCompactMode();
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [priority, setPriority] = useState<TodoItem["priority"]>("medium");
  const [errorMessage, setErrorMessage] = useState("");
  useEscapeKey(isOpen, onClose);

  if (!isOpen) return null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrorMessage("Todo 내용을 입력하세요.");
      return;
    }

    onAdd({
      id: crypto.randomUUID?.() ?? Date.now().toString(),
      title: trimmedTitle,
      memo: memo.trim().length > 0 ? memo.trim() : undefined,
      status: "todo",
      priority,
      createdAt: formatCreatedAt(new Date()),
    });

    setTitle("");
    setMemo("");
    setPriority("medium");
    setErrorMessage("");
    onClose();
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm ${isCompact ? "p-0" : "p-4"}`}>
      <div className={`w-full overflow-y-auto border border-zinc-800 bg-zinc-900 shadow-soft ${isCompact ? "h-[100dvh] max-w-full rounded-none p-4" : "max-w-xl rounded-2xl p-6"}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold text-zinc-50">Todo 추가</h3>
            {isCompact ? null : <p className="mt-1 text-sm text-zinc-500">오늘 처리할 일을 빠르게 추가합니다.</p>}
          </div>
          <button type="button" onClick={onClose} className="rounded-2xl border border-zinc-800 p-2 text-zinc-400 hover:text-zinc-50">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <label className="block rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
            <span className="text-sm text-zinc-500">할 일</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-3 h-10 w-full bg-transparent text-sm text-zinc-100 outline-none"
              autoFocus
            />
          </label>

          <label className="block rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
            <span className="text-sm text-zinc-500">메모</span>
            <textarea
              value={memo}
              onChange={(event) => setMemo(event.target.value)}
              rows={4}
              className="mt-3 w-full resize-none bg-transparent text-sm leading-6 text-zinc-100 outline-none"
            />
          </label>

          <div className="grid grid-cols-3 gap-2">
            {(["low", "medium", "high"] as const).map((nextPriority) => (
              <button
                key={nextPriority}
                type="button"
                onClick={() => setPriority(nextPriority)}
                className={`rounded-2xl border px-3 py-2 text-sm ${
                  priority === nextPriority
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                    : "border-zinc-800 text-zinc-400 hover:text-zinc-100"
                }`}
              >
                {getPriorityLabel(nextPriority)}
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

function getPriorityLabel(priority: TodoItem["priority"]) {
  if (priority === "high") return "높음";
  if (priority === "medium") return "보통";
  return "낮음";
}

function formatCreatedAt(date: Date) {
  return `오늘 ${date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })}`;
}
