"use client";

import { useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Circle, Clock3, MessageSquareText, Pencil, Plus, Trash2, X } from "lucide-react";
import { useCompactMode } from "@/contexts/CompactModeContext";
import { useSearchContext, normalizeSearchTerm } from "@/contexts/SearchContext";
import { confirmDelete } from "@/lib/confirmDelete";
import { createTodo, deleteTodo, updateTodoMemo, updateTodoPriority, updateTodoStatus, updateTodoTitle } from "@/app/todos/actions";
import type { TodoItem, TodoStatus } from "@/types";

const statusOptions: TodoStatus[] = ["todo", "doing", "done"];

const statusLabels: Record<TodoStatus, string> = {
  todo: "할 일",
  doing: "진행 중",
  done: "완료",
};

export function TodoView({ initialItems }: { initialItems: TodoItem[] }) {
  const { isCompact } = useCompactMode();
  const { searchQuery } = useSearchContext();
  const [items, setItems] = useState<TodoItem[]>(initialItems);
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [priority, setPriority] = useState<TodoItem["priority"]>("medium");
  const [errorMessage, setErrorMessage] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPriority, setEditPriority] = useState<TodoItem["priority"]>("medium");
  const editInputRef = useRef<HTMLInputElement>(null);
  const searchTerm = normalizeSearchTerm(searchQuery);
  const visibleItems = searchTerm ? items.filter((item) => matchesTodoSearch(item, searchTerm)) : items;
  const activeItems = visibleItems.filter((item) => item.status !== "done");
  const completedItems = visibleItems.filter((item) => item.status === "done");

  const summary = useMemo(
    () => ({
      todo: items.filter((item) => item.status === "todo").length,
      doing: items.filter((item) => item.status === "doing").length,
      done: items.filter((item) => item.status === "done").length,
    }),
    [items],
  );

  async function handleAdd() {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setErrorMessage("Todo 내용을 입력하세요.");
      return;
    }

    const nextItem: TodoItem = {
      id: crypto.randomUUID?.() ?? Date.now().toString(),
      title: trimmedTitle,
      memo: getOptionalMemo(memo),
      status: "todo",
      priority,
      createdAt: formatCreatedAt(new Date()),
    };

    setItems((currentItems) => [nextItem, ...currentItems]);
    setTitle("");
    setMemo("");
    setPriority("medium");
    setErrorMessage("");
    await createTodo(nextItem);
  }

  async function handleCycleStatus(id: string) {
    const nextStatus = getNextStatus(items.find((item) => item.id === id)?.status ?? "todo");
    setItems((currentItems) =>
      currentItems.map((item) => (item.id === id ? { ...item, status: nextStatus } : item)),
    );
    await updateTodoStatus(id, nextStatus);
  }

  async function handleDelete(id: string) {
    const targetItem = items.find((item) => item.id === id);
    if (!confirmDelete(targetItem?.title ?? "Todo")) return;

    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
    await deleteTodo(id);
  }

  function handleStartEdit(item: TodoItem) {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditPriority(item.priority);
    setTimeout(() => editInputRef.current?.focus(), 0);
  }

  function handleCancelEdit() {
    setEditingId(null);
  }

  async function handleSaveEdit(id: string) {
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) return;

    const original = items.find((item) => item.id === id);
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, title: trimmedTitle, priority: editPriority } : item,
      ),
    );
    setEditingId(null);

    const titleChanged = original?.title !== trimmedTitle;
    const priorityChanged = original?.priority !== editPriority;
    if (titleChanged) await updateTodoTitle(id, trimmedTitle);
    if (priorityChanged) await updateTodoPriority(id, editPriority);
  }

  function handleUpdateMemo(id: string, nextMemo: string) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              memo: getOptionalMemo(nextMemo),
            }
          : item,
      ),
    );
  }

  return (
    <div className={`grid gap-4 ${isCompact ? "" : "xl:grid-cols-[0.8fr_1.2fr] xl:gap-6"}`}>
      <section className={`rounded-2xl border border-zinc-800 bg-zinc-900 shadow-soft ${isCompact ? "p-4" : "p-6"}`}>
        <h2 className={`font-semibold text-zinc-50 ${isCompact ? "text-2xl" : "text-3xl"}`}>Todo</h2>
        {isCompact ? null : <p className="mt-2 text-zinc-500">오늘 처리할 일을 빠르게 추가하고 상태를 바꿉니다.</p>}

        <div className={isCompact ? "mt-4 space-y-3" : "mt-6 space-y-4"}>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleAdd();
              }
            }}
            className="h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
            placeholder="할 일을 입력하세요"
          />

          <textarea
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
            className="min-h-20 w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm leading-6 text-zinc-100 outline-none placeholder:text-zinc-600"
            placeholder="짧은 메모를 남겨두세요"
          />

          <div className="grid grid-cols-3 gap-2">
            {(["low", "medium", "high"] as const).map((itemPriority) => (
              <button
                key={itemPriority}
                type="button"
                onClick={() => setPriority(itemPriority)}
                className={`rounded-2xl border px-3 py-2 text-sm ${
                  priority === itemPriority
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                    : "border-zinc-800 text-zinc-400 hover:text-zinc-100"
                }`}
              >
                {getPriorityLabel(itemPriority)}
              </button>
            ))}
          </div>

          {errorMessage ? <p className="text-sm text-red-300">{errorMessage}</p> : null}

          <button
            type="button"
            onClick={handleAdd}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 text-sm font-semibold text-zinc-950 hover:bg-emerald-300"
          >
            <Plus className="h-4 w-4" />
            Todo 추가
          </button>
        </div>

        <div className={`mt-5 grid gap-3 ${isCompact ? "grid-cols-3" : "grid-cols-3"}`}>
          {statusOptions.map((status) => (
            <div key={status} className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3">
              <p className="text-xs text-zinc-500">{statusLabels[status]}</p>
              <p className="mt-1 text-xl font-semibold text-zinc-50">{summary[status]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`rounded-2xl border border-zinc-800 bg-zinc-900 shadow-soft ${isCompact ? "p-4" : "p-6"}`}>
        <h3 className="text-xl font-semibold text-zinc-50">해야 할 Todo</h3>
        <div className="mt-5 space-y-3">
          {activeItems.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 text-sm text-zinc-500">
              {items.length === 0
                ? "등록된 Todo가 없습니다."
                : searchQuery
                  ? `"${searchQuery}" 검색 결과가 없습니다.`
                  : "해야 할 Todo가 없습니다."}
            </div>
          ) : null}

          {activeItems.map((item) => (
            <article key={item.id} className={`rounded-2xl border border-zinc-800 bg-zinc-950/70 ${isCompact ? "p-3" : "p-4"}`}>
              {editingId === item.id ? (
                <div className="space-y-3">
                  <input
                    ref={editInputRef}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveEdit(item.id);
                      if (e.key === "Escape") handleCancelEdit();
                    }}
                    className="h-10 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-emerald-400/50"
                  />
                  <div className="flex gap-2">
                    {(["low", "medium", "high"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setEditPriority(p)}
                        className={`flex-1 rounded-xl border px-2 py-1.5 text-xs ${
                          editPriority === p
                            ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                            : "border-zinc-800 text-zinc-400 hover:text-zinc-100"
                        }`}
                      >
                        {getPriorityLabel(p)}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(item.id)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-emerald-400/30 bg-emerald-400/10 py-2 text-xs font-medium text-emerald-300"
                    >
                      <Check className="h-3.5 w-3.5" />
                      저장
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-zinc-800 py-2 text-xs text-zinc-400"
                    >
                      <X className="h-3.5 w-3.5" />
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => handleCycleStatus(item.id)}
                    className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-800 text-zinc-400 hover:border-emerald-400/40 hover:text-emerald-300"
                    aria-label="Todo 상태 변경"
                  >
                    {getStatusIcon(item.status)}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className={`min-w-0 truncate font-medium ${item.status === "done" ? "text-zinc-500 line-through" : "text-zinc-100"}`}>
                        {item.title}
                      </h4>
                      <span className={`rounded-full px-2 py-1 text-xs ${getPriorityClassName(item.priority)}`}>{getPriorityLabel(item.priority)}</span>
                      <span className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-400">{statusLabels[item.status]}</span>
                    </div>
                    {isCompact ? null : <p className="mt-2 text-sm text-zinc-500">{formatCreatedAt(item.createdAt)}</p>}
                    <label className="mt-3 flex items-start gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/70 px-3 py-2">
                      <MessageSquareText className="mt-1 h-4 w-4 shrink-0 text-zinc-500" />
                      <textarea
                        value={item.memo ?? ""}
                        onChange={(event) => handleUpdateMemo(item.id, event.target.value)}
                        onBlur={(event) => updateTodoMemo(item.id, getOptionalMemo(event.target.value))}
                        rows={2}
                        className="min-h-10 flex-1 resize-none bg-transparent text-sm leading-5 text-zinc-300 outline-none placeholder:text-zinc-600"
                        placeholder="짧은 메모"
                      />
                    </label>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(item)}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
                      aria-label="Todo 편집"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-800 text-zinc-500 hover:border-red-400/40 hover:text-red-300"
                      aria-label="Todo 삭제"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950/40">
          <button
            type="button"
            onClick={() => setShowCompleted((currentValue) => !currentValue)}
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
            aria-expanded={showCompleted}
          >
            <span>
              <span className="font-medium text-zinc-100">완료된 Todo</span>
              <span className="ml-2 text-sm text-zinc-500">{completedItems.length}</span>
            </span>
            <ChevronDown className={`h-4 w-4 text-zinc-500 transition ${showCompleted ? "rotate-180" : ""}`} />
          </button>

          {showCompleted ? (
            <div className="space-y-3 border-t border-zinc-800 p-3">
              {completedItems.length === 0 ? (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 text-sm text-zinc-500">
                  완료된 Todo가 없습니다.
                </div>
              ) : null}

              {completedItems.map((item) => (
                <article key={item.id} className={`rounded-2xl border border-zinc-800 bg-zinc-950/70 ${isCompact ? "p-3" : "p-4"}`}>
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => handleCycleStatus(item.id)}
                      className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-800 text-zinc-400 hover:border-emerald-400/40 hover:text-emerald-300"
                      aria-label="Todo 상태 변경"
                    >
                      {getStatusIcon(item.status)}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="min-w-0 truncate font-medium text-zinc-500 line-through">{item.title}</h4>
                        <span className={`rounded-full px-2 py-1 text-xs ${getPriorityClassName(item.priority)}`}>{getPriorityLabel(item.priority)}</span>
                        <span className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-400">{statusLabels[item.status]}</span>
                      </div>
                      {isCompact ? null : <p className="mt-2 text-sm text-zinc-500">{formatCreatedAt(item.createdAt)}</p>}
                      <label className="mt-3 flex items-start gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/70 px-3 py-2">
                        <MessageSquareText className="mt-1 h-4 w-4 shrink-0 text-zinc-500" />
                        <textarea
                          value={item.memo ?? ""}
                          onChange={(event) => handleUpdateMemo(item.id, event.target.value)}
                          onBlur={(event) => updateTodoMemo(item.id, getOptionalMemo(event.target.value))}
                          rows={2}
                          className="min-h-10 flex-1 resize-none bg-transparent text-sm leading-5 text-zinc-300 outline-none placeholder:text-zinc-600"
                          placeholder="짧은 메모"
                        />
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-800 text-zinc-500 hover:border-red-400/40 hover:text-red-300"
                      aria-label="Todo 삭제"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function getNextStatus(status: TodoStatus): TodoStatus {
  if (status === "todo") return "doing";
  if (status === "doing") return "done";
  return "todo";
}

function matchesTodoSearch(item: TodoItem, searchTerm: string) {
  return [item.title, item.memo ?? ""].some((value) => value.toLowerCase().includes(searchTerm));
}

function getStatusIcon(status: TodoStatus) {
  if (status === "done") return <Check className="h-4 w-4" />;
  if (status === "doing") return <Clock3 className="h-4 w-4" />;
  return <Circle className="h-4 w-4" />;
}

function getPriorityLabel(priority: TodoItem["priority"]) {
  if (priority === "high") return "높음";
  if (priority === "medium") return "보통";
  return "낮음";
}

function getPriorityClassName(priority: TodoItem["priority"]) {
  if (priority === "high") return "bg-red-400/10 text-red-300";
  if (priority === "medium") return "bg-emerald-400/10 text-emerald-300";
  return "bg-zinc-800 text-zinc-400";
}

function getOptionalMemo(value: string) {
  return value.trim().length > 0 ? value : undefined;
}

function formatCreatedAt(dateOrString: Date | string) {
  const date = typeof dateOrString === "string" ? new Date(dateOrString) : dateOrString;
  if (isNaN(date.getTime())) return dateOrString as string;

  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return `오늘 ${date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false })}`;
  }
  return date.toLocaleDateString("ko-KR", { year: "2-digit", month: "2-digit", day: "2-digit" });
}
