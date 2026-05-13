"use client";

import { useState } from "react";
import { Archive, CheckCircle2, Inbox, ListTodo, Send, Trash2 } from "lucide-react";
import { useCompactMode } from "@/contexts/CompactModeContext";
import { useSearchContext, normalizeSearchTerm } from "@/contexts/SearchContext";
import { confirmDelete } from "@/lib/confirmDelete";
import { getNoteStatusLabel } from "@/lib/labels";
import { createNote, deleteNote, updateNoteStatus } from "@/app/notes/actions";
import { createTodo } from "@/app/todos/actions";
import type { Note, NoteStatus, TodoItem } from "@/types";

const quickTags = ["구매목표", "인사이트", "구독", "나중에"];
const statusFilters: Array<"all" | NoteStatus> = ["all", "inbox", "processed", "archived"];

function getNextStatus(status: NoteStatus | undefined): NoteStatus {
  if (status === "inbox" || status === undefined) return "processed";
  if (status === "processed") return "archived";
  return "inbox";
}

function getStatusIcon(status: NoteStatus | undefined) {
  if (status === "processed") return <CheckCircle2 className="h-4 w-4" />;
  if (status === "archived") return <Archive className="h-4 w-4" />;
  return <Inbox className="h-4 w-4" />;
}

function getStatusClassName(status: NoteStatus | undefined) {
  if (status === "processed") return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
  if (status === "archived") return "border-zinc-700 bg-zinc-900 text-zinc-400";
  return "border-zinc-800 bg-zinc-950/70 text-zinc-300";
}

export function NotesInboxView({ initialItems }: { initialItems: Note[] }) {
  const { isCompact } = useCompactMode();
  const { searchQuery } = useSearchContext();
  const [items, setItems] = useState<Note[]>(initialItems);
  const [body, setBody] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statusFilters)[number]>("all");
  const [todoAddedNoteIds, setTodoAddedNoteIds] = useState<string[]>([]);
  const searchTerm = normalizeSearchTerm(searchQuery);
  const filteredItems = items.filter((item) => {
    if (statusFilter !== "all" && (item.status ?? "inbox") !== statusFilter) return false;
    if (!searchTerm) return true;
    const haystacks = [item.body, item.title ?? "", ...item.tags].map((value) => value.toLowerCase());
    return haystacks.some((value) => value.includes(searchTerm));
  });

  function handleToggleTag(tag: string) {
    setSelectedTags((prevTags) => (prevTags.includes(tag) ? prevTags.filter((item) => item !== tag) : [...prevTags, tag]));
  }

  async function handleAdd() {
    const trimmedBody = body.trim();
    if (!trimmedBody) {
      setErrorMessage("내용을 입력해 주세요.");
      return;
    }

    const nextItem: Note = {
      id: getNoteId(),
      body: trimmedBody,
      tags: selectedTags,
      createdAt: formatCreatedAt(new Date()),
      status: "inbox",
    };

    setItems((prevItems) => [nextItem, ...prevItems]);
    setBody("");
    setSelectedTags([]);
    setErrorMessage("");
    await createNote(nextItem);
  }

  async function handleDelete(id: string) {
    const targetItem = items.find((item) => item.id === id);
    if (!confirmDelete(targetItem?.title ?? getNotePreview(targetItem?.body ?? "") ?? "노트")) return;

    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    await deleteNote(id);
  }

  async function handleCycleStatus(id: string) {
    const nextStatus = getNextStatus(items.find((item) => item.id === id)?.status);
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, status: nextStatus } : item)),
    );
    await updateNoteStatus(id, nextStatus);
  }

  async function handleAddToTodo(note: Note) {
    const nextTodo: TodoItem = {
      id: getTodoId(),
      title: getTodoTitleFromNote(note),
      memo: getTodoMemoFromNote(note),
      status: "todo",
      priority: "medium",
      createdAt: formatCreatedAt(new Date()),
    };

    setTodoAddedNoteIds((prevIds) => (prevIds.includes(note.id) ? prevIds : [...prevIds, note.id]));
    await createTodo(nextTodo);
  }

  return (
    <div className={`grid gap-4 ${isCompact ? "" : "xl:grid-cols-[0.95fr_1.05fr] xl:gap-6"}`}>
      <section className={`rounded-2xl border border-zinc-800 bg-zinc-900 shadow-soft ${isCompact ? "p-4" : "p-6"}`}>
        <h2 className={`font-semibold text-zinc-50 ${isCompact ? "text-2xl" : "text-3xl"}`}>빠른 기록</h2>
        {isCompact ? null : <p className="mt-2 text-zinc-500">생각 나는거 막 적어 그냥 막 </p>}
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          className={`w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 text-sm leading-6 text-zinc-200 outline-none placeholder:text-zinc-600 ${isCompact ? "mt-4 min-h-40" : "mt-6 min-h-64"}`}
          placeholder="사고 싶은 것, 책에서 본 문장, 나중에 정리할 생각..."
        />
        {errorMessage ? <p className="mt-3 text-sm text-red-300">{errorMessage}</p> : null}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
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
          <button type="button" onClick={handleAdd} className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 text-sm font-semibold text-zinc-950 hover:bg-emerald-300">
            <Send className="h-4 w-4" />
            기록
          </button>
        </div>
      </section>
      <section className={`rounded-2xl border border-zinc-800 bg-zinc-900 shadow-soft ${isCompact ? "p-4" : "p-6"}`}>
        <h3 className="text-xl font-semibold text-zinc-50">최근 노트</h3>
        {isCompact ? null : <p className="mt-1 text-sm text-zinc-500">나중에 구매 목표, 인사이트, 구독 관리로 연결할 수 있습니다.</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                statusFilter === filter
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                  : "border-zinc-800 text-zinc-400 hover:text-zinc-100"
              }`}
            >
              {filter === "all" ? "전체" : getNoteStatusLabel(filter)}
            </button>
          ))}
        </div>
        <div className="mt-5 space-y-3">
          {filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 text-sm text-zinc-500">
              {items.length === 0
                ? "등록된 노트가 없습니다. 빠르게 떠오른 생각을 왼쪽 입력창에 남겨두세요."
                : searchTerm
                  ? `"${searchQuery}" 검색 결과가 없습니다.`
                  : "선택한 상태에 해당하는 노트가 없습니다."}
            </div>
          ) : null}
          {filteredItems.map((item) => {
            const currentStatus = item.status ?? "inbox";

            return (
            <article key={item.id} className={`rounded-2xl border border-zinc-800 bg-zinc-950/70 ${isCompact ? "p-3" : "p-4"}`}>
              <div className="flex items-start justify-between gap-4">
                <h4 className="min-w-0 truncate font-medium text-zinc-100">{item.title || getNotePreview(item.body)}</h4>
                <div className="flex shrink-0 items-center gap-2">
                  {isCompact ? null : <span className="text-xs text-zinc-500">{formatRecentNoteDateTime(item.createdAt)}</span>}
                  <button
                    type="button"
                    onClick={() => handleAddToTodo(item)}
                    aria-label="메모를 Todo에 추가"
                    title="Todo에 추가"
                    className={`flex h-8 items-center gap-1 rounded-full border px-2 transition ${
                      todoAddedNoteIds.includes(item.id)
                        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                        : "border-zinc-800 text-zinc-400 hover:border-emerald-400/40 hover:text-emerald-300"
                    }`}
                  >
                    <ListTodo className="h-4 w-4" />
                    <span className="text-xs">{todoAddedNoteIds.includes(item.id) ? "추가됨" : "Todo 추가"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCycleStatus(item.id)}
                    aria-label={`노트 상태 변경 (현재: ${getNoteStatusLabel(currentStatus)})`}
                    title={`다음 상태: ${getNoteStatusLabel(getNextStatus(currentStatus))}`}
                    className={`flex h-8 items-center gap-1 rounded-full border px-2 transition ${getStatusClassName(currentStatus)}`}
                  >
                    {getStatusIcon(currentStatus)}
                    <span className="text-xs">{getNoteStatusLabel(currentStatus)}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    aria-label="노트 삭제"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800 text-zinc-500 hover:border-red-400/40 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className={`mt-2 text-sm leading-6 text-zinc-400 ${isCompact ? "line-clamp-2" : "line-clamp-3"}`}>{item.body}</p>
              <div className={`mt-3 flex flex-wrap gap-2 ${isCompact ? "max-h-7 overflow-hidden" : ""}`}>
                {item.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-400">#{tag}</span>
                ))}
              </div>
            </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function getNoteId() {
  return crypto.randomUUID?.() ?? Date.now().toString();
}

function getTodoId() {
  return `todo-${crypto.randomUUID?.() ?? Date.now().toString()}`;
}

function getNotePreview(body: string) {
  const firstLine = body.split("\n")[0]?.trim();
  if (!firstLine) return "제목 없는 노트";
  return firstLine.length > 36 ? `${firstLine.slice(0, 36)}...` : firstLine;
}

function getTodoTitleFromNote(note: Note) {
  return note.title?.trim() || getNotePreview(note.body);
}

function getTodoMemoFromNote(note: Note) {
  const trimmedBody = note.body.trim();
  return trimmedBody.length > 0 ? trimmedBody : undefined;
}

function formatCreatedAt(date: Date) {
  return formatRecentNoteDateTime(date);
}

function formatRecentNoteDateTime(dateOrString: Date | string) {
  const date = typeof dateOrString === "string" ? new Date(dateOrString) : dateOrString;
  if (Number.isNaN(date.getTime())) return typeof dateOrString === "string" ? dateOrString : "";

  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}  ${hour}:${minute}`;
}
