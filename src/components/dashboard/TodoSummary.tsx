"use client";

import { CheckSquare, Clock3 } from "lucide-react";
import { useCompactMode } from "@/contexts/CompactModeContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { TodoItem } from "@/types";

const defaultTodos: TodoItem[] = [];

function getStoredTodos(value: unknown): TodoItem[] {
  return Array.isArray(value) ? (value as TodoItem[]) : defaultTodos;
}

export function TodoSummary() {
  const { isCompact } = useCompactMode();
  const [storedTodos] = useLocalStorage<unknown>("aiop:todos", defaultTodos);
  const items = getStoredTodos(storedTodos);
  const activeItems = items.filter((item) => item.status !== "done");
  const doneCount = items.filter((item) => item.status === "done").length;
  const previewItems = activeItems.slice(0, 4);

  return (
    <section className={`rounded-2xl border border-zinc-800 bg-zinc-900 shadow-soft ${isCompact ? "p-4" : "p-5"}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-zinc-50">Todo 요약</h3>
          {isCompact ? null : <p className="mt-1 text-sm text-zinc-500">완료 전 Todo를 우선순위와 함께 보여줍니다.</p>}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
          <CheckSquare className="h-5 w-5" />
        </div>
      </div>

      <div className={`mt-5 grid gap-3 ${isCompact ? "grid-cols-2" : "grid-cols-3"}`}>
        <div className="rounded-2xl bg-zinc-950/70 p-4">
          <p className="text-sm text-zinc-500">진행 전</p>
          <p className="mt-1 text-xl font-semibold text-zinc-50">{items.filter((item) => item.status === "todo").length}개</p>
        </div>
        <div className="rounded-2xl bg-zinc-950/70 p-4">
          <p className="text-sm text-zinc-500">진행 중</p>
          <p className="mt-1 text-xl font-semibold text-emerald-300">{items.filter((item) => item.status === "doing").length}개</p>
        </div>
        <div className={`rounded-2xl bg-zinc-950/70 p-4 ${isCompact ? "hidden" : ""}`}>
          <p className="text-sm text-zinc-500">완료</p>
          <p className="mt-1 text-xl font-semibold text-zinc-100">{doneCount}개</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {previewItems.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 text-sm text-zinc-500">
            진행할 Todo가 없습니다.
          </div>
        ) : null}
        {previewItems.map((item) => (
          <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3">
            <Clock3 className="h-4 w-4 shrink-0 text-emerald-300" />
            <p className="min-w-0 flex-1 truncate text-sm text-zinc-200">{item.title}</p>
            <span className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-400">{getPriorityLabel(item.priority)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function getPriorityLabel(priority: TodoItem["priority"]) {
  if (priority === "high") return "높음";
  if (priority === "medium") return "보통";
  return "낮음";
}
