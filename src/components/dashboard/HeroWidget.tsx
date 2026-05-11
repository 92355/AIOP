"use client";

import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { useCompactMode } from "@/contexts/CompactModeContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const HERO_MESSAGE_STORAGE_KEY = "aiop:hero-message";
const DEFAULT_HERO_MESSAGE = "나만의 컨트롤 센터";

export function HeroWidget() {
  const { isCompact } = useCompactMode();
  const [heroMessage, setHeroMessage] = useLocalStorage(HERO_MESSAGE_STORAGE_KEY, DEFAULT_HERO_MESSAGE);
  const [draftMessage, setDraftMessage] = useState(heroMessage);
  const [isEditing, setIsEditing] = useState(false);

  function handleStartEdit() {
    setDraftMessage(heroMessage);
    setIsEditing(true);
  }

  function handleSave() {
    const nextMessage = draftMessage.trim();
    if (!nextMessage) return;

    setHeroMessage(nextMessage);
    setIsEditing(false);
  }

  function handleCancel() {
    setDraftMessage(heroMessage);
    setIsEditing(false);
  }

  return (
    <div className={`h-full rounded-2xl border border-zinc-800 bg-zinc-900 shadow-soft ${isCompact ? "p-4" : "p-6"}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm uppercase tracking-[0.28em] text-emerald-300">AIOP</p>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={!draftMessage.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-400/30 text-emerald-300 transition hover:bg-emerald-400/10 disabled:cursor-not-allowed disabled:border-zinc-800 disabled:text-zinc-600 disabled:hover:bg-transparent"
              aria-label="Hero 문구 저장"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800 text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-100"
              aria-label="Hero 문구 편집 취소"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleStartEdit}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800 text-zinc-400 transition hover:border-emerald-400/30 hover:text-emerald-300"
            aria-label="Hero 문구 편집"
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="mt-3 flex h-[calc(100%-2rem)] flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <input
              value={draftMessage}
              onChange={(event) => setDraftMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSave();
                if (event.key === "Escape") handleCancel();
              }}
              className={`w-full rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 font-semibold text-zinc-50 outline-none transition focus:border-emerald-400/50 ${isCompact ? "text-2xl" : "text-4xl"}`}
              maxLength={48}
              autoFocus
            />
          ) : (
            <h2 className={`break-words font-semibold text-zinc-50 ${isCompact ? "text-2xl" : "text-4xl"}`}>{heroMessage}</h2>
          )}
          <p className={`mt-3 max-w-2xl text-zinc-400 ${isCompact ? "hidden" : ""}`}>
            필요한 기능을 하나의 페이지에서 관리하고, 매일 확인해야 할 선택을 빠르게 정리합니다.
          </p>
        </div>
        <div className={`rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200 ${isCompact ? "hidden" : ""}`}>
          오늘은 구매 판단 2개와 구독 리뷰 1개를 보면 충분합니다.
        </div>
      </div>
    </div>
  );
}
