"use client";

import { useState } from "react";
import { Send, Trash2 } from "lucide-react";
import { notes } from "@/data/mockData";
import { useCompactMode } from "@/contexts/CompactModeContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Note } from "@/types";

const quickTags = ["구매목표", "인사이트", "구독", "나중에"];

export function NotesInboxView() {
  const { isCompact } = useCompactMode();
  const [items, setItems] = useLocalStorage<Note[]>("aiop:notes", notes);
  const [body, setBody] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  function handleToggleTag(tag: string) {
    setSelectedTags((prevTags) => (prevTags.includes(tag) ? prevTags.filter((item) => item !== tag) : [...prevTags, tag]));
  }

  function handleAdd() {
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
  }

  function handleDelete(id: string) {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  }

  return (
    <div className={`grid gap-4 ${isCompact ? "" : "xl:grid-cols-[0.95fr_1.05fr] xl:gap-6"}`}>
      <section className={`rounded-2xl border border-zinc-800 bg-zinc-900 shadow-soft ${isCompact ? "p-4" : "p-6"}`}>
        <h2 className={`font-semibold text-zinc-50 ${isCompact ? "text-2xl" : "text-3xl"}`}>빠른 기록</h2>
        {isCompact ? null : <p className="mt-2 text-zinc-500">분류하기 전의 생각을 빠르게 받아두는 공간입니다.</p>}
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
        <div className="mt-5 space-y-3">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 text-sm text-zinc-500">
              등록된 노트가 없습니다. 빠르게 떠오른 생각을 왼쪽 입력창에 남겨두세요.
            </div>
          ) : null}
          {items.map((item) => (
            <article key={item.id} className={`rounded-2xl border border-zinc-800 bg-zinc-950/70 ${isCompact ? "p-3" : "p-4"}`}>
              <div className="flex items-start justify-between gap-4">
                <h4 className="min-w-0 truncate font-medium text-zinc-100">{item.title || getNotePreview(item.body)}</h4>
                <div className="flex shrink-0 items-center gap-2">
                  {isCompact ? null : <span className="text-xs text-zinc-500">{item.createdAt}</span>}
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
          ))}
        </div>
      </section>
    </div>
  );
}

function getNoteId() {
  return crypto.randomUUID?.() ?? Date.now().toString();
}

function getNotePreview(body: string) {
  const firstLine = body.split("\n")[0]?.trim();
  if (!firstLine) return "제목 없는 노트";
  return firstLine.length > 36 ? `${firstLine.slice(0, 36)}...` : firstLine;
}

function formatCreatedAt(date: Date) {
  return `오늘 ${date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })}`;
}
