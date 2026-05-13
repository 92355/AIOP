"use client";

import { type KeyboardEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CalendarDays, CheckCircle2, Circle, Flame, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useCompactMode } from "@/contexts/CompactModeContext";
import { normalizeSearchTerm, useSearchContext } from "@/contexts/SearchContext";
import { confirmDelete } from "@/lib/confirmDelete";
import { saveRetro, deleteRetroByDate } from "@/app/retros/actions";
import { createTodo, deleteTodo, updateTodoStatus, updateTodoTitle } from "@/app/todos/actions";
import {
  calculateStreak,
  carryOverTryItems,
  createEmptyRetro,
  createId,
  createTodoFromTry,
  findPreviousRetro,
  formatDateLabel,
  getLocalDateString,
  getUnfinishedTryItems,
  getWeekProgress,
  hasRetroContent,
  sortRetrosByDateDesc,
  syncTryWithTodos,
  updateLinkedTodoTitle,
} from "@/lib/retros";
import { normalizeRetros } from "@/lib/storageNormalizers";
import type { KptRetro, RetroItem, TodoItem, TodoStatus } from "@/types";

type RetroSectionKey = "keep" | "problem" | "try";

const sectionMeta: Record<RetroSectionKey, { title: string; helper: string; placeholder: string }> = {
  keep: {
    title: "Keep",
    helper: "계속 유지할 행동",
    placeholder: "유지하고 싶은 일을 적어주세요.",
  },
  problem: {
    title: "Problem",
    helper: "막혔거나 불편했던 점",
    placeholder: "오늘의 문제를 적어주세요.",
  },
  try: {
    title: "Try",
    helper: "다음에 시도할 일",
    placeholder: "다음 액션을 적어주세요.",
  },
};

const emptyInputs: Record<RetroSectionKey, string> = {
  keep: "",
  problem: "",
  try: "",
};

const emptyPendingSections: Record<RetroSectionKey, boolean> = {
  keep: false,
  problem: false,
  try: false,
};

export function RetroView({ initialRetros, initialTodos }: { initialRetros: KptRetro[]; initialTodos: TodoItem[] }) {
  const today = getLocalDateString(new Date());
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");
  const { isCompact } = useCompactMode();
  const { searchQuery } = useSearchContext();
  const [storedRetros, setStoredRetros] = useState<KptRetro[]>(initialRetros);
  const [todos, setTodos] = useState<TodoItem[]>(initialTodos);
  const [selectedDate, setSelectedDate] = useState(dateParam || today);
  const [inputs, setInputs] = useState(emptyInputs);
  const [pendingSections, setPendingSections] = useState(emptyPendingSections);
  const [addTryToTodo, setAddTryToTodo] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editingErrorMessage, setEditingErrorMessage] = useState("");
  const [carryoverDismissed, setCarryoverDismissed] = useState(false);
  const baseRetros = useMemo(() => normalizeRetros(storedRetros), [storedRetros]);
  const syncedRetros = useMemo(() => syncTryWithTodos(baseRetros, todos), [baseRetros, todos]);
  const selectedRetro = syncedRetros.find((retro) => retro.date === selectedDate) ?? createEmptyRetro(selectedDate);
  const sortedRetros = useMemo(() => [...syncedRetros].sort(sortRetrosByDateDesc), [syncedRetros]);
  const searchTerm = normalizeSearchTerm(searchQuery);
  const visibleRetros = searchTerm
    ? sortedRetros.filter((retro) =>
        [
          retro.date,
          ...retro.keep.map((item) => item.text),
          ...retro.problem.map((item) => item.text),
          ...retro.try.map((item) => item.text),
        ].some((value) => value.toLowerCase().includes(searchTerm)),
      )
    : sortedRetros;
  const streak = calculateStreak(syncedRetros, today);
  const weekProgress = getWeekProgress(syncedRetros, today);
  const previousRetro = findPreviousRetro(syncedRetros, today);
  const unfinishedTryItems = getUnfinishedTryItems(previousRetro).filter(
    (item) => !selectedRetro.try.some((todayItem) => todayItem.carriedFrom === item.id),
  );
  const shouldShowCarryover =
    selectedDate === today && !carryoverDismissed && unfinishedTryItems.length > 0 && !hasRetroContent(selectedRetro);

  useEffect(() => {
    if (!dateParam) return;
    setSelectedDate(dateParam);
  }, [dateParam]);

  useEffect(() => {
    setEditingItemId(null);
    setEditingText("");
    setEditingErrorMessage("");
  }, [selectedDate]);

  useEffect(() => {
    if (!saveError) return;

    const clearTimer = window.setTimeout(() => {
      setSaveError(null);
    }, 5000);

    return () => {
      window.clearTimeout(clearTimer);
    };
  }, [saveError]);

  function resolveErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    return "저장에 실패했습니다. 잠시 후 다시 시도해 주세요.";
  }

  function handleInputChange(section: RetroSectionKey, value: string) {
    setInputs((currentInputs) => ({
      ...currentInputs,
      [section]: value,
    }));
  }

  async function handleAddItem(section: RetroSectionKey) {
    if (pendingSections[section]) return;

    const trimmedText = inputs[section].trim();

    if (!trimmedText) {
      setErrorMessage(`${sectionMeta[section].title} 항목을 입력하세요.`);
      return;
    }

    const todo = section === "try" && addTryToTodo ? createTodoFromTry(trimmedText) : null;
    const nextItem: RetroItem = {
      id: createId(),
      text: trimmedText,
      done: false,
      linkedTodoId: todo?.id,
    };

    handleInputChange(section, "");
    setErrorMessage("");
    setPendingSections((currentSections) => ({
      ...currentSections,
      [section]: true,
    }));

    await upsertRetroItems(section, [nextItem]);

    if (todo) {
      setTodos([todo, ...todos]);
      try {
        await createTodo(todo);
        setSaveError(null);
      } catch (error) {
        setSaveError(resolveErrorMessage(error));
      }
    }

    setPendingSections((currentSections) => ({
      ...currentSections,
      [section]: false,
    }));
  }

  function handleStartEditing(item: RetroItem) {
    setEditingItemId(item.id);
    setEditingText(item.text);
    setEditingErrorMessage("");
  }

  function handleCancelEditing() {
    setEditingItemId(null);
    setEditingText("");
    setEditingErrorMessage("");
  }

  async function handleSaveEditing(section: RetroSectionKey, item: RetroItem) {
    const trimmedText = editingText.trim();

    if (!trimmedText) {
      setEditingErrorMessage("내용을 입력해야 저장할 수 있습니다.");
      return;
    }

    const now = new Date().toISOString();
    const safeRetros = normalizeRetros(storedRetros);
    const existingRetro = safeRetros.find((retro) => retro.date === selectedDate);

    if (!existingRetro) {
      handleCancelEditing();
      return;
    }

    const newRetro = {
      ...existingRetro,
      [section]: existingRetro[section].map((currentItem) =>
        currentItem.id === item.id ? { ...currentItem, text: trimmedText } : currentItem,
      ),
      updatedAt: now,
    };
    const newRetros = safeRetros
      .map((retro) => (retro.date === selectedDate ? newRetro : retro))
      .sort(sortRetrosByDateDesc);

    setStoredRetros(newRetros);

    try {
      await saveRetro(newRetro);
      setSaveError(null);
    } catch (error) {
      setSaveError(resolveErrorMessage(error));
    }

    if (section === "try" && item.linkedTodoId) {
      const linkedTodoId = item.linkedTodoId;
      const newTodos = updateLinkedTodoTitle(todos, linkedTodoId, trimmedText);
      setTodos(newTodos);
      try {
        await updateTodoTitle(linkedTodoId, trimmedText);
        setSaveError(null);
      } catch (error) {
        setSaveError(resolveErrorMessage(error));
      }
    }

    handleCancelEditing();
  }

  async function handleCarryOverAll() {
    await upsertRetroItems("try", carryOverTryItems(unfinishedTryItems));
  }

  async function handleCarryOverOne(item: RetroItem) {
    await upsertRetroItems("try", carryOverTryItems([item]));
  }

  async function handleDeleteItem(section: RetroSectionKey, itemId: string) {
    const targetItem = selectedRetro[section].find((item) => item.id === itemId);
    if (!confirmDelete(targetItem?.text ?? `${sectionMeta[section].title} 항목`)) return;

    const now = new Date().toISOString();

    if (editingItemId === itemId) {
      handleCancelEditing();
    }

    if (section === "try" && targetItem?.linkedTodoId) {
      const linkedTodoId = targetItem.linkedTodoId;
      setTodos(todos.filter((todo) => todo.id !== linkedTodoId));
      try {
        await deleteTodo(linkedTodoId);
        setSaveError(null);
      } catch (error) {
        setSaveError(resolveErrorMessage(error));
      }
    }

    const safeRetros = normalizeRetros(storedRetros);
    const existingRetro = safeRetros.find((retro) => retro.date === selectedDate);
    if (!existingRetro) return;

    const newRetro = {
      ...existingRetro,
      [section]: existingRetro[section].filter((item) => item.id !== itemId),
      updatedAt: now,
    };

    if (!hasRetroContent(newRetro)) {
      setStoredRetros(safeRetros.filter((retro) => retro.date !== selectedDate));
      try {
        await deleteRetroByDate(selectedDate);
        setSaveError(null);
      } catch (error) {
        setSaveError(resolveErrorMessage(error));
      }
    } else {
      const newRetros = safeRetros
        .map((retro) => (retro.date === selectedDate ? newRetro : retro))
        .filter(hasRetroContent)
        .sort(sortRetrosByDateDesc);
      setStoredRetros(newRetros);

      try {
        await saveRetro(newRetro);
        setSaveError(null);
      } catch (error) {
        setSaveError(resolveErrorMessage(error));
      }
    }
  }

  async function handleToggleTryItem(itemId: string) {
    const targetItem = selectedRetro.try.find((item) => item.id === itemId);
    const nextDone = !targetItem?.done;
    const now = new Date().toISOString();

    const safeRetros = normalizeRetros(storedRetros);
    const existingRetro = safeRetros.find((retro) => retro.date === selectedDate);
    if (!existingRetro) return;

    const newRetro = {
      ...existingRetro,
      try: existingRetro.try.map((item) =>
        item.id === itemId ? { ...item, done: nextDone } : item,
      ),
      updatedAt: now,
    };
    const newRetros = safeRetros
      .map((retro) => (retro.date === selectedDate ? newRetro : retro))
      .sort(sortRetrosByDateDesc);

    setStoredRetros(newRetros);

    try {
      await saveRetro(newRetro);
      setSaveError(null);
    } catch (error) {
      setSaveError(resolveErrorMessage(error));
    }

    if (targetItem?.linkedTodoId) {
      const linkedTodoId = targetItem.linkedTodoId;
      const nextStatus: TodoStatus = nextDone ? "done" : "todo";
      setTodos(todos.map((todo) => (todo.id === linkedTodoId ? { ...todo, status: nextStatus } : todo)));
      try {
        await updateTodoStatus(linkedTodoId, nextStatus);
        setSaveError(null);
      } catch (error) {
        setSaveError(resolveErrorMessage(error));
      }
    }
  }

  async function handleDeleteRetro(date: string) {
    if (!confirmDelete(`${formatDateLabel(date)} 회고`)) return;

    setStoredRetros(normalizeRetros(storedRetros).filter((retro) => retro.date !== date));

    try {
      await deleteRetroByDate(date);
      setSaveError(null);
    } catch (error) {
      setSaveError(resolveErrorMessage(error));
    }

    if (date === selectedDate) {
      setSelectedDate(today);
    }
  }

  async function upsertRetroItems(section: RetroSectionKey, nextItems: RetroItem[]) {
    if (nextItems.length === 0) return;

    const now = new Date().toISOString();
    const safeRetros = normalizeRetros(storedRetros);
    const existingRetro = safeRetros.find((retro) => retro.date === selectedDate);

    let updatedRetro: KptRetro;
    let newRetros: KptRetro[];

    if (!existingRetro) {
      updatedRetro = {
        ...createEmptyRetro(selectedDate),
        [section]: nextItems,
        createdAt: now,
        updatedAt: now,
      };
      newRetros = [updatedRetro, ...safeRetros].sort(sortRetrosByDateDesc);
    } else {
      updatedRetro = {
        ...existingRetro,
        [section]: [...existingRetro[section], ...nextItems],
        updatedAt: now,
      };
      newRetros = safeRetros
        .map((retro) => (retro.date === selectedDate ? updatedRetro : retro))
        .sort(sortRetrosByDateDesc);
    }

    setStoredRetros(newRetros);
    try {
      await saveRetro(updatedRetro);
      setSaveError(null);
    } catch (error) {
      setSaveError(resolveErrorMessage(error));
    }
    setCarryoverDismissed(false);
  }

  return (
    <div className="space-y-5">
      <section className={`rounded-2xl border border-zinc-800 bg-zinc-900 shadow-soft ${isCompact ? "p-4" : "p-6"}`}>
        <div className={`flex gap-3 ${isCompact ? "flex-col" : "items-start justify-between"}`}>
          <div>
            <h2 className={`font-semibold text-zinc-50 ${isCompact ? "text-2xl" : "text-3xl"}`}>K.P.T 회고</h2>
            {isCompact ? null : <p className="mt-2 text-zinc-500">오늘의 Keep, Problem, Try를 짧게 남깁니다.</p>}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/retros/weekly"
              className="flex h-11 items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-3 text-sm font-medium text-emerald-300 hover:bg-emerald-400/15"
            >
              주간 보기
              <ArrowRight className="h-4 w-4" />
            </Link>
            <label className="flex h-11 items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/70 px-3 text-sm text-zinc-300">
              <CalendarDays className="h-4 w-4 text-zinc-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value || today)}
                className="bg-transparent text-sm text-zinc-100 outline-none"
                aria-label="회고 날짜"
              />
            </label>
            {syncedRetros.some((retro) => retro.date === selectedDate) ? (
              <button
                type="button"
                onClick={() => handleDeleteRetro(selectedDate)}
                className="flex h-11 items-center gap-2 rounded-2xl border border-zinc-800 px-3 text-sm text-zinc-400 hover:border-red-400/40 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
                전체 삭제
              </button>
            ) : null}
          </div>
        </div>

        <div className={`mt-5 grid gap-3 ${isCompact ? "grid-cols-2" : "grid-cols-5"}`}>
          <SummaryBox label="Keep" value={selectedRetro.keep.length} />
          <SummaryBox label="Problem" value={selectedRetro.problem.length} />
          <SummaryBox label="Try 완료" value={selectedRetro.try.filter((item) => item.done).length} />
          <SummaryBox label="연속 작성" value={streak} suffix="일" />
          <SummaryBox label="이번 주" value={weekProgress.written} suffix={`/${weekProgress.total}`} />
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-400">
          <Flame className="h-4 w-4 text-emerald-300" />
          <span>{streak > 0 ? `${streak}일 연속 작성 중` : "오늘 첫 회고를 작성하면 streak가 시작됩니다."}</span>
        </div>

        {errorMessage ? <p className="mt-4 text-sm text-red-300">{errorMessage}</p> : null}
        {saveError ? <p className="mt-2 text-sm text-red-300">{saveError}</p> : null}
      </section>

      {shouldShowCarryover ? (
        <section className="rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-amber-200">이전 회고에서 못 끝낸 Try {unfinishedTryItems.length}개</h3>
              <p className="mt-1 text-sm text-amber-100/70">{previousRetro ? formatDateLabel(previousRetro.date) : ""} 항목을 오늘로 이월할 수 있습니다.</p>
            </div>
            <button type="button" onClick={() => setCarryoverDismissed(true)} className="text-sm text-amber-100/70 hover:text-amber-100">
              닫기
            </button>
          </div>
          <div className="mt-4 space-y-2">
            {unfinishedTryItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-amber-300/15 bg-zinc-950/40 px-3 py-2">
                <span className="min-w-0 break-words text-sm text-amber-50">{item.text}</span>
                <button
                  type="button"
                  onClick={() => handleCarryOverOne(item)}
                  className="shrink-0 rounded-full border border-amber-300/25 px-3 py-1 text-xs text-amber-100 hover:bg-amber-300/10"
                >
                  이월
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleCarryOverAll}
            className="mt-4 flex h-10 items-center gap-2 rounded-2xl bg-amber-300 px-4 text-sm font-semibold text-zinc-950 hover:bg-amber-200"
          >
            <RotateCcw className="h-4 w-4" />
            이번에 이월
          </button>
        </section>
      ) : null}

      <section className={`grid gap-4 ${isCompact ? "" : "xl:grid-cols-3"}`}>
        {(["keep", "problem", "try"] as const).map((section) => (
          <RetroSection
            key={section}
            section={section}
            items={selectedRetro[section]}
            inputValue={inputs[section]}
            isAddPending={pendingSections[section]}
            addTryToTodo={addTryToTodo}
            isCompact={isCompact}
            editingItemId={editingItemId}
            editingText={editingText}
            editingErrorMessage={editingErrorMessage}
            onInputChange={(value) => handleInputChange(section, value)}
            onToggleAddTryToTodo={setAddTryToTodo}
            onAdd={() => handleAddItem(section)}
            onDelete={(itemId) => handleDeleteItem(section, itemId)}
            onToggleTry={handleToggleTryItem}
            onStartEditing={handleStartEditing}
            onEditingTextChange={setEditingText}
            onSaveEditing={(item) => handleSaveEditing(section, item)}
            onCancelEditing={handleCancelEditing}
          />
        ))}
      </section>

      <section className={`rounded-2xl border border-zinc-800 bg-zinc-900 shadow-soft ${isCompact ? "p-4" : "p-6"}`}>
        <h3 className="text-xl font-semibold text-zinc-50">과거 회고</h3>
        <div className="mt-5 space-y-3">
          {visibleRetros.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 text-sm text-zinc-500">
              {syncedRetros.length === 0 ? "아직 저장된 회고가 없습니다." : `"${searchQuery}" 검색 결과가 없습니다.`}
            </div>
          ) : null}

          {visibleRetros.map((retro) => {
            const doneTryCount = retro.try.filter((item) => item.done).length;
            const isSelected = retro.date === selectedDate;

            return (
              <article
                key={retro.id}
                className={`rounded-2xl border bg-zinc-950/70 p-4 ${
                  isSelected ? "border-emerald-400/35" : "border-zinc-800"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <button type="button" onClick={() => setSelectedDate(retro.date)} className="min-w-0 flex-1 text-left">
                    <h4 className="font-medium text-zinc-100">{formatDateLabel(retro.date)}</h4>
                    <p className="mt-2 text-sm text-zinc-500">
                      K {retro.keep.length} / P {retro.problem.length} / T {retro.try.length} ({doneTryCount} 완료)
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteRetro(retro.date)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-800 text-zinc-500 hover:border-red-400/40 hover:text-red-300"
                    aria-label="회고 삭제"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function RetroSection({
  section,
  items,
  inputValue,
  isAddPending,
  addTryToTodo,
  isCompact,
  editingItemId,
  editingText,
  editingErrorMessage,
  onInputChange,
  onToggleAddTryToTodo,
  onAdd,
  onDelete,
  onToggleTry,
  onStartEditing,
  onEditingTextChange,
  onSaveEditing,
  onCancelEditing,
}: {
  section: RetroSectionKey;
  items: RetroItem[];
  inputValue: string;
  isAddPending: boolean;
  addTryToTodo: boolean;
  isCompact: boolean;
  editingItemId: string | null;
  editingText: string;
  editingErrorMessage: string;
  onInputChange: (value: string) => void;
  onToggleAddTryToTodo: (value: boolean) => void;
  onAdd: () => void;
  onDelete: (itemId: string) => void;
  onToggleTry: (itemId: string) => void;
  onStartEditing: (item: RetroItem) => void;
  onEditingTextChange: (value: string) => void;
  onSaveEditing: (item: RetroItem) => void;
  onCancelEditing: () => void;
}) {
  const meta = sectionMeta[section];

  function handleAddKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      onAdd();
    }
  }

  return (
    <article className={`rounded-2xl border border-zinc-800 bg-zinc-900 shadow-soft ${isCompact ? "p-4" : "p-5"}`}>
      <div>
        <h3 className="text-lg font-semibold text-zinc-50">{meta.title}</h3>
        <p className="mt-1 text-sm text-zinc-500">{meta.helper}</p>
      </div>

      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-3 text-sm text-zinc-500">아직 항목이 없습니다.</div>
        ) : null}

        {items.map((item) => {
          const isEditing = editingItemId === item.id;

          return (
          <div key={item.id} className="flex items-start gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-3">
            {section === "try" ? (
              <button
                type="button"
                onClick={() => onToggleTry(item.id)}
                className="mt-0.5 text-zinc-500 hover:text-emerald-300"
                aria-label={item.done ? "Try 미완료로 변경" : "Try 완료로 변경"}
              >
                {item.done ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <Circle className="h-4 w-4" />}
              </button>
            ) : null}
            <div className="min-w-0 flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    value={editingText}
                    onChange={(event) => onEditingTextChange(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        event.preventDefault();
                        onCancelEditing();
                      }

                      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                        event.preventDefault();
                        onSaveEditing(item);
                      }
                    }}
                    rows={3}
                    className="min-h-24 w-full resize-y rounded-2xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm leading-6 text-zinc-100 outline-none focus:border-emerald-400/40"
                    autoFocus
                  />
                  {editingErrorMessage ? <p className="text-xs text-red-300">{editingErrorMessage}</p> : null}
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={onCancelEditing}
                      className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-400 hover:text-zinc-100"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={() => onSaveEditing(item)}
                      className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-semibold text-zinc-950 hover:bg-emerald-300"
                    >
                      저장
                    </button>
                  </div>
                </div>
              ) : (
                <>
              <p className={`whitespace-pre-wrap break-words text-sm leading-6 ${item.done ? "text-zinc-500 line-through" : "text-zinc-200"}`}>
                {item.text}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {item.carriedFrom ? <span className="rounded-full bg-amber-400/10 px-2 py-1 text-xs text-amber-200">이월</span> : null}
                {item.linkedTodoId ? <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-xs text-emerald-300">Todo 연동</span> : null}
              </div>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => onStartEditing(item)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-900 hover:text-emerald-300"
              aria-label={`${meta.title} 항목 편집`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-900 hover:text-red-300"
              aria-label={`${meta.title} 항목 삭제`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          );
        })}
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex gap-2">
          <textarea
            value={inputValue}
            onChange={(event) => onInputChange(event.target.value)}
            onKeyDown={handleAddKeyDown}
            rows={3}
            className="min-h-24 min-w-0 flex-1 resize-y rounded-2xl border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm leading-6 text-zinc-100 outline-none placeholder:text-zinc-600"
            placeholder={meta.placeholder}
          />
          <button
            type="button"
            onClick={onAdd}
            disabled={isAddPending}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-400 text-zinc-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
            aria-label={`${meta.title} 항목 추가`}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {section === "try" ? (
          <label className="flex items-center gap-2 text-sm text-zinc-400">
            <input
              type="checkbox"
              checked={addTryToTodo}
              onChange={(event) => onToggleAddTryToTodo(event.target.checked)}
              className="h-4 w-4 accent-emerald-400"
            />
            Todo로도 추가
          </label>
        ) : null}
      </div>
    </article>
  );
}

function SummaryBox({ label, value, suffix = "" }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-zinc-50">
        {value}
        {suffix ? <span className="ml-1 text-sm text-zinc-500">{suffix}</span> : null}
      </p>
    </div>
  );
}
